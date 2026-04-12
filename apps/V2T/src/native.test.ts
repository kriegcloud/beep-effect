import { describe, expect, it } from "@effect/vitest";
import { DateTime } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Vt2ManagedCaptureState } from "./native.ts";

const decodeManagedCaptureState = S.decodeUnknownSync(Vt2ManagedCaptureState);

describe("@beep/v2t native bridge", () => {
  it("decodes the managed capture event payload emitted by the native shell", () => {
    const startedAtMillis = 1_706_000_000_000;
    const payload = decodeManagedCaptureState({
      status: "recoverable",
      recoverySessionId: "550e8400-e29b-41d4-a716-446655440000",
      recoveryCandidateId: "550e8400-e29b-41d4-a716-446655440001",
      draftPath: "/tmp/v2t/captures/550e8400-e29b-41d4-a716-446655440000/draft.json",
      startedAt: startedAtMillis,
    });

    expect(payload.status).toBe("recoverable");
    expect(
      O.match(payload.recoverySessionId, {
        onNone: () => null,
        onSome: (value) => value,
      })
    ).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(
      O.match(payload.startedAt, {
        onNone: () => null,
        onSome: (value) => DateTime.toEpochMillis(value),
      })
    ).toBe(startedAtMillis);
  });
});
