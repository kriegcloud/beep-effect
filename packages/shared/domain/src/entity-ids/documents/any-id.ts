import { $SharedDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Ids from "./ids";

const $I = $SharedDomainId.create("entity-ids/documents/any-id");

export class AnyId extends S.Union(
  Ids.DocumentId,
  Ids.DocumentVersionId,
  Ids.DiscussionId,
  Ids.CommentId,
  Ids.DocumentFileId,
  Ids.PageId,
  Ids.PageShareId,
).annotations(
  $I.annotations("AnyDocumentsId", {
    description: "Any entity id within the documents domain context",
  })
) {}

export declare namespace AnyId {
  export type Type = S.Schema.Type<typeof AnyId>;
  export type Encoded = S.Schema.Encoded<typeof AnyId>;
}
