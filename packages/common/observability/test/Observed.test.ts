import { TaggedErrorClass } from "@beep/schema";
import { Cause, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import { ObservedCause, ObservedExit } from "../src/index.ts";

class TestObservedError extends TaggedErrorClass<TestObservedError>()("TestObservedError", {
  message: S.String,
}) {}

describe("Observed", () => {
  it("round-trips a failed Cause through the observed schema", () => {
    const cause = Cause.fail(new TestObservedError({ message: "boom" }));
    const encoded = S.encodeSync(S.toCodecJson(ObservedCause))(cause);
    const encodedReasons = S.decodeUnknownSync(
      S.Array(
        S.Struct({
          _tag: S.String,
        })
      )
    )(encoded);

    expect(encodedReasons).toHaveLength(1);
    expect(encodedReasons[0]?._tag).toBe("Fail");

    const decoded = S.decodeSync(S.toCodecJson(ObservedCause))(encoded);
    const firstReason = decoded.reasons[0];

    expect(firstReason?._tag).toBe("Fail");
    expect(firstReason?._tag === "Fail" ? firstReason.error.message : "").toBe("boom");
  });

  it("round-trips a failed Exit through the observed schema", () => {
    const exit = Exit.failCause(Cause.fail(new TestObservedError({ message: "kapow" })));
    const encoded = S.encodeSync(S.toCodecJson(ObservedExit))(exit);
    const encodedTag = S.decodeUnknownSync(
      S.Struct({
        _tag: S.String,
      })
    )(encoded);

    expect(encodedTag._tag).toBe("Failure");

    const decoded = S.decodeSync(S.toCodecJson(ObservedExit))(encoded);

    expect(decoded._tag).toBe("Failure");
    expect(decoded._tag === "Failure" ? decoded.cause.reasons[0]?._tag : "Success").toBe("Fail");
  });
});
