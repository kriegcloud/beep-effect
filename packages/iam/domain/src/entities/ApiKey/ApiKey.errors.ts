import { $IamDomainId } from "@beep/identity/packages";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $IamDomainId.create("entities/ApiKey/ApiKey.errors");

export class ApiKeyNotFoundError extends S.TaggedError<ApiKeyNotFoundError>()(
  $I`ApiKeyNotFoundError`,
  {
    id: IamEntityIds.ApiKeyId,
  },
  $I.annotationsHttp("ApiKeyNotFoundError", {
    status: 404,
    description: "Error when an API key with the specified ID cannot be found.",
  })
) {}

export class ApiKeyPermissionDeniedError extends S.TaggedError<ApiKeyPermissionDeniedError>()(
  $I`ApiKeyPermissionDeniedError`,
  {
    id: IamEntityIds.ApiKeyId,
  },
  $I.annotationsHttp("ApiKeyPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the API key.",
  })
) {}

export const Errors = S.Union(ApiKeyNotFoundError, ApiKeyPermissionDeniedError);
export type Errors = typeof Errors.Type;
