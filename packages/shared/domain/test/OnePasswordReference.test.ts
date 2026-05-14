import { isOnePasswordReference, OnePasswordReference } from "@beep/shared-domain/values/OnePasswordReference";
import { assert, describe, expect, it } from "@effect/vitest";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";

const decodeOnePasswordReference = S.decodeUnknownEffect(OnePasswordReference);

const expectDecodeFailure = Effect.fn("OnePasswordReferenceTest.expectDecodeFailure")(function* (input: unknown) {
  const exit = yield* Effect.exit(decodeOnePasswordReference(input));
  assert.strictEqual(Exit.isFailure(exit), true);
});

describe("OnePasswordReference", () => {
  it.effect(
    "accepts 1Password item field references",
    Effect.fnUntraced(function* () {
      const decoded = yield* decodeOnePasswordReference("op://Private/Discord Bot/token");

      assert.strictEqual(decoded, "op://Private/Discord Bot/token");
    })
  );

  it.effect(
    "rejects plaintext-like and incomplete values",
    Effect.fnUntraced(function* () {
      yield* expectDecodeFailure("discord-token-plaintext");
      yield* expectDecodeFailure("op://Private/Discord Bot");
      yield* expectDecodeFailure("op://Private/Discord Bot/");
    })
  );

  it("exposes a schema-derived guard", () => {
    expect(isOnePasswordReference("op://Private/Discord Bot/token")).toBe(true);
    expect(isOnePasswordReference("not-a-reference")).toBe(false);
  });
});
