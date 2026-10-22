import * as Package from "@beep/epistemics";
import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("@beep/epistemics", () => {
  it.effect("resolves the package entry point through its alias", () =>
    Effect.sync(() => {
      expect(Package).toBeTypeOf("object");
    })
  );
});
