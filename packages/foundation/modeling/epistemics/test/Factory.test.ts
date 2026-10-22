import { $EpistemicDomainId, $ScratchpadId } from "@beep/identity/packages";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as S from "effect/Schema";
import type { IdCodec, SchemaIdentity } from "@beep/epistemics/Factory";

describe("Factory parameter types", () => {
  it("accepts branded string and number ids and any package composer", () => {
    const partyId: IdCodec = S.String.pipe(S.brand("PartyId"));
    const evidenceId: IdCodec = S.Int.check(S.isGreaterThan(0)).pipe(S.brand("EvidenceRowId"));
    const domain: SchemaIdentity = $EpistemicDomainId.create("values/EdgeEndpoint/EdgeEndpoint.model");
    const scratch: SchemaIdentity = $ScratchpadId.create("party/Claim");
    expect(S.is(partyId)("party-1")).toBe(true);
    expect(S.is(evidenceId)(1)).toBe(true);
    expect(scratch.make("Claim")).not.toBe(domain.make("Claim"));
  });
});
