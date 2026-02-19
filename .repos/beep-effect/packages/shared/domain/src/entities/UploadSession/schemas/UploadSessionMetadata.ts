import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import * as File from "../../File";

const $I = $SharedDomainId.create("entities/UploadSession/schemas/UploadSessionMetadata");

export class UploadSessionMetadata extends S.Class<UploadSessionMetadata>($I`UploadSessionMetadata`)({
  fileKey: File.UploadKey.to,
  organizationId: SharedEntityIds.OrganizationId,
  entityKind: EntityKind,
  entityIdentifier: AnyEntityId,
  entityAttribute: S.NonEmptyTrimmedString,
  fileSize: S.NonNegativeInt,
  mimeType: BS.MimeType,
  expiresAt: BS.DateTimeUtcFromAllAcceptable,
  contentHash: S.optionalWith(S.String, { as: "Option" }),
}) {}
