import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import * as Node from "@beep/toml/TomlNode";
import * as Model from "@beep/toml/TomlVisitor";
import { TomlVisitor } from "@beep/toml/TomlVisitor";
import { assert, describe, it } from "@effect/vitest";
import { assertTrue } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";

const runs = { arbitrary: fcRuns(100) };
const roundTrips = <T, E>(name: string, schema: S.Codec<T, E>): void => {
  it.effect.prop(
    name,
    [Arbitrary.schema(schema)],
    ([value]) =>
      Effect.gen(function* () {
        const encoded = yield* S.encodeEffect(schema)(value);
        const decoded = yield* S.decodeEffect(schema)(encoded);
        assertTrue(S.toEquivalence(schema)(value, decoded));
        assert.deepStrictEqual(yield* S.encodeEffect(schema)(decoded), encoded);
      }),
    runs
  );
};
describe("schema property floor", () => {
  roundTrips("TomlVisitorEvent encode/decode", Model.TomlVisitorEvent);
});

it.effect.prop(
  "visitor preserves generated assignments and comments in source order",
  [Arbitrary.schema(S.Int.check(S.isBetween({ minimum: -1000000, maximum: 1000000 })))],
  ([value]) =>
    Effect.gen(function* () {
      const text = `# lead\n[table] # header\nvalue = ${value} # value\n[[rows]]\nenabled = true\n`;
      const events = yield* Stream.runCollect(TomlVisitor.visit(text));
      assert.deepStrictEqual(
        A.map(events, (event) => event._tag),
        ["TableStart", "Comment", "TableStart", "Comment", "KeyValue", "Comment", "ArrayTableStart", "KeyValue"]
      );
      const assignments = A.filter(events, Model.TomlVisitorEvent.$is("KeyValue"));
      assert.deepStrictEqual(
        A.map(assignments, (event) => event.path),
        [
          ["table", "value"],
          ["rows", "enabled"],
        ]
      );
      assert.deepStrictEqual(
        A.map(assignments, (event) => event.node.value),
        [
          Node.TomlInteger.make({ value, offset: text.indexOf(String(value)), length: String(value).length }),
          Node.TomlBoolean.make({ value: true, offset: text.indexOf("true"), length: 4 }),
        ]
      );
      const comments = A.filter(events, Model.TomlVisitorEvent.$is("Comment"));
      assert.deepStrictEqual(
        A.map(comments, (event) => event.text),
        ["lead", "header", "value"]
      );
      assert.deepStrictEqual(
        A.map(comments, (event) => text.charAt(event.offset)),
        ["#", "#", "#"]
      );
    }),
  runs
);
