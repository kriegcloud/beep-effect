import { $KnowledgeServerId } from "@beep/identity/packages";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("Service/WikidataClient");

export class WikidataApiError extends S.TaggedError<WikidataApiError>()("WikidataApiError", {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}

export class WikidataRateLimitError extends S.TaggedError<WikidataRateLimitError>()("WikidataRateLimitError", {
  message: S.String,
  retryAfterMs: S.optional(S.DurationFromMillis),
  cause: S.optional(S.Defect),
}) {}

export interface WikidataSearchOptions {
  readonly language?: string;
  readonly limit?: number;
}

export interface WikidataCandidate {
  readonly qid: string;
  readonly label: string;
  readonly description?: string;
  readonly url?: string;
  /**
   * Confidence score 0..100 (heuristic for Live client; tests can inject exact scores).
   */
  readonly score: number;
}

export interface WikidataClientShape {
  readonly searchEntities: (
    query: string,
    options?: WikidataSearchOptions
  ) => Effect.Effect<ReadonlyArray<WikidataCandidate>, WikidataApiError | WikidataRateLimitError>;
}

export class WikidataClient extends Context.Tag($I`WikidataClient`)<WikidataClient, WikidataClientShape>() {}

const WikidataSearchItemSchema = S.Struct({
  id: S.String,
  label: S.String,
  description: S.optional(S.String),
  concepturi: S.optional(S.String),
});

const WikidataSearchResponseSchema = S.Struct({
  search: S.Array(WikidataSearchItemSchema),
});

type WikidataSearchItem = S.Schema.Type<typeof WikidataSearchItemSchema>;

const heuristicScore = (query: string, item: WikidataSearchItem): number => {
  const q = Str.toLowerCase(Str.trim(query));
  const label = Str.toLowerCase(Str.trim(item.label));
  if (Str.isEmpty(q) || Str.isEmpty(label)) return 0;
  if (q === label) return 95;
  if (label.includes(q) || q.includes(label)) return 80;
  return 60;
};

const WIKIDATA_API_BASE = "https://www.wikidata.org/w/api.php";

const serviceEffect: Effect.Effect<WikidataClientShape, never, HttpClient.HttpClient> = Effect.gen(function* () {
  const http = yield* HttpClient.HttpClient;

  const searchEntities: WikidataClientShape["searchEntities"] = (query, options = {}) =>
    Effect.gen(function* () {
      const language = options.language ?? "en";
      const limit = options.limit ?? 5;

      const request = HttpClientRequest.get(WIKIDATA_API_BASE).pipe(
        HttpClientRequest.setUrlParam("action", "wbsearchentities"),
        HttpClientRequest.setUrlParam("format", "json"),
        HttpClientRequest.setUrlParam("search", query),
        HttpClientRequest.setUrlParam("language", language),
        HttpClientRequest.setUrlParam("limit", String(limit))
      );

      const response = yield* http.execute(request).pipe(
        Effect.flatMap(HttpClientResponse.schemaBodyJson(WikidataSearchResponseSchema)),
        Effect.mapError(
          (cause) =>
            new WikidataApiError({
              message: `Wikidata search failed: ${String(cause)}`,
              cause: cause as unknown,
            })
        ),
        Effect.scoped
      );

      return response.search.map((item) => ({
        qid: item.id,
        label: item.label,
        description: item.description,
        url: item.concepturi,
        score: heuristicScore(query, item),
      }));
    }).pipe(
      Effect.withSpan("WikidataClient.searchEntities", {
        captureStackTrace: false,
        attributes: {
          queryLength: Str.length(query),
          language: options.language ?? "en",
          limit: options.limit ?? 5,
        },
      })
    );

  return WikidataClient.of({ searchEntities });
});

export const WikidataClientLive = Layer.effect(WikidataClient, serviceEffect);

