/**
 * Pure, total operations over the instrument catalog: merging declarations,
 * reading the attribute allowlist, combining tier ceilings, and resolving a
 * span's owning package.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Result from "effect/Result";
import { isStricterTier, stricterTier, TelemetryTier } from "./Catalog.literals.ts";
import {
  catalogConflicts,
  EmitterContext,
  Instrument,
  InstrumentCatalog,
  instrumentSignal,
  SpanOwner,
} from "./Catalog.models.ts";
import type { CatalogConflict } from "./Catalog.errors.ts";
import type { SignalKind } from "./Catalog.literals.ts";
import type { AttributeKey, InstrumentDeclarations, SpanInstrument } from "./Catalog.models.ts";
import type { AttributeKeyName } from "./Catalog.names.ts";

const AttributeKeyOrder: Order.Order<AttributeKey> = Order.mapInput(Order.String, (attribute) => attribute.key);

const InstrumentOrder: Order.Order<Instrument> = Order.combine(
  Order.mapInput(Order.String, instrumentSignal),
  Order.mapInput(Order.String, (instrument: Instrument) => instrument.name)
);

const spanIdentity = (span: SpanInstrument): string => `${span.owner} ${span.name}`;

/**
 * Merges every package's declarations and the harvested span section into one
 * checked catalog.
 *
 * **Details**
 *
 * A declared span replaces the harvested span with the same owner and name,
 * so a package can add attributes or a tier override to a harvested span.
 * Attribute keys are sorted by key and instruments by signal then name, so the
 * generated catalog is stable. Every conflict is reported, not only the first.
 *
 * **Example** (Merge two packages)
 *
 * ```ts import.meta.vitest name="Merge two packages"
 * import * as Result from "effect/Result"
 * import { InstrumentDeclarations, mergeDeclarations } from "@beep/observability/catalog"
 *
 * const merged = mergeDeclarations([InstrumentDeclarations.make({}), InstrumentDeclarations.make({})], [])
 * Result.isSuccess(merged) // => true
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const mergeDeclarations: {
  (
    harvestedSpans: Iterable<SpanInstrument>
  ): (
    declarations: Iterable<InstrumentDeclarations>
  ) => Result.Result<InstrumentCatalog, A.NonEmptyReadonlyArray<CatalogConflict>>;
  (
    declarations: Iterable<InstrumentDeclarations>,
    harvestedSpans: Iterable<SpanInstrument>
  ): Result.Result<InstrumentCatalog, A.NonEmptyReadonlyArray<CatalogConflict>>;
} = dual(
  2,
  (
    declarations: Iterable<InstrumentDeclarations>,
    harvestedSpans: Iterable<SpanInstrument>
  ): Result.Result<InstrumentCatalog, A.NonEmptyReadonlyArray<CatalogConflict>> => {
    const files = A.fromIterable(declarations);
    const attributes = A.sort(
      A.flatMap(files, (file) => file.attributes),
      AttributeKeyOrder
    );
    const declared = A.flatMap(files, (file) => file.instruments);
    const declaredSpans = HashSet.fromIterable(
      A.map(A.filter(declared, Instrument.guards.SpanInstrument), spanIdentity)
    );
    const harvested = A.filter(
      A.fromIterable(harvestedSpans),
      (span) => !HashSet.has(declaredSpans, spanIdentity(span))
    );
    const instruments = A.sort(A.appendAll(declared, harvested), InstrumentOrder);
    const conflicts = catalogConflicts({ attributes, instruments });
    return A.isReadonlyArrayNonEmpty(conflicts)
      ? Result.fail(conflicts)
      : Result.succeed(InstrumentCatalog.make({ attributes, instruments }));
  }
);

/**
 * Closed set of attribute keys a signal may carry at a tier.
 *
 * **Details**
 *
 * A key is allowed when its `signals` include the signal and the tier is no
 * stricter than the key's `minTier`. The strict-tier gate and the collector
 * allowlist generator read this set.
 *
 * **Example** (Read the shape-only span allowlist)
 *
 * ```ts import.meta.vitest name="Read the shape-only span allowlist"
 * import * as HashSet from "effect/HashSet"
 * import { InstrumentCatalog, allowedAttributes } from "@beep/observability/catalog"
 *
 * const catalog = InstrumentCatalog.make({ attributes: [], instruments: [] })
 * HashSet.size(allowedAttributes(catalog, "span", "shape-only")) // => 0
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const allowedAttributes: {
  (signal: SignalKind, tier: TelemetryTier): (catalog: InstrumentCatalog) => HashSet.HashSet<AttributeKeyName>;
  (catalog: InstrumentCatalog, signal: SignalKind, tier: TelemetryTier): HashSet.HashSet<AttributeKeyName>;
} = dual(
  3,
  (catalog: InstrumentCatalog, signal: SignalKind, tier: TelemetryTier): HashSet.HashSet<AttributeKeyName> =>
    HashSet.fromIterable(
      A.map(
        A.filter(
          catalog.attributes,
          (attribute) => A.contains(attribute.signals, signal) && !isStricterTier(tier, attribute.minTier)
        ),
        (attribute) => attribute.key
      )
    )
);

/**
 * Loosest tier a record from this emitter context may carry.
 *
 * **Example** (Read a browser ceiling)
 *
 * ```ts import.meta.vitest name="Read a browser ceiling"
 * import { Browser, tierCeiling } from "@beep/observability/catalog"
 *
 * tierCeiling(Browser.make({ identitySource: "self-claimed" })) // => "shape-only"
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const tierCeiling: (context: EmitterContext) => TelemetryTier = EmitterContext.match({
  Workstation: () => TelemetryTier.Enum["dev-verbose"],
  Server: () => TelemetryTier.Enum.standard,
  StrictDesktop: () => TelemetryTier.Enum["shape-only"],
  CiRunner: () => TelemetryTier.Enum.standard,
  CloudVm: () => TelemetryTier.Enum.standard,
  Serverless: () => TelemetryTier.Enum.standard,
  Browser: () => TelemetryTier.Enum["shape-only"],
});

/**
 * Tier a record is actually emitted at: the stricter of the requested tier
 * and the emitter context's ceiling.
 *
 * **Example** (Clamp a verbose request on a server)
 *
 * ```ts import.meta.vitest name="Clamp a verbose request on a server"
 * import { HostName, Server, effectiveTier } from "@beep/observability/catalog"
 *
 * const server = Server.make({ identitySource: "vouched", hostName: HostName.make("api-01") })
 * effectiveTier(server, "dev-verbose") // => "standard"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const effectiveTier: {
  (requested: TelemetryTier): (context: EmitterContext) => TelemetryTier;
  (context: EmitterContext, requested: TelemetryTier): TelemetryTier;
} = dual(
  2,
  (context: EmitterContext, requested: TelemetryTier): TelemetryTier => stricterTier(tierCeiling(context), requested)
);

/**
 * Package and family that own a span name, for export-time enrichment.
 *
 * **Example** (Resolve an unknown span)
 *
 * ```ts import.meta.vitest name="Resolve an unknown span"
 * import * as O from "effect/Option"
 * import { InstrumentCatalog, packageOf } from "@beep/observability/catalog"
 *
 * const catalog = InstrumentCatalog.make({ attributes: [], instruments: [] })
 * O.isNone(packageOf(catalog, "Parcels.read")) // => true
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const packageOf: {
  (spanName: string): (catalog: InstrumentCatalog) => O.Option<SpanOwner>;
  (catalog: InstrumentCatalog, spanName: string): O.Option<SpanOwner>;
} = dual(
  2,
  (catalog: InstrumentCatalog, spanName: string): O.Option<SpanOwner> =>
    O.map(
      A.findFirst(
        catalog.instruments,
        (instrument): instrument is SpanInstrument =>
          Instrument.guards.SpanInstrument(instrument) && instrument.name === spanName
      ),
      (span) => SpanOwner.make({ package: span.owner, family: span.family })
    )
);
