import { $SharedAiId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $SharedAiId.create("models/web-search-tools");

export class WebSearchDepth extends BS.StringLiteralKit("standard", "deep").annotations(
  $I.annotations("WebSearchDepth", {
    description: "Depth level for web search queries.",
  })
) {}

export declare namespace WebSearchDepth {
  export type Type = typeof WebSearchDepth.Type;
}

export class WebSearchProvider extends BS.StringLiteralKit("exa", "parallel", "tavily").annotations(
  $I.annotations("WebSearchProvider", {
    description: "Web search provider identifier.",
  })
) {}

export declare namespace WebSearchProvider {
  export type Type = typeof WebSearchProvider.Type;
}

export class WebSearchArgs extends S.Struct(
  {
    query: S.String.annotations({
      description: "The search query string.",
    }),
    depth: S.optionalWith(WebSearchDepth, { as: "Option" }).annotations({
      description: "Depth level for the search (standard or deep).",
    }),
    fromDate: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Filter results from this date onwards.",
    }),
    toDate: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Filter results up to this date.",
    }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("WebSearchArgs", {
    description: "Arguments for a web search request.",
  })
) {}

export declare namespace WebSearchArgs {
  export type Type = typeof WebSearchArgs.Type;
}

export class WebSearchItem extends S.Struct(
  {
    title: S.String.annotations({
      description: "Title of the search result.",
    }),
    url: S.String.annotations({
      description: "URL of the search result.",
    }),
    snippet: S.String.annotations({
      description: "Text snippet from the search result.",
    }),
    publishedDate: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Publication date of the content.",
    }),
    source: S.optionalWith(S.String, { as: "Option" }).annotations({
      description: "Source or domain of the result.",
    }),
    metadata: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option" }).annotations({
      description: "Additional metadata from the search provider.",
    }),
  },
  S.Record({ key: S.String, value: S.Unknown })
).annotations(
  $I.annotations("WebSearchItem", {
    description: "A single web search result item.",
  })
) {}

export declare namespace WebSearchItem {
  export type Type = typeof WebSearchItem.Type;
}

export class WebSearchResult extends S.Class<WebSearchResult>($I`WebSearchResult`)(
  {
    results: S.Array(WebSearchItem).annotations({
      description: "Array of search result items.",
    }),
    totalResults: S.NonNegativeInt.annotations({
      description: "Total number of results found.",
    }),
    query: S.String.annotations({
      description: "The original search query.",
    }),
    timestamp: S.String.annotations({
      description: "Timestamp when the search was performed.",
    }),
    provider: WebSearchProvider.annotations({
      description: "The search provider used.",
    }),
  },
  $I.annotations("WebSearchResult", {
    description: "Complete result from a web search operation.",
  })
) {}

export declare namespace WebSearchResult {
  export type Type = typeof WebSearchResult.Type;
}
