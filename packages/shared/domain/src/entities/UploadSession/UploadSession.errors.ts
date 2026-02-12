import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import * as File from "../File";

const $I = $SharedDomainId.create("entities/UploadSession/UploadSession.errors");

export class UploadSessionNotFoundError extends S.TaggedError<UploadSessionNotFoundError>()(
  $I`UploadSessionNotFoundError`,
  {
    id: SharedEntityIds.UploadSessionId,
  },
  $I.annotationsHttp("UploadSessionNotFoundError", {
    status: 404,
    description: "Error when an upload session with the specified ID cannot be found.",
  })
) {}

export class UploadSessionPermissionDeniedError extends S.TaggedError<UploadSessionPermissionDeniedError>()(
  $I`UploadSessionPermissionDeniedError`,
  {
    id: SharedEntityIds.UploadSessionId,
  },
  $I.annotationsHttp("UploadSessionPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the upload session.",
  })
) {}

export class UploadSessionRepoError extends S.TaggedError<UploadSessionRepoError>()(
  $I`UploadSessionRepoError`,
  {
    operation: S.String,
    fileKey: S.optional(File.UploadKey.to),
  },
  $I.annotationsHttp("UploadSessionRepoError", {
    status: 500,
    description: "Database error from upload session repository operations.",
  })
) {}

export const Errors = S.Union(UploadSessionNotFoundError, UploadSessionPermissionDeniedError, UploadSessionRepoError);
export type Errors = typeof Errors.Type;
