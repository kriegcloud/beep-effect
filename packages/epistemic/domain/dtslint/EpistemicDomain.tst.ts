import { CandidateClaim, type ClaimLifecycle, type ClaimLifecycle as ClaimLifecycleType } from "@beep/epistemic-domain";
import type * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { describe, expect, it } from "tstyche";

declare const candidateClaim: CandidateClaim;

describe("@beep/epistemic-domain", () => {
  it("preserves exported value schema types", () => {
    expect<ClaimLifecycle>().type.toBe<ClaimLifecycleType>();
    expect<ClaimLifecycleType>().type.toBe<"candidate">();
  });

  it("preserves CandidateClaim BaseEntity identity wiring", () => {
    expect(CandidateClaim.definition.entityId).type.toBe<typeof Epistemic.CandidateClaimId>();
    expect<typeof CandidateClaim.definition.entityId.tableName>().type.toBe<"epistemic_candidate_claim">();
    expect<typeof CandidateClaim.definition.entityId.entityType>().type.toBe<"EpistemicCandidateClaim">();
    expect<typeof CandidateClaim.definition.persisted.lifecycle.storageKind>().type.toBe<"literal">();
    expect<typeof CandidateClaim.definition.persisted.snapshot.columnName>().type.toBe<"snapshot">();
    expect<typeof CandidateClaim.fields.lifecycle.Type>().type.toBe<ClaimLifecycleType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof CandidateClaim.Encoded>().type.toBeAssignableTo<typeof CandidateClaim.Encoded>();
    expect(new CandidateClaim(candidateClaim)).type.toBe<CandidateClaim>();
    expect<CandidateClaim["lifecycle"]>().type.toBe<ClaimLifecycleType>();
  });
});
