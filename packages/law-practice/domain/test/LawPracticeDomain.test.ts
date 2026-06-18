import {
  Claim,
  Distinction,
  LegalClientStatus,
  LegalContactRole,
  Matter,
  MatterType,
  OfficeAction,
  PatentAssetStatus,
  PriorArtReference,
  Rejection,
} from "@beep/law-practice-domain";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { baseEntityFixtureInput } from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import * as S from "effect/Schema";

describe("@beep/law-practice-domain", () => {
  it("exports value schemas from the package identity", () => {
    expect(LegalClientStatus.is.active_client("active_client")).toBe(true);
    expect(LegalContactRole.is.founder("founder")).toBe(true);
    expect(MatterType.is.patent_application("patent_application")).toBe(true);
    expect(PatentAssetStatus.is.pre_filing("pre_filing")).toBe(true);
  });

  it("wires Matter to the law-practice BaseEntity identity", () => {
    expect(Matter.definition.entityId).toBe(LawPractice.MatterId);
    expect(Matter.definition.entityId.tableName).toBe("law_practice_matter");
    expect(Matter.definition.entityId.entityType).toBe("LawPracticeMatter");
    expect(Matter.definition.persisted.id.storageKind).toBe("entityId");
    expect(Matter.definition.persisted.matterType.storageKind).toBe("literal");
  });

  it("decodes and constructs a Matter row", () => {
    const decoded = S.decodeUnknownSync(Matter)({
      ...baseEntityFixtureInput("LawPracticeMatter", 5),
      displayName: "Patent Application",
      fixtureKey: "matter.patent",
      legalClientFixtureKey: "legal-client.acme",
      matterType: "patent_application",
    });
    const constructed = Matter.make(decoded);

    expect(decoded).toBeInstanceOf(Matter);
    expect(constructed).toBeInstanceOf(Matter);
    expect(constructed.entityType).toBe("LawPracticeMatter");
    expect(constructed.matterType).toBe("patent_application");
    expect(constructed.legalClientFixtureKey).toBe("legal-client.acme");
  });

  it("decodes an OfficeAction row", () => {
    const decoded = S.decodeUnknownSync(OfficeAction)({
      ...baseEntityFixtureInput("LawPracticeOfficeAction", 10),
      applicationNumber: "16/123,456",
      fixtureKey: "office-action.first",
      matterFixtureKey: "matter.patent",
      patentAssetFixtureKey: "patent-asset.widget",
    });

    expect(decoded).toBeInstanceOf(OfficeAction);
    expect(decoded.entityType).toBe("LawPracticeOfficeAction");
    expect(decoded.matterFixtureKey).toBe("matter.patent");
  });

  it("decodes a Claim row", () => {
    const decoded = S.decodeUnknownSync(Claim)({
      ...baseEntityFixtureInput("LawPracticeClaim", 11),
      claimNumber: 1,
      fixtureKey: "claim.1",
      independent: true,
      patentAssetFixtureKey: "patent-asset.widget",
      text: "A widget comprising a hinge.",
    });

    expect(decoded).toBeInstanceOf(Claim);
    expect(decoded.claimNumber).toBe(1);
    expect(decoded.independent).toBe(true);
  });

  it("decodes a PriorArtReference row", () => {
    const decoded = S.decodeUnknownSync(PriorArtReference)({
      ...baseEntityFixtureInput("LawPracticePriorArtReference", 12),
      documentNumber: "US 9,999,999 B2",
      fixtureKey: "prior-art.smith",
      officeActionFixtureKey: "office-action.first",
      title: "Foldable Widget",
    });

    expect(decoded).toBeInstanceOf(PriorArtReference);
    expect(decoded.documentNumber).toBe("US 9,999,999 B2");
  });

  it("decodes a Rejection row with a §102 anticipation ground", () => {
    const decoded = S.decodeUnknownSync(Rejection)({
      ...baseEntityFixtureInput("LawPracticeRejection", 13),
      claimFixtureKey: "claim.1",
      fixtureKey: "rejection-one-zero-two",
      ground: { referenceFixtureKey: "prior-art.smith", statute: "102" },
      officeActionFixtureKey: "office-action.first",
    });

    expect(decoded).toBeInstanceOf(Rejection);
    expect(decoded.ground.statute).toBe("102");
  });

  it("decodes a Distinction row anchored to the source text", () => {
    const decoded = S.decodeUnknownSync(Distinction)({
      ...baseEntityFixtureInput("LawPracticeDistinction", 14),
      anchor: { endChar: 14, quote: "a claimed fact", startChar: 0 },
      claimFixtureKey: "claim.1",
      detail: { kind: "missing_limitation", limitation: "a hinge coupling the lid to the base" },
      fixtureKey: "distinction.hinge",
      lifecycleState: "candidate",
      rejectionFixtureKey: "rejection-one-zero-two",
    });

    expect(decoded).toBeInstanceOf(Distinction);
    expect(decoded.lifecycleState).toBe("candidate");
    expect(decoded.anchor.quote).toBe("a claimed fact");
  });
});
