import { $KnowledgeServerId } from "@beep/identity/packages";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeServerId.create("Service/WikidataClient");

export class WikidataClientError extends S.TaggedError<WikidataClientError>($I`WikidataClientError`)(
  "WikidataClientError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("WikidataClientError", { description: "Wikidata API client failure" })
) {}

export class WikidataCandidate extends S.Class<WikidataCandidate>($I`WikidataCandidate`)({
  qid: S.String,
  label: S.String,
  description: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
  score: S.Number.pipe(S.between(0, 100)),
}) {}

export class WikidataSearchOptions extends S.Class<WikidataSearchOptions>($I`WikidataSearchOptions`)({
  language: S.optionalWith(S.String, { default: () => "en" }),
  limit: S.optionalWith(S.Int.pipe(S.positive()), { default: () => 5 }),
}) {}

export interface WikidataClientShape {
  readonly searchEntities: (
    query: string,
    options?: undefined | WikidataSearchOptions
  ) => Effect.Effect<ReadonlyArray<WikidataCandidate>, WikidataClientError>;
}

export class WikidataClient extends Context.Tag($I`WikidataClient`)<WikidataClient, WikidataClientShape>() {}

const WikidataSearchResponse = S.Struct({
  search: S.Array(
    S.Struct({
      id: S.String,
      label: S.String,
      description: S.optional(S.String),
    })
  ),
});

const scoreCandidate = (query: string, label: string): number => {
  const q = Str.toLowerCase(Str.trim(query));
  const l = Str.toLowerCase(Str.trim(label));
  if (q === l) return 100;
  if (Str.includes(q)(l) || Str.includes(l)(q)) return 80;
  return 65;
};

const serviceEffect: Effect.Effect<WikidataClientShape, never, HttpClient.HttpClient> = Effect.gen(function* () {
  const http = yield* HttpClient.HttpClient;

  const searchEntities: WikidataClientShape["searchEntities"] = (query, options) =>
    Effect.gen(function* () {
      const params = new WikidataSearchOptions(options ?? {});
      const request = HttpClientRequest.get("https://www.wikidata.org/w/api.php").pipe(
        HttpClientRequest.setUrlParam("action", "wbsearchentities"),
        HttpClientRequest.setUrlParam("format", "json"),
        HttpClientRequest.setUrlParam("search", query),
        HttpClientRequest.setUrlParam("language", params.language ?? "en"),
        HttpClientRequest.setUrlParam("limit", String(params.limit ?? 5))
      );

      const response = yield* http
        .execute(request)
        .pipe(Effect.flatMap(HttpClientResponse.schemaBodyJson(WikidataSearchResponse)), Effect.scoped);

      return A.map(
        response.search,
        (item) =>
          new WikidataCandidate({
            qid: item.id,
            label: item.label,
            description: O.fromNullable(item.description),
            score: scoreCandidate(query, item.label),
          })
      );
    }).pipe(
      Effect.mapError(
        (e) =>
          new WikidataClientError({
            message: `Wikidata search failed: ${String(e)}`,
            cause: e,
          })
      ),
      Effect.withSpan("WikidataClient.searchEntities", { attributes: { queryLength: Str.length(query) } })
    );

  return WikidataClient.of({ searchEntities });
});

export const WikidataClientLive = Layer.effect(WikidataClient, serviceEffect);
