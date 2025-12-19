import * as Rpc from "@effect/rpc/Rpc";
import {$SharedDomainId} from "@beep/identity/packages";
import * as S from "effect/Schema";
import {BS} from "@beep/schema";
import {AnyEntityId, EntityKind, SharedEntityIds} from "@beep/shared-domain";
import {File} from "@beep/shared-domain/entities";

export const $I = $SharedDomainId.create("api/v1/rpc/files/initiate-upload");

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    fileName: BS.NameAttribute,
    fileSize: S.Number.annotations({description: "The size of the file in bytes."}),
    mimeType: BS.MimeType,
    entityKind: EntityKind,
    entityIdentifier: AnyEntityId,
    entityAttribute: S.NonEmptyTrimmedString,
    folderId: S.optionalWith(SharedEntityIds.FolderId, {as: "Option", nullable: true, exact: true}),
    metadata: File.Model.fields.metadata,
  },
  $I.annotations("InitiateUploadPayload", {
    description: "Payload for the initiate upload RPC."
  })
) {
}

export class Success extends S.Class<Success>($I`Success`)(
  {
    presignedUrl: S.String,
    fileKey: File.UploadKey,
    metadata: File.Model.fields.metadata
  },
  $I.annotations("InitiateUploadSuccess", {
    description: "Success response for the initiate upload RPC."
  })
) {
}

export class Contract extends Rpc.make("initiateUpload", {
  payload: Payload,
  success: Success
}) {}