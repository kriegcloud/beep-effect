import { CommentStyle } from "@beep/managed-section/CommentStyle";
import { ReconcileInput, reconcile } from "@beep/managed-section/internal/reconcile";
import { scan } from "@beep/managed-section/internal/scan";
import { SectionId } from "@beep/managed-section/Section";
import { SectionDialect } from "@beep/managed-section/SectionDialect";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("reconciliation cached render invariants", () => {
  it.effect("inserts missing siblings on either side of a present slot using their pre-rendered blocks", () =>
    Effect.gen(function* () {
      const dialect = SectionDialect.default;
      const a = SectionId.make({ key: "a", commentStyle: CommentStyle.hash }).section("first");
      const b = SectionId.make({ key: "b", commentStyle: CommentStyle.hash }).section("middle");
      const c = SectionId.make({ key: "c", commentStyle: CommentStyle.hash }).section("last");
      const aBlock = yield* Effect.fromResult(dialect.render(a));
      const bBlock = yield* Effect.fromResult(dialect.render(b));
      const cBlock = yield* Effect.fromResult(dialect.render(c));
      const text = `before\n${bBlock}\nafter`;
      const parsed = scan(text, dialect);
      assert.strictEqual(parsed.ok, true);
      if (parsed.ok) {
        const output = yield* Effect.fromResult(
          reconcile(ReconcileInput.make({ text, placed: parsed.sections, declared: [a, b, c], dialect, eol: "\n" }))
        );
        assert.strictEqual(output.text, `before\n${aBlock}\n\n${bBlock}\n\n${cBlock}\nafter`);
        assert.strictEqual(output.changed, true);
        assert.strictEqual(output.outcomes.length, 3);
        assert.strictEqual(output.outcomes[0]?._tag, "Created");
        assert.strictEqual(output.outcomes[1]?._tag, "Unchanged");
        assert.strictEqual(output.outcomes[2]?._tag, "Created");
      }
    })
  );
});
