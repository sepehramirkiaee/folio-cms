import { contactSchema } from "@/features/contact/schemas/contact";
import { submitContactMessage } from "@/features/contact/server/contact";
import { ApiError } from "@/lib/api/errors";
import { parseBody, withErrors } from "@/lib/api/handler";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Five messages per visitor per 10 minutes.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

export const POST = withErrors(async (req) => {
  if (!limiter.take(clientIp(req))) {
    throw new ApiError("RATE_LIMITED", "Too many messages. Please try again in a few minutes.");
  }
  await submitContactMessage(await parseBody(req, contactSchema));
  return { sent: true };
});
