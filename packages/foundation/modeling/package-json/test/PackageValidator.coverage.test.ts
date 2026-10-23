import { PackageValidationError } from "@beep/package-json/PackageValidator";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

describe("validator pathless diagnostic", () => {
  it.effect("renders a rule without an invented field path", () =>
    Effect.sync(() => {
      const error = PackageValidationError.make({
        failures: [{ rule: "no-local", message: "local dependency", path: O.none() }],
      });
      assert.strictEqual(error.message, "package.json validation failed:\n  - [no-local]: local dependency");
    })
  );
});
