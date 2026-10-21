import { RequoteScalarInput, requoteScalarText } from "@beep/yaml/internal/requote";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

it.effect("rejects escape-producing conservative swaps and unrepresentable single quotes", () =>
  Effect.sync(() => {
    assert.strictEqual(
      O.getOrUndefined(
        requoteScalarText(
          "'a\\b'",
          RequoteScalarInput.make({ value: "a\\b", style: "single-quoted", offset: 0, length: 5 }),
          '"',
          "conservative"
        )
      ),
      undefined
    );
    assert.strictEqual(
      O.getOrUndefined(
        requoteScalarText(
          "plain",
          RequoteScalarInput.make({ value: "plain", style: "plain", offset: 0, length: 5 }),
          "'",
          "escaping"
        )
      ),
      undefined
    );
    assert.strictEqual(
      O.getOrUndefined(
        requoteScalarText(
          '"a\\nb"',
          RequoteScalarInput.make({ value: "a\nb", style: "double-quoted", offset: 0, length: 6 }),
          "'",
          "conservative"
        )
      ),
      undefined
    );
    assert.strictEqual(
      O.getOrUndefined(
        requoteScalarText(
          '"already"',
          RequoteScalarInput.make({ value: "already", style: "double-quoted", offset: 0, length: 9 }),
          '"',
          "escaping"
        )
      ),
      undefined
    );
    for (const value of ["\t", "\n", "\r", "\u0001", "\u007f", "\u0080", "\u009f"]) {
      assert.strictEqual(
        O.getOrUndefined(
          requoteScalarText(
            '"escaped"',
            RequoteScalarInput.make({ value, style: "double-quoted", offset: 0, length: 9 }),
            "'",
            "escaping"
          )
        ),
        undefined
      );
    }
  })
);
