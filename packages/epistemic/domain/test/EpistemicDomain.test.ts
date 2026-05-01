import { CandidateClaim, ClaimLifecycle } from "@beep/epistemic-domain";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

const systemPrincipal = { kind: "System", component: "Runtime" } as const;

const baseEntityInput = (entityType: string, id: number) => ({
  createdAt: id,
  createdByPrincipal: systemPrincipal,
  entityType,
  id,
  orgId: 1,
  rowVersion: 1,
  schemaVersion: "0.0.0",
  source: "System",
  updatedAt: id + 1,
  updatedByPrincipal: systemPrincipal,
});

describe("@beep/epistemic-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(ClaimLifecycle.is.candidate("candidate")).toBe(true);
  });

  it("wires CandidateClaim to the epistemic BaseEntity identity", () => {
    expect(CandidateClaim.definition.entityId).toBe(Epistemic.CandidateClaimId);
    expect(CandidateClaim.definition.entityId.tableName).toBe("epistemic_candidate_claim");
    expect(CandidateClaim.definition.entityId.entityType).toBe("EpistemicCandidateClaim");
    expect(CandidateClaim.definition.fieldMap.id.storageKind).toBe("entityId");
    expect(CandidateClaim.definition.fieldMap.snapshot.storageKind).toBe("json");
  });

  it("decodes and constructs a CandidateClaim row", () => {
    const decoded = S.decodeUnknownSync(CandidateClaim)({
      ...baseEntityInput("EpistemicCandidateClaim", 3),
      fixtureKey: "claim.patentability",
      lifecycle: "candidate",
      snapshot: { confidence: 0.92, label: "Patentability" },
    });
    const constructed = new CandidateClaim(decoded);

    expect(decoded).toBeInstanceOf(CandidateClaim);
    expect(constructed).toBeInstanceOf(CandidateClaim);
    expect(constructed.entityType).toBe("EpistemicCandidateClaim");
    expect(constructed.lifecycle).toBe("candidate");
    expect(constructed.snapshot).toEqual({ confidence: 0.92, label: "Patentability" });
  });
});
