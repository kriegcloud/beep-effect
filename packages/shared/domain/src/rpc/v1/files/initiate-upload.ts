import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { File } from "@beep/shared-domain/entities";
import { AnyEntityId, EntityKind, SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as Rpc from "@effect/rpc/Rpc";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("rpc/files/initiate-upload");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileName: S.String,
    fileSize: S.Number.annotations({ description: "The size of the file in bytes." }),
    mimeType: BS.MimeType,
    entityKind: EntityKind,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,
    folderId: S.NullOr(SharedEntityIds.FolderId),
    metadata: File.Model.fields.metadata,
  },
  $I.annotations("InitiateUploadPayload", {
    description: "Payload for initiate upload rpc",
  })
) {}

export class Success extends S.Class<Success>($I`Success`)(
  {
    presignedUrl: S.String,
    fileKey: File.UploadKey,
    metadata: File.Model.fields.metadata,
  },
  $I.annotations("InitiateUploadSuccess", {
    description: "Success for initiate upload rpc",
  })
) {}

export const Contract = Rpc.make("initiateUpload", {
  payload: Payload,
  success: Success,
});
