/**
 * Pure building and rendering for the instrumentation catalog: harvested span
 * rows, the merged catalog check, the generated JSONC text, and the generated
 * section of the observability standard.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Catalog from "@beep/observability/catalog";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  CatalogBuild,
  FamilySpanCount,
  HarvestedSpan,
  INSTRUMENTATION_CATALOG_GENERATED_BY,
  INSTRUMENTATION_CATALOG_PATH,
  InstrumentationCatalogDocument,
} from "./Observability.schemas.ts";
import type { SpanHarvest } from "./Observability.schemas.ts";

const isConformingSpanName = S.is(Catalog.SpanName);
const decodeSpanInstrument = S.decodeUnknownOption(Catalog.SpanInstrument);
const encodeDocument = S.encodeEffect(InstrumentationCatalogDocument);
const encodeCompactJson = S.encodeEffect(S.fromJsonString(S.Unknown));

const HarvestedSpanOrder: Order.Order<HarvestedSpan> = Order.combine(
  Order.mapInput(Order.String, (row: HarvestedSpan) => row.name),
  Order.mapInput(Order.String, (row: HarvestedSpan) => row.owner)
);

const AttributeKeyOrder: Order.Order<Catalog.AttributeKey> = Order.mapInput(
  Order.String,
  (attribute: Catalog.AttributeKey) => attribute.key
);

const InstrumentOrder: Order.Order<Catalog.Instrument> = Order.combine(
  Order.mapInput(Order.String, Catalog.instrumentSignal),
  Order.mapInput(Order.String, (instrument: Catalog.Instrument) => instrument.name)
);

/**
 * Generated span section rows: one per (owner, name), sorted by name then
 * owner, with `conforms` set when the name is in `Concept(.Sub)*.action` form.
 *
 * **Example** (Collapse repeated sites)
 *
 * ```ts
 * import { PackageName } from "@beep/observability/catalog"
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { SpanHarvest, SpanSite, harvestedSpans } from "@beep/repo-cli/commands/Observability"
 *
 * const site = SpanSite.make({
 *   name: "db.query",
 *   owner: PackageName.make("@beep/duckdb"),
 *   family: "driver",
 *   file: PosixPath.make("packages/drivers/duckdb/src/DuckDb.ts"),
 *   line: 1,
 *   callee: "Effect.withSpan"
 * })
 * const rows = harvestedSpans(SpanHarvest.make({ sites: [site, site], findings: [] }))
 * console.log(rows.length, rows[0]?.conforms) // 1 false
 * ```
 *
 * @param harvest - Harvest containing source span sites.
 * @returns Deduplicated span rows sorted by name and owner.
 * @category mapping
 * @since 0.0.0
 */
export const harvestedSpans = (harvest: SpanHarvest): ReadonlyArray<HarvestedSpan> =>
  A.sort(
    A.dedupeWith(
      A.map(harvest.sites, (site) =>
        HarvestedSpan.make({
          name: site.name,
          owner: site.owner,
          family: site.family,
          conforms: isConformingSpanName(site.name),
        })
      ),
      (left, right) => left.name === right.name && left.owner === right.owner
    ),
    HarvestedSpanOrder
  );

/**
 * Catalog span instrument for a harvested row, or `None` when the name is not
 * a valid span name at all (for example, surrounded by whitespace).
 *
 * **Example** (Convert a harvested row)
 *
 * ```ts
 * import { PackageName } from "@beep/observability/catalog"
 * import * as O from "effect/Option"
 * import { HarvestedSpan, harvestedSpanInstrument } from "@beep/repo-cli/commands/Observability"
 *
 * const row = HarvestedSpan.make({ name: "Parcels.read", owner: PackageName.make("@beep/parcels"), family: "slice", conforms: true })
 * console.log(O.map(harvestedSpanInstrument(row), (span) => span.origin)) // { _id: 'Option', _tag: 'Some', value: 'harvested' }
 * ```
 *
 * @param row - Harvested span row to validate and convert.
 * @returns The catalog span instrument, or None for an invalid name.
 * @category mapping
 * @since 0.0.0
 */
export const harvestedSpanInstrument = (row: HarvestedSpan): O.Option<Catalog.SpanInstrument> =>
  decodeSpanInstrument({
    _tag: "SpanInstrument",
    name: row.name,
    owner: row.owner,
    family: row.family,
    minTier: Catalog.TelemetryTier.Enum["shape-only"],
    description: "Harvested span literal.",
    kind: Catalog.SpanKind.Enum.internal,
    origin: Catalog.InstrumentOrigin.Enum.harvested,
    conforms: row.conforms,
  });

/**
 * Builds the generated document and merges it, reporting every conflict as a
 * rendered line.
 *
 * **Details**
 *
 * Declared attributes are sorted by key and declared instruments by signal
 * then name. Harvested rows that are not valid span names are reported as
 * conflicts instead of being dropped silently.
 *
 * **Example** (Build an empty catalog)
 *
 * ```ts
 * import { SpanHarvest, buildCatalog } from "@beep/repo-cli/commands/Observability"
 *
 * const built = buildCatalog(SpanHarvest.make({ sites: [], findings: [] }), [])
 * console.log(built.conflicts.length) // 0
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const buildCatalog: {
  (declarations: ReadonlyArray<Catalog.InstrumentDeclarations>): (harvest: SpanHarvest) => CatalogBuild;
  (harvest: SpanHarvest, declarations: ReadonlyArray<Catalog.InstrumentDeclarations>): CatalogBuild;
} = dual(2, (harvest: SpanHarvest, declarations: ReadonlyArray<Catalog.InstrumentDeclarations>): CatalogBuild => {
  const spans = harvestedSpans(harvest);
  const instruments = A.map(spans, (row) => ({ row, instrument: harvestedSpanInstrument(row) }));
  const invalid = A.flatMap(instruments, ({ row, instrument }) =>
    O.isNone(instrument) ? [`span "${row.name}" in ${row.owner} is not a valid span name`] : []
  );
  const merged = Catalog.mergeDeclarations(
    declarations,
    A.getSomes(A.map(instruments, ({ instrument }) => instrument))
  );
  const conflicts = Result.match(merged, {
    onSuccess: () => [],
    onFailure: (failures) => A.map(failures, Catalog.describeConflict),
  });
  const document = InstrumentationCatalogDocument.make({
    attributes: A.sort(
      A.flatMap(declarations, (file) => file.attributes),
      AttributeKeyOrder
    ),
    instruments: A.sort(
      A.flatMap(declarations, (file) => file.instruments),
      InstrumentOrder
    ),
    spans,
  });
  return CatalogBuild.make({ document, conflicts: [...invalid, ...conflicts] });
});

/**
 * Span counts per package family, in `PackageFamily` order, zeros included.
 *
 * **Example** (Count an empty section)
 *
 * ```ts
 * import { familySpanCounts } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(familySpanCounts([]).length) // 7
 * ```
 *
 * @param spans - Harvested span rows to count by package family.
 * @returns Counts for every package family in canonical order, including zeros.
 * @category folding
 * @since 0.0.0
 */
export const familySpanCounts = (spans: ReadonlyArray<HarvestedSpan>): ReadonlyArray<FamilySpanCount> =>
  A.map(Catalog.PackageFamily.literals, (family) => {
    const rows = A.filter(spans, (row) => row.family === family);
    return FamilySpanCount.make({
      family,
      spans: A.length(rows),
      conforming: A.length(A.filter(rows, (row) => row.conforms)),
    });
  });

const renderArray = Effect.fn("Observability.renderArray")(function* (key: string, values: ReadonlyArray<unknown>) {
  if (A.isReadonlyArrayEmpty(values)) {
    return `  "${key}": []`;
  }
  const lines = yield* Effect.forEach(values, (value) => encodeCompactJson(value));
  return `  "${key}": [\n${A.join(
    A.map(lines, (line) => `    ${line}`),
    ",\n"
  )}\n  ]`;
});

/**
 * Renders the generated catalog as deterministic JSONC, one array entry per
 * line so diffs stay reviewable.
 *
 * **Example** (Render an empty document)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { InstrumentationCatalogDocument, renderCatalogText } from "@beep/repo-cli/commands/Observability"
 *
 * const text = Effect.runSync(
 *   renderCatalogText(InstrumentationCatalogDocument.make({ attributes: [], instruments: [], spans: [] }))
 * )
 * console.log(text.startsWith("// Generated by")) // true
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const renderCatalogText = Effect.fn("Observability.renderCatalogText")(function* (
  document: InstrumentationCatalogDocument
) {
  const encoded = yield* encodeDocument(document);
  const header = yield* Effect.forEach(
    [
      ["schemaVersion", encoded.schemaVersion],
      ["generatedBy", encoded.generatedBy],
    ] as const,
    ([key, value]) => Effect.map(encodeCompactJson(value), (json) => `  "${key}": ${json}`)
  );
  const attributes = yield* renderArray("attributes", encoded.attributes);
  const instruments = yield* renderArray("instruments", encoded.instruments);
  const spans = yield* renderArray("spans", encoded.spans);
  return `// Generated by ${INSTRUMENTATION_CATALOG_GENERATED_BY}. Do not edit manually.\n{\n${A.join(
    [...header, attributes, instruments, spans],
    ",\n"
  )}\n}\n`;
});

/**
 * Opening marker of the generated section in the observability standard.
 *
 * **Example** (Read the opening marker)
 *
 * ```ts
 * import { STANDARD_SECTION_BEGIN } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(STANDARD_SECTION_BEGIN) // "<!-- BEGIN GENERATED: INSTRUMENTATION CATALOG -->"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const STANDARD_SECTION_BEGIN = "<!-- BEGIN GENERATED: INSTRUMENTATION CATALOG -->" as const;

/**
 * Closing marker of the generated section in the observability standard.
 *
 * **Example** (Read the closing marker)
 *
 * ```ts
 * import { STANDARD_SECTION_END } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(STANDARD_SECTION_END) // "<!-- END GENERATED: INSTRUMENTATION CATALOG -->"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const STANDARD_SECTION_END = "<!-- END GENERATED: INSTRUMENTATION CATALOG -->" as const;

/**
 * Renders the generated section of the observability standard: the naming
 * rules the catalog enforces and the harvested span counts per family.
 *
 * **Example** (Render the section for an empty catalog)
 *
 * ```ts
 * import { InstrumentationCatalogDocument, renderStandardSection } from "@beep/repo-cli/commands/Observability"
 *
 * const section = renderStandardSection(InstrumentationCatalogDocument.make({ attributes: [], instruments: [], spans: [] }))
 * console.log(section.includes("| **total** | 0 | 0 | 0 |")) // true
 * ```
 *
 * @param document - Catalog document whose naming rules and counts are rendered.
 * @returns The generated observability standard section as Markdown.
 * @category formatting
 * @since 0.0.0
 */
export const renderStandardSection = (document: InstrumentationCatalogDocument): string => {
  const counts = familySpanCounts(document.spans);
  const total = A.length(document.spans);
  const conforming = A.length(A.filter(document.spans, (row) => row.conforms));
  const declared = (tag: Catalog.Instrument["_tag"]): number =>
    A.length(A.filter(document.instruments, (instrument) => instrument._tag === tag));
  const rows = A.map(counts, ({ family, spans, conforming: ok }) => `| ${family} | ${spans} | ${ok} | ${spans - ok} |`);
  return A.join(
    [
      STANDARD_SECTION_BEGIN,
      "",
      `_Generated from \`${INSTRUMENTATION_CATALOG_PATH}\` by \`${INSTRUMENTATION_CATALOG_GENERATED_BY}\`. Do not edit by hand._`,
      "",
      "Naming rules the catalog check enforces:",
      "",
      "- Domain spans, in every family, are named `Concept(.Sub)*.action`: PascalCase concept segments and a camelCase action, for example `Parcels.read`.",
      "- Protocol spans follow OpenTelemetry semantic conventions (`GET /route`, `gen_ai.*`) and are declared with `protocol: true`. Their identity is the owning package plus the name, so two packages may share one.",
      "- Every other span name is unique across packages. Names are static literals; a template literal with substitutions fails the check, and its variable part belongs in an attribute.",
      "- Harvested names that predate the domain form stay in the catalog with `conforms: false`; there is no mass rename.",
      "- Metric names are lowercase dotted `beep.<area>.<noun>` with a declared UCUM unit and no hand-written unit or `_total` suffix. One counter per concept carries a bounded `beep.outcome` attribute instead of one counter per outcome.",
      "- Event names are `Concept.event_happened`. Attribute keys are lowercase dotted and declared once, with their signals, cardinality and strictest allowed tier; metrics use only static or bounded keys.",
      "",
      "| Family | Spans | Conforming | Non-conforming |",
      "| --- | --- | --- | --- |",
      ...rows,
      `| **total** | ${total} | ${conforming} | ${total - conforming} |`,
      "",
      `Declared: ${A.length(document.attributes)} attribute keys, ${declared("MetricInstrument")} metrics, ${declared("EventInstrument")} events, ${declared("SpanInstrument")} spans.`,
      "",
      STANDARD_SECTION_END,
    ],
    "\n"
  );
};

/**
 * Replaces the generated section between the markers, or `None` when either
 * marker is missing.
 *
 * **Example** (Replace a section)
 *
 * ```ts
 * import * as O from "effect/Option"
 * import { STANDARD_SECTION_BEGIN, STANDARD_SECTION_END, spliceStandardSection } from "@beep/repo-cli/commands/Observability"
 *
 * const doc = `intro\n${STANDARD_SECTION_BEGIN}\nold\n${STANDARD_SECTION_END}\noutro\n`
 * const next = spliceStandardSection(doc, `${STANDARD_SECTION_BEGIN}\nnew\n${STANDARD_SECTION_END}`)
 * console.log(O.map(next, (text) => text.includes("new"))) // { _id: 'Option', _tag: 'Some', value: true }
 * ```
 *
 * @category formatting
 * @since 0.0.0
 */
export const spliceStandardSection: {
  (section: string): (current: string) => O.Option<string>;
  (current: string, section: string): O.Option<string>;
} = dual(2, (current: string, section: string): O.Option<string> => {
  const begin = current.indexOf(STANDARD_SECTION_BEGIN);
  const end = current.indexOf(STANDARD_SECTION_END);
  return begin < 0 || end < begin
    ? O.none()
    : O.some(`${current.slice(0, begin)}${section}${current.slice(end + Str.length(STANDARD_SECTION_END))}`);
});
