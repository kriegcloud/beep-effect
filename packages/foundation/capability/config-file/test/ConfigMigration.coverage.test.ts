import { ConfigMigrationError, VersionAccess } from "@beep/config-file/ConfigMigration";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as Str from "effect/String";

describe("migration version stamping", () => {
  it.effect("stamps object, nonempty text, empty text and primitive migration outputs", () =>
    Effect.gen(function* () {
      assert.deepStrictEqual<unknown>(yield* VersionAccess.default.set({ retained: 1 }, 2), {
        retained: 1,
        version: 2,
      });
      assert.deepStrictEqual<unknown>(yield* VersionAccess.default.set("ab", 2), { 0: "a", 1: "b", version: 2 });
      assert.deepStrictEqual<unknown>(yield* VersionAccess.default.set("", 2), { version: 2 });
      assert.deepStrictEqual<unknown>(yield* VersionAccess.default.set(42, 2), { version: 2 });
      assert.strictEqual(
        ConfigMigrationError.make({ version: 0, migration: "", phase: "read-version", cause: "missing" }).message,
        "Failed to read the config version"
      );
      assert.strictEqual(
        ConfigMigrationError.make({ version: 2, migration: "stamp", phase: "write-version", cause: "failure" }).message,
        'Migration "stamp" (v2) failed during write-version'
      );
    })
  );
});

import { ConfigMigration } from "@beep/config-file/ConfigMigration";
import * as S from "effect/Schema";

it.effect("the static migration facade is constructible and numeric error versions round-trip at domain edges", () =>
  Effect.gen(function* () {
    assert.isTrue(Reflect.construct(ConfigMigration, []) instanceof ConfigMigration);
    for (const version of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const error = ConfigMigrationError.make({ version, migration: "edge", phase: "apply", cause: "failure" });
      const encoded = yield* S.encodeEffect(ConfigMigrationError)(error);
      assert.isTrue(S.toEquivalence(ConfigMigrationError)(yield* S.decodeEffect(ConfigMigrationError)(encoded), error));
    }
  })
);

it.effect("the default version reader rejects primitive documents with a structured reason", () =>
  Effect.gen(function* () {
    const error = yield* Effect.flip(VersionAccess.default.get(null));
    assert.strictEqual(error.message, "config is not an object");
    const textError = yield* Effect.flip(VersionAccess.default.get("not an object"));
    assert.strictEqual(textError.message, "config is not an object");
  })
);

it.effect("the failing step is carried on `migration`, so `name` and `String(error)` keep the error type", () =>
  Effect.gen(function* () {
    // Conformance shift (W3-e, D-24 precedent): the lab payload field `name`
    // shadowed `Error.name`, so logs printed the step name instead of the type.
    const error = ConfigMigrationError.make({ version: 2, migration: "add-b", phase: "apply", cause: "failure" });
    assert.strictEqual(error.migration, "add-b");
    assert.notStrictEqual(error.name, "add-b");
    assert.isFalse(Str.startsWith("add-b")(String(error)));
    const encoded = yield* S.encodeEffect(ConfigMigrationError)(error);
    assert.deepStrictEqual(A.sort(R.keys(encoded), Order.String), ["_tag", "cause", "migration", "phase", "version"]);
  })
);
