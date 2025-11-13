import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const organizationTypeKit = BS.stringLiteralKit("individual", "team", "enterprise");

export const makeOrganizationTypePgEnum = BS.toPgEnum(organizationTypeKit);

export const OrganizationTypeEnum = organizationTypeKit.Enum;

export const OrganizationTypeOptions = organizationTypeKit.Options;

export class OrganizationType extends organizationTypeKit.Schema.annotations({
  schemaId: Symbol.for("@beep/shared-domain/Organization/schemas/OrganizationType"),
  identifier: "OrganizationType",
  title: "Organization Type",
  description: "The type of organization (individual, team, enterprise)",
}) {
  static readonly Options = organizationTypeKit.Options;
  static readonly Enum = organizationTypeKit.Enum;
}

export declare namespace OrganizationType {
  export type Type = S.Schema.Type<typeof OrganizationType>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationType>;
}
