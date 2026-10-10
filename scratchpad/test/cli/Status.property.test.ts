import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { assert, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { CoreStatusName, Status } from "../../effected/cli/Status.ts";

const runs = { arbitrary: fcRuns(100) };

it.effect.prop("CoreStatusName encodes and decodes without failure or loss", [Arbitrary.schema(CoreStatusName)], ([value]) =>
  Effect.gen(function* () {
    const encoded = yield* S.encodeEffect(CoreStatusName)(value);
    const decoded = yield* S.decodeEffect(CoreStatusName)(encoded);
    assertTrue(S.toEquivalence(CoreStatusName)(decoded, value));
    assert.deepStrictEqual(yield* S.encodeEffect(CoreStatusName)(decoded), encoded);
  }), runs);

it.effect.prop("status snapshots preserve definitions and select their original name", [Arbitrary.schema(CoreStatusName)], ([name]) => Effect.sync(() => {
  const snapshot = Status.core.resolve(name);
  assert.deepStrictEqual(snapshot, Status.core.def(name));
  assert.notStrictEqual(snapshot, Status.core.def(name));
  assert.strictEqual(Status.core.worst([name, name]), name);
}), runs);
