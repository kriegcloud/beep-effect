import { $UiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

// import * as O from "effect/Option";
// import { Atom } from "effect/unstable/reactivity";
// import { useAtom } from "@effect/atom-react";

const $I = $UiId.create("components/codegraph/components/SearchBar");

export const SearchMode = LiteralKit(["focus", "fit"]).pipe(
  $I.annoteSchema("SearchMode", {
    description: "The search mode for the codegraph",
  })
);

export type SearchMode = typeof SearchMode.Type;

export class SearchBarProps extends S.Class<SearchBarProps>($I`SearchBarProps`)({
  // cy:
}) {}
