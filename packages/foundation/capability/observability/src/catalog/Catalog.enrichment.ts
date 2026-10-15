/**
 * Export-time catalog enrichment: a tracer wrapper that stamps each span with
 * its owning package, family, privacy tier and identity source, and enforces
 * the `shape-only` attribute allowlist on the emit path.
 *
 * **Details**
 *
 * The wrapper is defence in depth. The strict-tier serializer gate stays the
 * authoritative fence; both read {@link allowedAttributes}, so they agree on
 * which keys a `shape-only` span may carry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import * as Layer from "effect/Layer";
import * as Metric from "effect/Metric";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Tracer from "effect/Tracer";
import { SchemaFailureTagKey, TelemetryRefusalTag, TelemetryRefused } from "../Observability.instruments.ts";
import { allowedAttributes, effectiveTier } from "./Catalog.behavior.ts";
import { SignalKind, TelemetryTier } from "./Catalog.literals.ts";
import { EmitterContext, Instrument, InstrumentCatalog, SpanOwner } from "./Catalog.models.ts";

const $I = $ObservabilityId.create("catalog/Catalog.enrichment");

/**
 * Inputs of {@link layerCatalogEnrichment}: the checked catalog, where the
 * process runs, and the tier it asks to emit at.
 *
 * **Example** (Describe a strict desktop emitter)
 *
 * ```ts import.meta.vitest name="Describe a strict desktop emitter"
 * import { CatalogEnrichmentOptions, InstrumentCatalog, StrictDesktop } from "@beep/observability/catalog"
 *
 * const options = CatalogEnrichmentOptions.make({
 *   catalog: InstrumentCatalog.make({ attributes: [], instruments: [] }),
 *   context: StrictDesktop.make({ identitySource: "vouched" }),
 *   requestedTier: "standard"
 * })
 * options.requestedTier // => "standard"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CatalogEnrichmentOptions extends S.Opaque<CatalogEnrichmentOptions, { readonly brand: unique symbol }>()(
  S.Struct({
    catalog: InstrumentCatalog,
    context: EmitterContext.annotateKey({
      description: "Where the process runs; its tier ceiling clamps the requested tier.",
    }),
    requestedTier: TelemetryTier.annotateKey({
      description: "Tier the process asks to emit at, before the context ceiling applies.",
    }),
  }).pipe(
    $I.annoteSchema("CatalogEnrichmentOptions", {
      description: "Catalog, emitter context and requested tier for export-time span enrichment.",
    })
  )
) {}

/**
 * Effect counter behind the catalog's `beep.telemetry.refused` instrument.
 *
 * **Details**
 *
 * The name and description come from {@link TelemetryRefused}, so the emitted
 * series and the catalog entry cannot drift. Label each update with
 * `beep.schema_failure_tag` through `Metric.withAttributes`.
 *
 * **Example** (Count one refused attribute)
 *
 * ```ts import.meta.vitest name="Count one refused attribute"
 * import * as Effect from "effect/Effect"
 * import * as Metric from "effect/Metric"
 * import { TelemetryRefusedCounter } from "@beep/observability/catalog"
 *
 * const refused = TelemetryRefusedCounter.pipe(
 *   Metric.withAttributes({ "beep.schema_failure_tag": "attribute-not-allowed" })
 * )
 * Effect.isEffect(Metric.update(refused, 1)) // => true
 * ```
 *
 * @category observability
 * @since 0.0.0
 */
export const TelemetryRefusedCounter: Metric.Counter<number> = Metric.counter(TelemetryRefused.name, {
  description: TelemetryRefused.description,
  incremental: true,
});

const refusal = (tag: TelemetryRefusalTag): Metric.Counter<number> =>
  TelemetryRefusedCounter.pipe(Metric.withAttributes({ [SchemaFailureTagKey]: tag }));

const attributeNotAllowed = refusal(TelemetryRefusalTag.Enum["attribute-not-allowed"]);
const stampedKeyOverride = refusal(TelemetryRefusalTag.Enum["stamped-key-override"]);
const spanEventDropped = refusal(TelemetryRefusalTag.Enum["span-event-dropped"]);

const packageKey = "beep.package";
const familyKey = "beep.family";
const privacyTierKey = "beep.privacy_tier";
const identitySourceKey = "beep.identity_source";

const stampedKeys = HashSet.make(packageKey, familyKey, privacyTierKey, identitySourceKey);

const spanOwnerIndex = (catalog: InstrumentCatalog): HashMap.HashMap<string, SpanOwner> =>
  A.reduce(
    A.filter(catalog.instruments, Instrument.guards.SpanInstrument),
    HashMap.empty<string, SpanOwner>(),
    (index, span) =>
      HashMap.has(index, span.name)
        ? index
        : HashMap.set(index, span.name, SpanOwner.make({ package: span.owner, family: span.family }))
  );

const makeCatalogEnrichmentTracer = Effect.fnUntraced(function* (options: CatalogEnrichmentOptions) {
  const currentTracer = yield* Effect.tracer;
  const services = yield* Effect.context<never>();
  const tier = effectiveTier(options.context, options.requestedTier);
  const owners = spanOwnerIndex(options.catalog);
  const shapeOnly = TelemetryTier.is["shape-only"](tier);
  const allowed = allowedAttributes(options.catalog, SignalKind.Enum.span, TelemetryTier.Enum["shape-only"]);
  const isAllowed = (key: string): boolean => !shapeOnly || HashSet.has(allowed, key);

  return Tracer.make({
    span(spanOptions) {
      const span = currentTracer.span(spanOptions);
      const owner = HashMap.get(owners, span.name);
      if (O.isSome(owner)) {
        span.attribute(packageKey, owner.value.package);
        span.attribute(familyKey, owner.value.family);
      }
      span.attribute(privacyTierKey, tier);
      span.attribute(identitySourceKey, options.context.identitySource);

      const originalAttribute = span.attribute;
      span.attribute = function (this: Tracer.Span, key, value) {
        if (HashSet.has(stampedKeys, key)) {
          stampedKeyOverride.updateUnsafe(1, services);
        } else if (isAllowed(key)) {
          originalAttribute.call(this, key, value);
        } else {
          attributeNotAllowed.updateUnsafe(1, services);
        }
      };

      if (shapeOnly) {
        span.event = () => {
          spanEventDropped.updateUnsafe(1, services);
        };
      }

      return span;
    },
    context: currentTracer.context,
  });
});

/**
 * Wrap the current tracer so every span is stamped from the catalog and,
 * under `shape-only`, carries only allowlisted attributes and no events.
 *
 * **Details**
 *
 * On each span the wrapper:
 *
 * - sets `beep.package` and `beep.family` when the span name is in the
 *   catalog, resolved the same way as `packageOf` but through an index built
 *   once with the layer; a span missing from the catalog gets neither key,
 *   and no call site can supply them either (see the next bullets);
 * - sets `beep.privacy_tier` to `effectiveTier` of the context and the
 *   requested tier, and `beep.identity_source` from the context;
 * - owns those four stamped keys at every tier and on every span, catalogued
 *   or not: a creation attribute or later
 *   `span.attribute(...)` that tries to set one is ignored and counted on
 *   `beep.telemetry.refused` as `stamped-key-override`, so no call site can
 *   relabel a span's tier;
 * - when the effective tier is `shape-only`, drops every attribute whose key
 *   is not in `allowedAttributes(catalog, "span", "shape-only")`, counted as
 *   `attribute-not-allowed`, and drops every span event, counted as
 *   `span-event-dropped`. Looser tiers filter no attributes and keep events.
 *
 * Tier and identity are span attributes, never resource attributes, so the
 * resource stays constant per process.
 *
 * **Gotchas**
 *
 * The layer wraps whichever tracer is current when it is built. Compose it
 * with `Layer.provideMerge` over the exporting tracer layer (OTLP or
 * DevTools); built without one, it wraps the default native tracer.
 *
 * It must be the outermost tracer wrapper. The shape-only filters replace
 * `span.attribute` and `span.event` on the span the inner tracers return, so
 * any wrapper composed inside it (for example `layerFilteredDevTools`) sees
 * only the filtered calls. A wrapper composed outside it would receive the
 * raw payload first and could mirror it before the filter runs.
 *
 * **Example** (Enrich spans over an existing tracer)
 *
 * ```ts import.meta.vitest name="Enrich spans over an existing tracer"
 * import * as Layer from "effect/Layer"
 * import * as Tracer from "effect/Tracer"
 * import {
 *   CatalogEnrichmentOptions,
 *   InstrumentCatalog,
 *   Workstation,
 *   HostName,
 *   layerCatalogEnrichment
 * } from "@beep/observability/catalog"
 *
 * const ExportingTracer = Layer.succeed(Tracer.Tracer, Tracer.make({ span: (options) => new Tracer.NativeSpan(options) }))
 * const TracerLive = layerCatalogEnrichment(
 *   CatalogEnrichmentOptions.make({
 *     catalog: InstrumentCatalog.make({ attributes: [], instruments: [] }),
 *     context: Workstation.make({ identitySource: "self-claimed", hostName: HostName.make("dankstation") }),
 *     requestedTier: "standard"
 *   })
 * ).pipe(Layer.provideMerge(ExportingTracer))
 * Layer.isLayer(TracerLive) // => true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layerCatalogEnrichment = (options: CatalogEnrichmentOptions): Layer.Layer<never> =>
  Layer.effect(Tracer.Tracer, makeCatalogEnrichmentTracer(options));
