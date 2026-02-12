import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import { HmacSignature } from "../../services/EncryptionService/schemas";
import * as File from "../file";
import { UploadSessionMetadata } from "./schemas";

const $I = $SharedDomainId.create("entities/UploadSession/UploadSession.model");

export class Model extends M.Class<Model>($I`UploadSessionModel`)(
  {
    ...makeFields(SharedEntityIds.UploadSessionId, {
      organizationId: SharedEntityIds.OrganizationId.annotations({
        description: "Organization owning this upload session",
      }),
      fileKey: File.UploadKey.to.annotations({
        description: "S3 object key - unique identifier for the upload target",
      }),
      signature: HmacSignature,
      metadata: M.JsonFromString(UploadSessionMetadata),
      expiresAt: BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this upload session expires",
      }),
    }),
  },
  $I.annotations("UploadSessionModel", {
    description: "The schema for the UploadSession Entity",
  })
) {
  static readonly utils = modelKit(Model);
}
