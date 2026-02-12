import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Organization/Organization.errors");

export class OrganizationNotFoundError extends S.TaggedError<OrganizationNotFoundError>()(
  $I`OrganizationNotFoundError`,
  {
    id: SharedEntityIds.OrganizationId,
  },
  $I.annotationsHttp("OrganizationNotFoundError", {
    status: 404,
    description: "Error when an organization with the specified ID cannot be found.",
  })
) {}

export class OrganizationPermissionDeniedError extends S.TaggedError<OrganizationPermissionDeniedError>()(
  $I`OrganizationPermissionDeniedError`,
  {
    id: SharedEntityIds.OrganizationId,
  },
  $I.annotationsHttp("OrganizationPermissionDeniedError", {
    status: 403,
    description: "Error when the user does not have permission to access the organization.",
  })
) {}

export const Errors = S.Union(OrganizationNotFoundError, OrganizationPermissionDeniedError);
export type Errors = typeof Errors.Type;
