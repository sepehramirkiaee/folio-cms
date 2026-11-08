# syntax=docker/dockerfile:1.7

# folio-cms production image.
# Stages: base -> deps -> builder -> migrator -> runner, plus a dev stage
# used by docker-compose.dev.yml for hot reload.

ARG NODE_VERSION=24

# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
# openssl lets the Prisma CLI pick the right migration engine on Alpine.
RUN apk add --no-cache openssl libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------------------------------------------------------------------------
# Install all dependencies. The postinstall hook runs `prisma generate`, so the
# schema and config must be present first.
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------------------------------------------------------------------------
# Development image: source is bind-mounted by docker-compose.dev.yml.
FROM deps AS dev
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]

# ---------------------------------------------------------------------------
# Build the standalone Next.js server. No database or secrets are needed here.
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/src/generated ./src/generated
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# The Prisma CLI (for `migrate deploy`) and the pg driver adapter (for the
# seed scripts). The standalone output only holds what the app bundle traced,
# which covers the Prisma client runtime but not these two. Versions come from
# the lockfile so they always match the app. Peer dependencies are skipped
# because the CLI does not need TypeScript at runtime.
FROM base AS migrator
WORKDIR /migrator
COPY package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    PKGS=$(node -e ' \
      const lock = require("./package-lock.json").packages; \
      const v = (n) => n + "@" + lock["node_modules/" + n].version; \
      console.log(["prisma", "@prisma/adapter-pg"].map(v).join(" "));') \
    && echo '{"name":"migrator","private":true}' > package.json \
    && npm install --omit=dev --legacy-peer-deps --no-audit --no-fund $PKGS

# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# Standalone server, static assets and public files.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma CLI and driver adapter, merged over the traced node_modules.
COPY --from=migrator --chown=nextjs:nodejs /migrator/node_modules ./node_modules

# Migrations and the seed scripts. They run on Node's native TypeScript
# support, so they ship as source together with the generated client.
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
COPY --from=builder --chown=nextjs:nodejs /app/src/lib ./src/lib
COPY --chown=nextjs:nodejs --chmod=755 docker/entrypoint.sh ./entrypoint.sh

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null || exit 1

ENTRYPOINT ["./entrypoint.sh"]
