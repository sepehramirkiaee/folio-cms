import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // This repo ships its own CLAUDE.md, so skip the generated AGENTS.md.
  agentRules: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
