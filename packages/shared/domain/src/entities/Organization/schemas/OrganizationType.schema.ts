import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Organization/schemas/OrganizationType.schema");

export class OrganizationType extends BS.StringLiteralKit("individual", "team", "enterprise").annotations(
  $I.annotations("OrganizationType", {
    title: "Organization Type",
    description: "The type of organization (individual, team, enterprise)",
  })
) {}

export const makeOrganizationTypePgEnum = BS.toPgEnum(OrganizationType);

export const OrganizationTypeEnum = OrganizationType.Enum;

export const OrganizationTypeOptions = OrganizationType.Options;

export declare namespace OrganizationType {
  export type Type = S.Schema.Type<typeof OrganizationType>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationType>;
}
