import {
  appendTurnFinalizationUsageRecord,
  CandidateClaim,
  ClaimLifecycle,
  TurnFinalizationUsageAppend,
  UsageRecord,
} from "@beep/epistemic-domain";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { baseEntityFixtureInput, systemPrincipal } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as O from "effect/Option";
import * as S from "effect/Schema";

describe("@beep/epistemic-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(ClaimLifecycle.is.candidate("candidate")).toBe(true);
  });

  it("wires CandidateClaim to the epistemic BaseEntity identity", () => {
    expect(CandidateClaim.definition.entityId).toBe(Epistemic.CandidateClaimId);
    expect(CandidateClaim.definition.entityId.tableName).toBe("epistemic_candidate_claim");
    expect(CandidateClaim.definition.entityId.entityType).toBe("EpistemicCandidateClaim");
    expect(CandidateClaim.definition.persisted.id.storageKind).toBe("entityId");
    expect(CandidateClaim.definition.persisted.snapshot.storageKind).toBe("jsonb");
  });

  it("decodes and constructs a CandidateClaim row", () => {
    const decoded = S.decodeUnknownSync(CandidateClaim)({
      ...baseEntityFixtureInput("EpistemicCandidateClaim", 3),
      fixtureKey: "claim.patentability",
      lifecycle: "candidate",
      snapshot: { confidence: 0.92, label: "Patentability" },
    });
    const constructed = CandidateClaim.make(decoded);

    expect(decoded).toBeInstanceOf(CandidateClaim);
    expect(constructed).toBeInstanceOf(CandidateClaim);
    expect(constructed.entityType).toBe("EpistemicCandidateClaim");
    expect(constructed.lifecycle).toBe("candidate");
    expect(constructed.snapshot).toEqual({ confidence: 0.92, label: "Patentability" });
  });

  it("appends a UsageRecord from turn-finalization activity", () => {
    const decoded = S.decodeUnknownSync(TurnFinalizationUsageAppend)({
      ...baseEntityFixtureInput("EpistemicUsageRecord", 7),
      activityId: 5,
      actor: systemPrincipal,
      costUsdApproxMicros: 3000,
      credentialReference: "op://Private/Claude/token",
      inputTokens: 120,
      latencyMillis: 1420,
      metadata: { threadId: 9, turnId: 12 },
      model: "claude-opus-4-6",
      outputTokens: 80,
      provider: "anthropic",
      totalTokens: 200,
      unitCount: null,
    });
    const appended = appendTurnFinalizationUsageRecord(decoded);

    expect(appended).toBeInstanceOf(UsageRecord);
    expect(appended.activityId).toBe(5);
    expect(appended.entityType).toBe("EpistemicUsageRecord");
    expect(O.getOrElse(appended.credentialReference, () => "")).toBe("op://Private/Claude/token");
    expect(O.getOrElse(appended.unitCount, () => 0)).toBe(0);
    expect(appended.metadata).toEqual({ threadId: 9, turnId: 12 });
  });
});
