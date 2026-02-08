import { $KnowledgeServerId } from "@beep/identity/packages";
import { HttpClient, HttpClientRequest, HttpClientResponse } from "@effect/platform";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  ExternalEntityCandidate,
  ExternalEntityCatalog,
  ExternalEntityCatalogError,
  type ExternalEntityCatalogShape,
  ExternalEntitySearchOptions,
} from "../ExternalEntityCatalog";

const $I = $KnowledgeServerId.create("Service/Integrations/WikidataCatalog");

const CATALOG_KEY = "wikidata";

class WikidataSearchItem extends S.Class<WikidataSearchItem>($I`WikidataSearchItem`)(
  {
    id: S.String,
    label: S.String,
    description: S.optional(S.String),
  },
  $I.annotations("WikidataSearchItem", {
    description: "Single item in Wikidata `wbsearchentities` response search array.",
  })
) {}

class WikidataSearchResponse extends S.Class<WikidataSearchResponse>($I`WikidataSearchResponse`)(
  { search: S.Array(WikidataSearchItem) },
  $I.annotations("WikidataSearchResponse", {
    description: "Minimal Wikidata `wbsearchentities` JSON response shape used for decoding.",
  })
) {}

const scoreCandidate = (query: string, label: string): number => {
  const q = Str.toLowerCase(Str.trim(query));
  const l = Str.toLowerCase(Str.trim(label));
  if (q === l) return 100;
  if (Str.includes(q)(l) || Str.includes(l)(q)) return 80;
  return 65;
};

const makeWikidataCandidate = (query: string, item: WikidataSearchItem): ExternalEntityCandidate =>
  new ExternalEntityCandidate({
    catalogKey: CATALOG_KEY,
    id: item.id,
    uri: `http://www.wikidata.org/entity/${item.id}`,
    label: item.label,
    description: O.fromNullable(item.description),
    score: scoreCandidate(query, item.label),
  });

const serviceEffect: Effect.Effect<ExternalEntityCatalogShape, never, HttpClient.HttpClient> = Effect.gen(function* () {
  const http = yield* HttpClient.HttpClient;

  const searchEntities: ExternalEntityCatalogShape["searchEntities"] = (query, options) =>
    Effect.gen(function* () {
      const params = new ExternalEntitySearchOptions(options ?? {});
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

      return A.map(response.search, (item) => makeWikidataCandidate(query, item));
    }).pipe(
      Effect.mapError(
        (e) =>
          new ExternalEntityCatalogError({
            message: `Wikidata search failed: ${String(e)}`,
            cause: e,
          })
      ),
      Effect.withSpan("WikidataCatalog.searchEntities", { attributes: { queryLength: Str.length(query) } })
    );

  return ExternalEntityCatalog.of({ searchEntities });
});

/**
 * Optional integration layer.
 *
 * Not exported from `packages/knowledge/server/src/Service/index.ts` to avoid coupling
 * the capability parity surface to a specific external catalog vendor.
 */
export const WikidataCatalogLive = Layer.effect(ExternalEntityCatalog, serviceEffect);
