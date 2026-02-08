import { $KnowledgeServerId } from "@beep/identity/packages";
import { HttpClient } from "@effect/platform";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $KnowledgeServerId.create("Service/ExternalEntityCatalog");

/**
 * Capability-level interface for external entity catalogs used for reconciliation.
 *
 * Notes:
 * - This must remain domain-agnostic. Vendor-specific implementations live under `Service/Integrations/*`.
 * - A safe default (`ExternalEntityCatalogNoneLive`) is provided so reconciliation can run without network deps.
 */

export class ExternalEntityCandidate extends S.Class<ExternalEntityCandidate>($I`ExternalEntityCandidate`)(
  {
    catalogKey: S.String,
    id: S.String,
    uri: S.String,
    label: S.String,
    description: S.optionalWith(S.OptionFromNullishOr(S.String, null), { default: O.none<string> }),
    score: S.Number.pipe(S.between(0, 100)),
  },
  $I.annotations("ExternalEntityCandidate", {
    description: "Scored external catalog entity candidate (catalogKey, id, uri, label, optional description, score).",
  })
) {}

export class ExternalEntitySearchOptions extends S.Class<ExternalEntitySearchOptions>($I`ExternalEntitySearchOptions`)(
  {
    language: S.optionalWith(S.String, { default: () => "en" }),
    limit: S.optionalWith(S.Int.pipe(S.positive()), { default: () => 5 }),
    // Optional hint for catalogs that support type filtering (ignored by catalogs that don't).
    types: S.optionalWith(S.Array(S.String), { default: () => [] }),
  },
  $I.annotations("ExternalEntitySearchOptions", {
    description: "Options for external catalog entity search (language + limit + optional types hint).",
  })
) {}

export class ExternalEntityCatalogError extends S.TaggedError<ExternalEntityCatalogError>($I`ExternalEntityCatalogError`)(
  "ExternalEntityCatalogError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annotations("ExternalEntityCatalogError", { description: "External entity catalog failure" })
) {}

export interface ExternalEntityCatalogShape {
  readonly searchEntities: (
    query: string,
    options?: undefined | ExternalEntitySearchOptions
  ) => Effect.Effect<ReadonlyArray<ExternalEntityCandidate>, ExternalEntityCatalogError>;
}

export class ExternalEntityCatalog extends Context.Tag($I`ExternalEntityCatalog`)<
  ExternalEntityCatalog,
  ExternalEntityCatalogShape
>() {}

export const ExternalEntityCatalogNoneLive = Layer.succeed(ExternalEntityCatalog, {
  searchEntities: (_query: string, _options?: ExternalEntitySearchOptions) => Effect.succeed([]),
});

/**
 * Integration helper: lift a `HttpClient`-backed implementation into the catalog capability.
 *
 * This exists to keep Integrations modules thin and consistent.
 */
export const makeHttpExternalEntityCatalog = (
  impl: ExternalEntityCatalogShape
): Layer.Layer<ExternalEntityCatalog, never, HttpClient.HttpClient> =>
  Layer.effect(ExternalEntityCatalog, Effect.succeed(impl));

