import { BS } from "@beep/schema";
import type * as S from "effect/Schema";




export class OrganizationType extends BS.StringLiteralKit("individual", "team", "enterprise").annotations({
  schemaId: Symbol.for("@beep/shared-domain/Organization/schemas/OrganizationType"),
  identifier: "OrganizationType",
  title: "Organization Type",
  description: "The type of organization (individual, team, enterprise)",
}) {
}

export const makeOrganizationTypePgEnum = BS.toPgEnum(OrganizationType);

export const OrganizationTypeEnum = OrganizationType.Enum;

export const OrganizationTypeOptions = OrganizationType.Options;

export declare namespace OrganizationType {
  export type Type = S.Schema.Type<typeof OrganizationType>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationType>;
}
