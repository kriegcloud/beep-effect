import {$DocumentsDomainId} from "@beep/identity/packages";
import {DocumentsEntityIds} from "@beep/shared-domain";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("entities/Page/Page.values");

/**
 * Breadcrumb schema for page ancestry.
 */
export class Breadcrumb extends S.Class<Breadcrumb>($I`Breadcrumb`)(
  {
    id: DocumentsEntityIds.PageId,
    title: S.optional(S.String),
    icon: S.optional(S.String),
  },
  $I.annotations("Breadcrumb", {
    description: "Breadcrumb schema for page ancestry."
  })
) {
}