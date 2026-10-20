import { it } from "@beep/test-runner";
import { expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { createRoot } from "react-dom/client";
import { describe, vi } from "vitest";

vi.mock("react-dom/client", () => ({
  createRoot: vi.fn(() => ({ render: vi.fn() })),
}));

describe("browser startup", () => {
  it.effect("mounts only when the root element exists", () =>
    Effect.gen(function* () {
      vi.resetModules();
      vi.clearAllMocks();
      document.body.replaceChildren();

      yield* Effect.promise(() => import("../src/main.tsx"));
      expect(createRoot).not.toHaveBeenCalled();

      const container = document.createElement("div");
      container.id = "root";
      document.body.append(container);
      vi.resetModules();

      yield* Effect.promise(() => import("../src/main.tsx"));

      expect(createRoot).toHaveBeenCalledExactlyOnceWith(container);
      expect(vi.mocked(createRoot).mock.results[0]?.value.render).toHaveBeenCalledExactlyOnceWith(expect.anything());
    }).pipe(Effect.ensuring(Effect.sync(() => document.body.replaceChildren())))
  );
});
