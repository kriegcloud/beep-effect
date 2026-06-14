import { LegalClientStatus, LegalContactRole, Matter, MatterType, PatentAssetStatus } from "@beep/law-practice-domain";
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
});
