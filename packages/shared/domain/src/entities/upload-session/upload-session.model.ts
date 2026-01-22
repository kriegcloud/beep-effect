import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { makeFields } from "@beep/shared-domain/common";
import * as M from "@effect/sql/Model";
import { SharedEntityIds } from "../../entity-ids";
import { HmacSignature } from "../../services/EncryptionService/schemas";
import * as File from "../file";
import { UploadSessionMetadata } from "./schemas";

const $I = $SharedDomainId.create("entities/UploadSession");

/**
 * Upload session model for HMAC signature verification workflow.
 *
 * @remarks
 * This model represents a temporary upload session that is created during
 * upload initiation and deleted after successful verification or expiration.
 *
 * ## Purpose
 * - **Signature Verification**: Stores the HMAC signature and metadata for verification
 *   when the client completes the upload
 * - **Replay Attack Prevention**: Sessions are deleted after verification, preventing
 *   reuse of the same signature
 * - **Expiration Enforcement**: Sessions have a TTL after which they are invalid
 */
export class Model extends M.Class<Model>($I`UploadSessionModel`)(
  {
    ...makeFields(SharedEntityIds.UploadSessionId, {
      /** Organization ID for multi-tenancy */
      organizationId: SharedEntityIds.OrganizationId.annotations({
        description: "Organization owning this upload session",
      }),

      /** S3 object key (full path) */
      fileKey: File.UploadKey.to.annotations({
        description: "S3 object key - unique identifier for the upload target",
      }),

      /** HMAC-SHA256 signature for verification */
      signature: HmacSignature,

      /** Signed metadata payload */
      metadata: M.JsonFromString(UploadSessionMetadata),

      /** Expiration timestamp for TTL enforcement */
      expiresAt: BS.DateTimeUtcFromAllAcceptable.annotations({
        description: "When this upload session expires",
      }),
    }),
  },
  $I.annotations("UploadSessionModel", {
    description: "The schema for the UploadSession Entity",
  })
) {}
