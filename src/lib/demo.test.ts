import { afterEach, describe, expect, it, vi } from "vitest";
import { assertDemoCapacity, DEMO_LIMITS } from "./demo";

const count = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({
  getDb: () => ({
    project: { count },
    experience: { count },
    skill: { count },
    contactMessage: { count },
  }),
}));

describe("assertDemoCapacity", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    count.mockReset();
  });

  it("does nothing outside demo mode, without querying", async () => {
    vi.stubEnv("DEMO_MODE", "false");
    await expect(assertDemoCapacity("project")).resolves.toBeUndefined();
    expect(count).not.toHaveBeenCalled();
  });

  it("allows creates below the limit in demo mode", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    count.mockResolvedValue(DEMO_LIMITS.project - 1);
    await expect(assertDemoCapacity("project")).resolves.toBeUndefined();
  });

  it("blocks creates at the limit with a clear message", async () => {
    vi.stubEnv("DEMO_MODE", "true");
    count.mockResolvedValue(DEMO_LIMITS.skill);
    await expect(assertDemoCapacity("skill")).rejects.toMatchObject({
      code: "DEMO_PROTECTED",
      status: 403,
      message: `The demo holds at most ${DEMO_LIMITS.skill} skills. It resets every night.`,
    });
  });
});
