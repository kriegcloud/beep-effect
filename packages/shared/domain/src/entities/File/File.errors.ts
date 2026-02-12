import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/File/File.errors");

export class FileNotFoundError extends S.TaggedError<FileNotFoundError>()(
  $I`FileNotFoundError`,
  {
    id: SharedEntityIds.FileId,
  },
  $I.annotationsHttp("FileNotFoundError", {
    status: 404,
    description: "Error when a file with the specified ID cannot be found.",
  })
) {}

export class FilePermissionDeniedError extends S.TaggedError<FilePermissionDeniedError>()(
  $I`FilePermissionDeniedError`,
  {
    id: SharedEntityIds.FileId,
  },
  $I.annotationsHttp("FilePermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the file.",
  })
) {}

export const Errors = S.Union(FileNotFoundError, FilePermissionDeniedError);
export type Errors = typeof Errors.Type;
