import { $DocumentsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { DocumentsEntityIds, KnowledgeEntityIds, SharedEntityIds } from "@beep/shared-domain";
import { makeFields } from "@beep/shared-domain/common";
import { modelKit } from "@beep/shared-domain/factories";
import * as M from "@effect/sql/Model";
import * as S from "effect/Schema";
import { DefaultAccess, PageType, TextStyle } from "../../value-objects";

const $I = $DocumentsDomainId.create("entities/page/page.model");

/**
 * Page model representing a universal container with infinite nesting.
 * Pages are the primary organizational unit (like Notion pages).
 * Each page has a type discriminating its behavior: document (rich text),
 * dashboard (FlexLayout panels), client-database (client data hub),
 * workspace (team collaboration), or template (reusable structure).
 */
export class Model extends M.Class<Model>($I`PageModel`)(
  makeFields(DocumentsEntityIds.PageId, {
    organizationId: SharedEntityIds.OrganizationId,
    createdById: SharedEntityIds.UserId,
    parentId: BS.FieldOptionOmittable(DocumentsEntityIds.PageId),
    title: BS.FieldOptionOmittable(S.String.pipe(S.maxLength(500))),
    icon: BS.FieldOptionOmittable(S.String),
    coverImage: BS.FieldOptionOmittable(S.String),
    type: BS.toOptionalWithDefault(PageType)("document"),
    content: BS.FieldOptionOmittable(S.String),
    contentRich: BS.FieldOptionOmittable(S.Unknown),
    yjsSnapshot: BS.FieldOptionOmittable(S.Uint8ArrayFromSelf),
    layoutConfig: BS.FieldOptionOmittable(S.Unknown),
    ontologyId: BS.FieldOptionOmittable(KnowledgeEntityIds.OntologyId),
    textStyle: BS.toOptionalWithDefault(TextStyle)("default"),
    smallText: BS.toOptionalWithDefault(S.Boolean)(false),
    fullWidth: BS.toOptionalWithDefault(S.Boolean)(false),
    lockPage: BS.toOptionalWithDefault(S.Boolean)(false),
    toc: BS.toOptionalWithDefault(S.Boolean)(true),
    isArchived: BS.toOptionalWithDefault(S.Boolean)(false),
    isPublished: BS.toOptionalWithDefault(S.Boolean)(false),
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
