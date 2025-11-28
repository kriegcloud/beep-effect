import { BS } from "@beep/schema";
import { DocumentsEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

export class Model extends M.Class<Model>(`KnowledgeSpaceModel`)(
  makeFields(DocumentsEntityIds.KnowledgeSpaceId, {
    organizationId: SharedEntityIds.OrganizationId,
    teamId: BS.FieldOptionOmittable(SharedEntityIds.TeamId),
    ownerId: SharedEntityIds.UserId,
    name: BS.NameAttribute,
    slug: S.String,
    description: BS.FieldOptionOmittable(S.String),
    isEncrypted: S.Boolean,
    encryptionKeyId: BS.FieldOptionOmittable(S.String), // Reference to key management system
    defaultPermissions: S.Struct({
      canRead: S.Array(S.String),
      canWrite: S.Array(S.String),
    }),
  })
) {
  static readonly utils = modelKit(Model);
}
