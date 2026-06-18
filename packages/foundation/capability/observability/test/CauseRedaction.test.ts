import {
  RedactCauseOptions,
  redactCause,
  redactCauseEffect,
  redactCauseForClient,
  redactString,
  sanitizeSensitiveText,
} from "@beep/observability";
import { NonNegativeInt } from "@beep/schema";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Effect } from "effect";
import * as O from "effect/Option";

describe("CauseRedaction", () => {
  it("redacts secret-shaped tokens and home paths", () => {
    expect(sanitizeSensitiveText("API_KEY=sk-EXAMPLEKEY00")).toBe("API_KEY=[REDACTED]");
    expect(sanitizeSensitiveText("Bearer sk-EXAMPLEKEY00")).toBe("Bearer [REDACTED]");
    expect(sanitizeSensitiveText("at /home/ada/app/index.ts:10")).toBe("at /home/[REDACTED]/app/index.ts:10");
    expect(sanitizeSensitiveText("authorization: token-value-here")).toBe("authorization: [REDACTED]");
  });

  it("caps length with redactString", () => {
    const out = redactString("token=sk-EXAMPLEKEY00 and a long tail of more text here", 16);
    expect(out.length).toBeLessThanOrEqual(16 + 3);
    expect(out.endsWith("...")).toBe(true);
  });

  it("redacts an unknown error into a transport-safe summary on the diagnostic channel", () => {
    const cause = Cause.fail(new Error("auth failed for /home/ada with token sk-EXAMPLEKEY00"));
    const safe = redactCause(cause);
    expect(safe.tag).toBe("failure");
    expect(safe.message).toContain("[REDACTED]");
    expect(safe.message).not.toContain("sk-EXAMPLEKEY00");
    expect(safe.message).not.toContain("/home/ada");
    expect(O.isSome(safe.detail)).toBe(true);
    expect(safe.fingerprint.length).toBeGreaterThan(0);
  });

  it("sanitizes the message-derived fingerprint so secrets never leak through correlation ids", () => {
    const safe = redactCause(Cause.fail(new Error("auth failed with token sk-EXAMPLEKEY00")));
    expect(safe.message).not.toContain("sk-EXAMPLEKEY00");
    expect(safe.fingerprint).not.toContain("sk-EXAMPLEKEY00");
    expect(safe.fingerprint).toContain("[REDACTED]");
  });

  it("collapses structurally identical secrets to the same redacted fingerprint", () => {
    const first = redactCause(Cause.fail(new Error("Authorization: Bearer aaaaaaaaaaaaaaaa")));
    const second = redactCause(Cause.fail(new Error("Authorization: Bearer bbbbbbbbbbbbbbbb")));
    expect(first.fingerprint).not.toContain("aaaaaaaaaaaaaaaa");
    expect(second.fingerprint).not.toContain("bbbbbbbbbbbbbbbb");
    expect(first.fingerprint).toBe(second.fingerprint);
  });

  it("drops all internal detail on the client channel", () => {
    const safe = redactCauseForClient(Cause.die("internal invariant /home/ada broke"));
    expect(safe.tag).toBe("defect");
    expect(O.isNone(safe.detail)).toBe(true);
    expect(safe.message).not.toContain("/home/ada");
  });

  it("normalizes a bare unknown value into a failure cause", () => {
    const safe = redactCause("password=hunter2secret");
    expect(safe.tag).toBe("failure");
    expect(safe.message).toContain("[REDACTED]");
  });

  it.effect(
    "exposes a traced Effect-friendly variant",
    Effect.fnUntraced(function* () {
      const safe = yield* redactCauseEffect(Cause.fail(new Error("boom")));
      expect(safe.tag).toBe("failure");
      expect(safe.message).toBe("boom");
    })
  );

  it("respects a custom message limit via options", () => {
    const safe = redactCause(
      Cause.fail(new Error("x".repeat(500))),
      RedactCauseOptions.make({ messageLimit: NonNegativeInt.make(32) })
    );
    expect(safe.message.length).toBeLessThanOrEqual(32 + 3);
    expect(safe.truncated).toBe(true);
  });
});
