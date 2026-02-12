import { $DocumentsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import * as Document from "../Document.model";

const $I = $DocumentsDomainId.create("entities/Document/schemas/SearchResult.schema");

export const SearchResult = S.Struct({
  ...Document.Model.select.pick("id", "_rowId", "title", "content").fields,
  rank: S.Number,
}).annotations(
  $I.annotations("SearchResult", {
    description: "Document search result with title, content snippet, and ranking score.",
  })
);

export type SearchResult = typeof SearchResult.Type;
