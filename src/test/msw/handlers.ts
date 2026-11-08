import type { RequestHandler } from "msw";

/**
 * Default handlers shared by all tests. Feature tests add their own with
 * server.use(...) so each test states the API responses it depends on.
 */
export const handlers: RequestHandler[] = [];
