import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/OrganizationRole/OrganizationRole.errors");

export class OrganizationRoleNotFoundError extends S.TaggedError<OrganizationRoleNotFoundError>()(
  $I`OrganizationRoleNotFoundError`,
  {
    id: IamEntityIds.OrganizationRoleId,
  },
  $I.annotationsHttp("OrganizationRoleNotFoundError", {
    status: 404,
    description: "Error when an organization role with the specified ID cannot be found.",
  })
) {}

export class OrganizationRolePermissionDeniedError extends S.TaggedError<OrganizationRolePermissionDeniedError>()(
  $I`OrganizationRolePermissionDeniedError`,
  {
    id: IamEntityIds.OrganizationRoleId,
  },
  $I.annotationsHttp("OrganizationRolePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the organization role.",
  })
) {}

export const Errors = S.Union(OrganizationRoleNotFoundError, OrganizationRolePermissionDeniedError);
export type Errors = typeof Errors.Type;
