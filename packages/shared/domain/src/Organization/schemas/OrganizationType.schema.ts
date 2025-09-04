import { BS } from "@beep/schema";
import type * as S from "effect/Schema";
export const organizationTypeKit = BS.stringLiteralKit(
  "individual",
  "team",
  "enterprise"
)({
  description: "The type of organization",
  identifier: "OrganizationType",
  title: "Organization Type",
});

export const makeOrganizationTypePgEnum = organizationTypeKit.toPgEnum;

export const OrganizationTypeEnum = organizationTypeKit.Enum;

export const OrganizationTypeOptions = organizationTypeKit.Options;

export class OrganizationType extends organizationTypeKit.Schema {
  static readonly Options = organizationTypeKit.Options;
  static readonly Enum = organizationTypeKit.Enum;
}

export namespace OrganizationType {
  export type Type = S.Schema.Type<typeof OrganizationType>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationType>;
}
