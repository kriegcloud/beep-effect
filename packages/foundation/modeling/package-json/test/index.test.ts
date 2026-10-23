import * as Package from "@beep/package-json";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("@beep/package-json", () => {
  it.effect("resolves the package entry point through its alias", () =>
    Effect.sync(() => {
      expect(Package).toBeTypeOf("object");
    })
  );
});
