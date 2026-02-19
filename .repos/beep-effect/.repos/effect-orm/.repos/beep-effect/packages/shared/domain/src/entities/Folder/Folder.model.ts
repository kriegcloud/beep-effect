import { makeFields } from "@beep/shared-domain/common";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";

/**
 * Document model representing rich-text documents with collaborative editing support.
 * Supports Yjs snapshots for real-time collaboration, rich content storage,
 * and various display options like text style, full width, and table of contents.
 */

export class Model extends M.Class<Model>(`FolderModel`)(
  makeFields(SharedEntityIds.FolderId, {
    organizationId: SharedEntityIds.OrganizationId,
    userId: SharedEntityIds.UserId,
    name: S.String,
  })
) {
  static readonly utils = modelKit(Model);
}
