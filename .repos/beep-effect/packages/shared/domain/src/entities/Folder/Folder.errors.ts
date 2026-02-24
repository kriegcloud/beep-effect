import { $SharedDomainId } from "@beep/identity/packages";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entities/Folder/Folder.errors");

export class FolderNotFoundError extends S.TaggedError<FolderNotFoundError>()(
  $I`FolderNotFoundError`,
  {
    id: SharedEntityIds.FolderId,
  },
  $I.annotationsHttp("FolderNotFoundError", {
    status: 404,
    description: "Error when a folder with the specified ID cannot be found.",
  })
) {}

export class FolderPermissionDeniedError extends S.TaggedError<FolderPermissionDeniedError>()(
  $I`FolderPermissionDeniedError`,
  {
    id: SharedEntityIds.FolderId,
  },
  $I.annotationsHttp("FolderPermissionDeniedError", {
    status: 403,
    description: "Thrown when the user lacks permission to perform the requested action on the folder.",
  })
) {}

export const Errors = S.Union(FolderNotFoundError, FolderPermissionDeniedError);
export type Errors = typeof Errors.Type;
