/**
 * Page model schema.
 *
 * This is the canonical schema for Page data at the domain boundary.
 * Server persistence layers should prefer `Model.insert` / `Model.update` when decoding inputs
 * so defaults are applied consistently.
 *
 * @module documents-domain/entities/Page/Page.model
 * @since 1.0.0
 * @category models
 */
import { $WorkspacesDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { WorkspacesEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { DefaultAccess, PageType, SerializedEditorStateEnvelope, TextStyle } from "../../value-objects";

const $I = $WorkspacesDomainId.create("entities/Page/Page.model");

/**
 * Page model representing a universal container with infinite nesting.
 * Pages are the primary organizational unit (like Notion pages).
 * Each page has a type discriminating its behavior: document (rich text),
 * dashboard (FlexLayout panels), client-database (client data hub),
 * workspace (team collaboration), or template (reusable structure).
 */
export class Model extends M.Class<Model>($I`PageModel`)(
  makeFields(WorkspacesEntityIds.PageId, {
    organizationId: SharedEntityIds.OrganizationId,
    createdById: SharedEntityIds.UserId,
    parentId: BS.FieldOptionOmittable(WorkspacesEntityIds.PageId),
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    icon: BS.FieldOptionOmittable(BS.URLString),
    coverImage: BS.FieldOptionOmittable(BS.URLString),
    type: BS.toOptionalWithDefault(PageType)("document"),
    content: BS.FieldOptionOmittable(S.String),
    contentRich: BS.FieldOptionOmittable(SerializedEditorStateEnvelope),
    yjsSnapshot: BS.FieldOptionOmittable(S.Uint8ArrayFromSelf),
    layoutConfig: BS.FieldOptionOmittable(S.Unknown),
    ontologyId: BS.FieldOptionOmittable(KnowledgeEntityIds.OntologyId),
    textStyle: BS.toOptionalWithDefault(TextStyle)("default"),
    smallText: BS.BoolWithDefault(false),
    fullWidth: BS.BoolWithDefault(false),
    lockPage: BS.BoolWithDefault(false),
    toc: BS.BoolWithDefault(true),
    isArchived: BS.BoolWithDefault(false),
    isPublished: BS.BoolWithDefault(false),
    defaultAccess: BS.toOptionalWithDefault(DefaultAccess)("private"),
    shareToken: BS.FieldOptionOmittable(S.String),
    position: BS.FieldOptionOmittable(S.Number),
    metadata: BS.FieldOptionOmittable(S.Unknown),
  }),
  $I.annotations("PageModel", {
    description: "Page model representing a universal container with infinite nesting and type-discriminated behavior.",
  })
) {
  static readonly utils = modelKit(Model);
}
