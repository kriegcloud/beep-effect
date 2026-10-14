/**
 * Schemas for the instrumentation catalog command: harvested span sites,
 * span-name findings, the generated catalog document, and the run report.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as Catalog from "@beep/observability/catalog";
import { LiteralKit } from "@beep/schema";
import { PosixPath } from "@beep/schema/PosixPath";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Observability/Observability.schemas");

/**
 * Repo-relative path of the generated instrumentation catalog.
 *
 * **Example** (Read the catalog path)
 *
 * ```ts
 * import { INSTRUMENTATION_CATALOG_PATH } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(INSTRUMENTATION_CATALOG_PATH) // "standards/instrumentation-catalog.generated.jsonc"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const INSTRUMENTATION_CATALOG_PATH = "standards/instrumentation-catalog.generated.jsonc" as const;

/**
 * Repo-relative path of the observability standard whose generated section
 * the command maintains.
 *
 * **Example** (Read the standard path)
 *
 * ```ts
 * import { OBSERVABILITY_STANDARD_PATH } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(OBSERVABILITY_STANDARD_PATH) // "standards/architecture/12-observability.md"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const OBSERVABILITY_STANDARD_PATH = "standards/architecture/12-observability.md" as const;

/**
 * Command that regenerates the catalog, recorded in the generated file.
 *
 * **Example** (Read the regenerate command)
 *
 * ```ts
 * import { INSTRUMENTATION_CATALOG_GENERATED_BY } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(INSTRUMENTATION_CATALOG_GENERATED_BY) // "bun run beep observability catalog --write"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const INSTRUMENTATION_CATALOG_GENERATED_BY = "bun run beep observability catalog --write" as const;

/**
 * Effect call that names a span.
 *
 * **Example** (List span callees)
 *
 * ```ts
 * import { SpanCallee } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(SpanCallee.literals) // ["Effect.fn", "Effect.fnUntraced", "Effect.withSpan"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpanCallee = LiteralKit(["Effect.fn", "Effect.fnUntraced", "Effect.withSpan"]).pipe(
  $I.annoteSchema("SpanCallee", {
    description: "Effect call whose name argument opens a span.",
  })
);

/**
 * Runtime type for {@link SpanCallee}.
 *
 * @category models
 * @since 0.0.0
 */
export type SpanCallee = typeof SpanCallee.Type;

/**
 * Kind of span-name argument the harvester could not record as a literal.
 *
 * **Details**
 *
 * `interpolated` is a template literal with substitutions, which fails the
 * check. `non-literal` is any other expression, such as an identifier or an
 * identity tagged template; it is reported but does not fail.
 *
 * **Example** (Check a finding kind)
 *
 * ```ts
 * import { SpanNameFindingKind } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(SpanNameFindingKind.is.interpolated("interpolated")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SpanNameFindingKind = LiteralKit(["interpolated", "non-literal"]).pipe(
  $I.annoteSchema("SpanNameFindingKind", {
    description: "Why a span-name argument is not a static literal.",
  })
);

/**
 * Runtime type for {@link SpanNameFindingKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type SpanNameFindingKind = typeof SpanNameFindingKind.Type;

/**
 * One literal span name found in source.
 *
 * **Example** (Construct a span site)
 *
 * ```ts
 * import { PackageName } from "@beep/observability/catalog"
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { SpanSite } from "@beep/repo-cli/commands/Observability"
 *
 * const site = SpanSite.make({
 *   name: "Parcels.read",
 *   owner: PackageName.make("@beep/parcels"),
 *   family: "slice",
 *   file: PosixPath.make("packages/parcels/server/src/Parcels.ts"),
 *   line: 12,
 *   callee: "Effect.fn"
 * })
 * console.log(site.line) // 12
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SpanSite extends S.Class<SpanSite>($I`SpanSite`)(
  {
    name: S.NonEmptyString,
    owner: Catalog.PackageName,
    family: Catalog.PackageFamily,
    file: PosixPath,
    line: S.Int,
    callee: SpanCallee,
  },
  $I.annote("SpanSite", {
    description: "Literal span name found at one source location.",
  })
) {}

/**
 * A span-name argument that is not a static literal.
 *
 * **Example** (Construct an interpolation finding)
 *
 * ```ts
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { SpanNameFinding } from "@beep/repo-cli/commands/Observability"
 *
 * const finding = SpanNameFinding.make({
 *   kind: "interpolated",
 *   file: PosixPath.make("packages/drivers/box/src/Box.ts"),
 *   line: 40,
 *   callee: "Effect.withSpan",
 *   text: "`box.${method}`"
 * })
 * console.log(finding.kind) // "interpolated"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SpanNameFinding extends S.Class<SpanNameFinding>($I`SpanNameFinding`)(
  {
    kind: SpanNameFindingKind,
    file: PosixPath,
    line: S.Int,
    callee: SpanCallee,
    text: S.String,
  },
  $I.annote("SpanNameFinding", {
    description: "Span-name argument that is interpolated or otherwise not a static literal.",
  })
) {}

/**
 * Result of scanning source files for span names.
 *
 * **Example** (Construct an empty harvest)
 *
 * ```ts
 * import { SpanHarvest } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(SpanHarvest.make({ sites: [], findings: [] }).sites.length) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SpanHarvest extends S.Class<SpanHarvest>($I`SpanHarvest`)(
  {
    sites: S.Array(SpanSite),
    findings: S.Array(SpanNameFinding),
  },
  $I.annote("SpanHarvest", {
    description: "Literal span sites and non-literal span-name findings from one scan.",
  })
) {}

/**
 * One package's `*.instruments.ts` file and the declarations it exports.
 *
 * **Example** (Construct an empty declarations file)
 *
 * ```ts
 * import { InstrumentDeclarations } from "@beep/observability/catalog"
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { DeclarationsFile } from "@beep/repo-cli/commands/Observability"
 *
 * const file = DeclarationsFile.make({
 *   file: PosixPath.make("packages/foundation/capability/observability/src/Observability.instruments.ts"),
 *   declarations: [InstrumentDeclarations.make({})]
 * })
 * console.log(file.declarations.length) // 1
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class DeclarationsFile extends S.Class<DeclarationsFile>($I`DeclarationsFile`)(
  {
    file: PosixPath,
    declarations: S.Array(Catalog.InstrumentDeclarations),
  },
  $I.annote("DeclarationsFile", {
    description: "Instrument declarations exported by one *.instruments.ts file.",
  })
) {}

/**
 * One row of the generated span section: a harvested name, its owning
 * package and family, and whether it is in `Concept(.Sub)*.action` form.
 *
 * **Example** (Construct a harvested span row)
 *
 * ```ts
 * import { PackageName } from "@beep/observability/catalog"
 * import { HarvestedSpan } from "@beep/repo-cli/commands/Observability"
 *
 * const row = HarvestedSpan.make({
 *   name: "db.query",
 *   owner: PackageName.make("@beep/duckdb"),
 *   family: "driver",
 *   conforms: false
 * })
 * console.log(row.conforms) // false
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HarvestedSpan extends S.Class<HarvestedSpan>($I`HarvestedSpan`)(
  {
    name: S.NonEmptyString,
    owner: Catalog.PackageName,
    family: Catalog.PackageFamily,
    conforms: S.Boolean,
  },
  $I.annote("HarvestedSpan", {
    description: "Generated span section row: harvested name, owning package, family and conformance.",
  })
) {}

/**
 * The generated, committed instrumentation catalog.
 *
 * **Details**
 *
 * `attributes` and `instruments` come from every package's
 * `*.instruments.ts` file; `spans` is the harvested span section. Merging
 * both through `mergeDeclarations` must succeed for the document to be
 * written by a passing run.
 *
 * **Example** (Construct an empty document)
 *
 * ```ts
 * import { InstrumentationCatalogDocument } from "@beep/repo-cli/commands/Observability"
 *
 * const document = InstrumentationCatalogDocument.make({ attributes: [], instruments: [], spans: [] })
 * console.log(document.schemaVersion) // "instrumentation-catalog/v1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class InstrumentationCatalogDocument extends S.Class<InstrumentationCatalogDocument>(
  $I`InstrumentationCatalogDocument`
)(
  {
    schemaVersion: S.Literal("instrumentation-catalog/v1").pipe(
      S.withConstructorDefault(Effect.succeed("instrumentation-catalog/v1"))
    ),
    generatedBy: S.Literal(INSTRUMENTATION_CATALOG_GENERATED_BY).pipe(
      S.withConstructorDefault(Effect.succeed(INSTRUMENTATION_CATALOG_GENERATED_BY))
    ),
    attributes: S.Array(Catalog.AttributeKey),
    instruments: S.Array(Catalog.Instrument),
    spans: S.Array(HarvestedSpan),
  },
  $I.annote("InstrumentationCatalogDocument", {
    description:
      "Generated instrumentation catalog: declared attributes and instruments plus the harvested span section.",
  })
) {}

/**
 * The generated document for one run and every conflict its merge reported.
 *
 * **Example** (Construct a clean build)
 *
 * ```ts
 * import { CatalogBuild, InstrumentationCatalogDocument } from "@beep/repo-cli/commands/Observability"
 *
 * const build = CatalogBuild.make({
 *   document: InstrumentationCatalogDocument.make({ attributes: [], instruments: [], spans: [] }),
 *   conflicts: []
 * })
 * console.log(build.conflicts.length) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CatalogBuild extends S.Class<CatalogBuild>($I`CatalogBuild`)(
  {
    document: InstrumentationCatalogDocument,
    conflicts: S.Array(S.String),
  },
  $I.annote("CatalogBuild", {
    description: "Generated catalog document plus the rendered conflicts its merge reported.",
  })
) {}

/**
 * Span counts for one package family.
 *
 * **Example** (Construct a family count)
 *
 * ```ts
 * import { FamilySpanCount } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(FamilySpanCount.make({ family: "driver", spans: 3, conforming: 2 }).spans) // 3
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FamilySpanCount extends S.Class<FamilySpanCount>($I`FamilySpanCount`)(
  {
    family: Catalog.PackageFamily,
    spans: S.Int,
    conforming: S.Int,
  },
  $I.annote("FamilySpanCount", {
    description: "Harvested span count and conforming span count for one package family.",
  })
) {}

/**
 * Mode the catalog command ran in.
 *
 * **Example** (Read a run mode)
 *
 * ```ts
 * import { CatalogRunMode } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(CatalogRunMode.Enum.check) // "check"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CatalogRunMode = LiteralKit(["write", "check"]).pipe(
  $I.annoteSchema("CatalogRunMode", {
    description: "Whether the catalog command wrote or checked the generated files.",
  })
);

/**
 * Runtime type for {@link CatalogRunMode}.
 *
 * @category models
 * @since 0.0.0
 */
export type CatalogRunMode = typeof CatalogRunMode.Type;

/**
 * State of one generated file after a run.
 *
 * **Example** (Read a file status)
 *
 * ```ts
 * import { GeneratedFileStatus } from "@beep/repo-cli/commands/Observability"
 *
 * console.log(GeneratedFileStatus.is.stale("stale")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const GeneratedFileStatus = LiteralKit(["current", "wrote", "stale", "missing"]).pipe(
  $I.annoteSchema("GeneratedFileStatus", {
    description: "Whether a generated file was current, rewritten, stale or missing.",
  })
);

/**
 * Runtime type for {@link GeneratedFileStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type GeneratedFileStatus = typeof GeneratedFileStatus.Type;

/**
 * Report of one catalog run, printed as JSON with `--json`.
 *
 * **Details**
 *
 * `ok` is false when the catalog file or the standard's generated section is
 * stale or missing in check mode, when any span name is interpolated, or when
 * merging produced conflicts such as cross-package duplicate names.
 *
 * **Example** (Construct a passing report)
 *
 * ```ts
 * import { CatalogRunReport } from "@beep/repo-cli/commands/Observability"
 *
 * const report = CatalogRunReport.make({
 *   mode: "check",
 *   catalog: "current",
 *   standard: "current",
 *   spans: 0,
 *   conforming: 0,
 *   nonConforming: 0,
 *   families: [],
 *   attributes: 0,
 *   declaredInstruments: 0,
 *   declarationFiles: [],
 *   interpolated: [],
 *   nonLiteral: [],
 *   conflicts: [],
 *   ok: true
 * })
 * console.log(report.ok) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CatalogRunReport extends S.Class<CatalogRunReport>($I`CatalogRunReport`)(
  {
    mode: CatalogRunMode,
    catalog: GeneratedFileStatus,
    standard: GeneratedFileStatus,
    spans: S.Int,
    conforming: S.Int,
    nonConforming: S.Int,
    families: S.Array(FamilySpanCount),
    attributes: S.Int,
    declaredInstruments: S.Int,
    declarationFiles: S.Array(PosixPath),
    interpolated: S.Array(SpanNameFinding),
    nonLiteral: S.Array(SpanNameFinding),
    conflicts: S.Array(S.String),
    ok: S.Boolean,
  },
  $I.annote("CatalogRunReport", {
    description: "Outcome of one instrumentation catalog write or check run.",
  })
) {}
