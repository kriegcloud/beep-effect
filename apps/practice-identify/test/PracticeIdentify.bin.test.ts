import { expect, it } from "@effect/vitest";
import { vi } from "vitest";

const runtime = vi.hoisted(() => ({ runMain: vi.fn() }));
vi.mock("@effect/platform-bun", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@effect/platform-bun")>();
  return { ...actual, BunRuntime: { ...actual.BunRuntime, runMain: runtime.runMain } };
});

it("imports the executable without starting a runtime or reading private inputs", async () => {
  await import("@/bin");
  expect(runtime.runMain).not.toHaveBeenCalled();
});
