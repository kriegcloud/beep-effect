import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { vi } from "vitest";

const runtime = vi.hoisted(() => ({ runMain: vi.fn() }));
vi.mock("@effect/platform-bun", (importOriginal) =>
  importOriginal<typeof import("@effect/platform-bun")>().then((actual) => ({
    ...actual,
    BunRuntime: { ...actual.BunRuntime, runMain: runtime.runMain },
  }))
);

it.effect("imports the executable without starting a runtime or reading private inputs", () =>
  Effect.gen(function* () {
    yield* Effect.promise(() => import("@/bin"));
    expect(runtime.runMain).not.toHaveBeenCalled();
  })
);
