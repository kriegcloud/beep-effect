import { Matter } from "@beep/law-practice-domain";
import { describe, expect, it } from "tstyche";
import type {
  LegalClientStatus,
  LegalClientStatus as LegalClientStatusType,
  LegalContactRole,
  LegalContactRole as LegalContactRoleType,
  MatterType,
  MatterType as MatterTypeType,
  PatentAssetStatus,
  PatentAssetStatus as PatentAssetStatusType,
} from "@beep/law-practice-domain";
import type * as LawPractice from "@beep/shared-domain/identity/LawPractice";

declare const matter: Matter;

describe("@beep/law-practice-domain", () => {
  it("preserves exported value schema types", () => {
    expect<LegalClientStatus>().type.toBe<LegalClientStatusType>();
    expect<LegalClientStatusType>().type.toBe<"active_client">();
    expect<LegalContactRole>().type.toBe<LegalContactRoleType>();
    expect<LegalContactRoleType>().type.toBe<"founder">();
    expect<MatterType>().type.toBe<MatterTypeType>();
    expect<MatterTypeType>().type.toBe<"patent_application">();
    expect<PatentAssetStatus>().type.toBe<PatentAssetStatusType>();
    expect<PatentAssetStatusType>().type.toBe<"pre_filing">();
  });

  it("preserves Matter BaseEntity identity wiring", () => {
    expect(Matter.definition.entityId).type.toBe<typeof LawPractice.MatterId>();
    expect<typeof Matter.definition.entityId.tableName>().type.toBe<"law_practice_matter">();
    expect<typeof Matter.definition.entityId.entityType>().type.toBe<"LawPracticeMatter">();
    expect<typeof Matter.definition.persisted.matterType.storageKind>().type.toBe<"literal">();
    expect<
      typeof Matter.definition.persisted.legalClientFixtureKey.columnName
    >().type.toBe<"legal_client_fixture_key">();
    expect<typeof Matter.fields.matterType.Type>().type.toBe<MatterTypeType>();
  });

  it("preserves decode and constructor types", () => {
    expect<typeof Matter.Encoded>().type.toBeAssignableTo<typeof Matter.Encoded>();
    expect(Matter.make(matter)).type.toBe<Matter>();
    expect<Matter["matterType"]>().type.toBe<MatterTypeType>();
  });
});
