/**
 * Deterministic seed extraction for Effect capability intelligence.
 *
 * @packageDocumentation
 * @category utilities
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { Effect, FileSystem, flow, Match, Order, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Node } from "ts-morph";
import { jsonParse } from "./JsonUtils.js";
import {
  TSMorphService,
  TsMorphProjectInspectionRequest,
  TsMorphReferencePolicy,
  TsMorphScopeMode,
} from "./TSMorph/index.js";
import type { JSDoc, JSDocTag, SourceFile, Statement, Node as TsMorphNode, VariableStatement } from "ts-morph";

const $I = $RepoUtilsId.create("EffectCapabilityKG");

const EFFECT_SOURCE_ROOT_SEGMENTS = [".repos", "effect-v4", "packages", "effect"];
const EFFECT_SOURCE_DIR_SEGMENTS = A.append(EFFECT_SOURCE_ROOT_SEGMENTS, "src");
const EFFECT_TSCONFIG_SEGMENTS = A.append(EFFECT_SOURCE_ROOT_SEGMENTS, "tsconfig.json");
const REPO_EXPORTS_CATALOG_SEGMENTS = ["standards", "repo-exports.catalog.jsonc"];

/**
 * Seed module names covered by the first Effect capability KG proof.
 *
 * @example
 * ```ts
 * import { EffectCapabilitySeedModuleName } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(EffectCapabilitySeedModuleName.Enum.Combiner)
 * ```
 * @category models
 * @since 0.0.0
 */
export const EffectCapabilitySeedModuleName = LiteralKit([
  "Combiner",
  "Reducer",
  "Filter",
  "Option",
  "Struct",
  "Array",
  "Record",
  "Number",
  "String",
  "Boolean",
]).pipe(
  $I.annoteSchema("EffectCapabilitySeedModuleName", {
    description: "Effect v4 module names included in the capability KG seed corpus.",
  })
);

/**
 * Runtime type for {@link EffectCapabilitySeedModuleName}.
 *
 * @example
 * ```ts
 * import type { EffectCapabilitySeedModuleName } from "@beep/repo-utils/EffectCapabilityKG"
 * const moduleName: EffectCapabilitySeedModuleName = "Combiner"
 * console.log(moduleName)
 * ```
 * @category models
 * @since 0.0.0
 */
export type EffectCapabilitySeedModuleName = typeof EffectCapabilitySeedModuleName.Type;

/**
 * Node kinds emitted by the seed capability graph.
 *
 * @example
 * ```ts
 * import { EffectCapabilityNodeKind } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(EffectCapabilityNodeKind.Enum.CapabilitySymbol)
 * ```
 * @category models
 * @since 0.0.0
 */
export const EffectCapabilityNodeKind = LiteralKit([
  "EffectModule",
  "CapabilitySymbol",
  "DocSection",
  "UsageScenario",
  "ExampleCase",
  "CategoryRole",
  "SeeAlsoRelation",
  "CatalogVisibility",
  "AdvisoryFinding",
]).pipe(
  $I.annoteSchema("EffectCapabilityNodeKind", {
    description: "Ontology node kinds used by the bounded Effect capability KG seed model.",
  })
);

/**
 * Runtime type for {@link EffectCapabilityNodeKind}.
 *
 * @example
 * ```ts
 * import type { EffectCapabilityNodeKind } from "@beep/repo-utils/EffectCapabilityKG"
 * const kind: EffectCapabilityNodeKind = "EffectModule"
 * console.log(kind)
 * ```
 * @category models
 * @since 0.0.0
 */
export type EffectCapabilityNodeKind = typeof EffectCapabilityNodeKind.Type;

/**
 * Relation kinds emitted by the seed capability graph.
 *
 * @example
 * ```ts
 * import { EffectCapabilityRelationKind } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(EffectCapabilityRelationKind.Enum.defines)
 * ```
 * @category models
 * @since 0.0.0
 */
export const EffectCapabilityRelationKind = LiteralKit([
  "defines",
  "imports",
  "hasCategory",
  "introducedIn",
  "hasWhenToUse",
  "hasDetails",
  "demonstratedBy",
  "seeAlso",
  "composesWith",
  "catalogVisibleAs",
  "citesCapabilityEvidence",
]).pipe(
  $I.annoteSchema("EffectCapabilityRelationKind", {
    description: "Directed relation names used by the bounded Effect capability KG seed model.",
  })
);

/**
 * Runtime type for {@link EffectCapabilityRelationKind}.
 *
 * @example
 * ```ts
 * import type { EffectCapabilityRelationKind } from "@beep/repo-utils/EffectCapabilityKG"
 * const relation: EffectCapabilityRelationKind = "defines"
 * console.log(relation)
 * ```
 * @category models
 * @since 0.0.0
 */
export type EffectCapabilityRelationKind = typeof EffectCapabilityRelationKind.Type;

/**
 * Advisory scenarios covered by the seed proof fixtures.
 *
 * @example
 * ```ts
 * import { EffectCapabilityAdvisoryScenario } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(EffectCapabilityAdvisoryScenario.Enum["merge-combine"])
 * ```
 * @category models
 * @since 0.0.0
 */
export const EffectCapabilityAdvisoryScenario = LiteralKit([
  "merge-combine",
  "fold-aggregate",
  "validation-transformation",
  "decline-no-match",
]).pipe(
  $I.annoteSchema("EffectCapabilityAdvisoryScenario", {
    description: "Seed advisory fixture scenario kinds used to prove suggestion and decline behavior.",
  })
);

/**
 * Runtime type for {@link EffectCapabilityAdvisoryScenario}.
 *
 * @example
 * ```ts
 * import type { EffectCapabilityAdvisoryScenario } from "@beep/repo-utils/EffectCapabilityKG"
 * const scenario: EffectCapabilityAdvisoryScenario = "fold-aggregate"
 * console.log(scenario)
 * ```
 * @category models
 * @since 0.0.0
 */
export type EffectCapabilityAdvisoryScenario = typeof EffectCapabilityAdvisoryScenario.Type;

/**
 * Advisory decision emitted by the seed proof.
 *
 * @example
 * ```ts
 * import { EffectCapabilityAdvisoryDecision } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(EffectCapabilityAdvisoryDecision.Enum.suggest)
 * ```
 * @category models
 * @since 0.0.0
 */
export const EffectCapabilityAdvisoryDecision = LiteralKit(["suggest", "decline"]).pipe(
  $I.annoteSchema("EffectCapabilityAdvisoryDecision", {
    description: "Decision for one seed advisory fixture.",
  })
);

/**
 * Runtime type for {@link EffectCapabilityAdvisoryDecision}.
 *
 * @example
 * ```ts
 * import type { EffectCapabilityAdvisoryDecision } from "@beep/repo-utils/EffectCapabilityKG"
 * const decision: EffectCapabilityAdvisoryDecision = "decline"
 * console.log(decision)
 * ```
 * @category models
 * @since 0.0.0
 */
export type EffectCapabilityAdvisoryDecision = typeof EffectCapabilityAdvisoryDecision.Type;

class EffectCapabilityEvidence extends S.Class<EffectCapabilityEvidence>($I`EffectCapabilityEvidence`)(
  {
    sourcePath: S.String,
    startLine: S.Int,
    endLine: S.Int,
    origin: S.String,
    anchor: S.String,
    excerpt: S.String,
  },
  $I.annote("EffectCapabilityEvidence", {
    description: "Deterministic source citation for one extracted capability fact.",
  })
) {}

class EffectCapabilityDocTag extends S.Class<EffectCapabilityDocTag>($I`EffectCapabilityDocTag`)(
  {
    tagName: S.String,
    text: S.String,
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilityDocTag", {
    description: "Single JSDoc tag extracted with source evidence.",
  })
) {}

class EffectCapabilityDocSection extends S.Class<EffectCapabilityDocSection>($I`EffectCapabilityDocSection`)(
  {
    title: S.String,
    text: S.String,
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilityDocSection", {
    description: "Structured prose section extracted from an Effect v4 JSDoc block.",
  })
) {}

class EffectCapabilityExampleCase extends S.Class<EffectCapabilityExampleCase>($I`EffectCapabilityExampleCase`)(
  {
    label: S.Option(S.String),
    code: S.String,
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilityExampleCase", {
    description: "Fenced TypeScript example extracted from an Effect v4 JSDoc block.",
  })
) {}

class EffectCapabilitySeeAlsoRelation extends S.Class<EffectCapabilitySeeAlsoRelation>(
  $I`EffectCapabilitySeeAlsoRelation`
)(
  {
    target: S.String,
    text: S.String,
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilitySeeAlsoRelation", {
    description: "Structured @see relationship extracted from JSDoc.",
  })
) {}

class EffectCapabilitySourceSpan extends S.Class<EffectCapabilitySourceSpan>($I`EffectCapabilitySourceSpan`)(
  {
    sourcePath: S.String,
    startLine: S.Int,
    endLine: S.Int,
  },
  $I.annote("EffectCapabilitySourceSpan", {
    description: "Source span for an extracted module or symbol.",
  })
) {}

class EffectCapabilitySymbol extends S.Class<EffectCapabilitySymbol>($I`EffectCapabilitySymbol`)(
  {
    id: S.String,
    moduleName: EffectCapabilitySeedModuleName,
    name: S.String,
    exportKind: S.String,
    signatureSummary: S.String,
    sourceSpan: EffectCapabilitySourceSpan,
    category: S.Array(EffectCapabilityDocTag),
    since: S.Array(EffectCapabilityDocTag),
    docSections: S.Array(EffectCapabilityDocSection),
    examples: S.Array(EffectCapabilityExampleCase),
    seeAlso: S.Array(EffectCapabilitySeeAlsoRelation),
    evidence: S.Array(EffectCapabilityEvidence),
  },
  $I.annote("EffectCapabilitySymbol", {
    description: "Exported Effect v4 capability symbol with deterministic AST and JSDoc facts.",
  })
) {}

class EffectCapabilityModule extends S.Class<EffectCapabilityModule>($I`EffectCapabilityModule`)(
  {
    id: S.String,
    moduleName: EffectCapabilitySeedModuleName,
    sourcePath: S.String,
    summary: S.Option(S.String),
    imports: S.Array(EffectCapabilitySeedModuleName),
    symbols: S.Array(EffectCapabilitySymbol),
    evidence: S.Array(EffectCapabilityEvidence),
  },
  $I.annote("EffectCapabilityModule", {
    description: "Effect v4 module node extracted from the seed corpus.",
  })
) {}

class EffectCapabilityCatalogVisibility extends S.Class<EffectCapabilityCatalogVisibility>(
  $I`EffectCapabilityCatalogVisibility`
)(
  {
    moduleName: EffectCapabilitySeedModuleName,
    packageName: S.String,
    importSpecifier: S.String,
    symbolName: S.String,
    sourcePath: S.String,
    sourceLine: S.Int,
    summary: S.String,
    categories: S.Array(S.String),
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilityCatalogVisibility", {
    description: "Repo export catalog visibility fact for an adjacent helper surface.",
  })
) {}

class EffectCapabilityGraphEdge extends S.Class<EffectCapabilityGraphEdge>($I`EffectCapabilityGraphEdge`)(
  {
    from: S.String,
    to: S.String,
    relation: EffectCapabilityRelationKind,
    evidence: EffectCapabilityEvidence,
  },
  $I.annote("EffectCapabilityGraphEdge", {
    description: "Directed evidence-cited edge in the seed capability graph.",
  })
) {}

/**
 * Fixture input for the seed advisory proof.
 *
 * The fixture scenario is the author's declared seed intent. Advisory matching
 * still classifies the fixture text and returns the classified scenario on the
 * finding so downstream routers can observe drift between declared intent and
 * detected capability language.
 *
 * @example
 * ```ts
 * import { EffectCapabilitySeedFixture } from "@beep/repo-utils/EffectCapabilityKG"
 * const fixture = EffectCapabilitySeedFixture.make({
 *   id: "merge",
 *   scenario: "merge-combine",
 *   text: "Merge two values with reusable combining semantics."
 * })
 * console.log(fixture.scenario)
 * ```
 * @category models
 * @since 0.0.0
 */
export class EffectCapabilitySeedFixture extends S.Class<EffectCapabilitySeedFixture>($I`EffectCapabilitySeedFixture`)(
  {
    id: S.String,
    scenario: EffectCapabilityAdvisoryScenario,
    text: S.String,
  },
  $I.annote("EffectCapabilitySeedFixture", {
    description: "Small advisory fixture used by the Effect capability KG seed proof.",
  })
) {}

class EffectCapabilityAdvisoryFinding extends S.Class<EffectCapabilityAdvisoryFinding>(
  $I`EffectCapabilityAdvisoryFinding`
)(
  {
    fixtureId: S.String,
    scenario: EffectCapabilityAdvisoryScenario,
    decision: EffectCapabilityAdvisoryDecision,
    confidence: S.Finite,
    suggestedSymbols: S.Array(S.String),
    rationale: S.String,
    evidence: S.Array(EffectCapabilityEvidence),
  },
  $I.annote("EffectCapabilityAdvisoryFinding", {
    description: "Advisory fixture result with deterministic evidence citations.",
  })
) {}

/**
 * Schema-first report produced by the Effect capability KG seed extractor.
 *
 * @example
 * ```ts
 * import { EffectCapabilitySeedReport } from "@beep/repo-utils/EffectCapabilityKG"
 * const report = EffectCapabilitySeedReport
 * console.log(report)
 * ```
 * @category models
 * @since 0.0.0
 */
export class EffectCapabilitySeedReport extends S.Class<EffectCapabilitySeedReport>($I`EffectCapabilitySeedReport`)(
  {
    sourceRoot: S.String,
    seedModules: S.Array(EffectCapabilitySeedModuleName),
    adjacentModules: S.Array(EffectCapabilitySeedModuleName),
    modules: S.Array(EffectCapabilityModule),
    edges: S.Array(EffectCapabilityGraphEdge),
    catalogVisibility: S.Array(EffectCapabilityCatalogVisibility),
    advisoryFindings: S.Array(EffectCapabilityAdvisoryFinding),
  },
  $I.annote("EffectCapabilitySeedReport", {
    description:
      "Deterministic capability graph/report for the first Effect v4 Combiner, Reducer, and Filter seed proof.",
  })
) {}

/**
 * Typed error emitted by the Effect capability KG seed extractor.
 *
 * @example
 * ```ts
 * import { EffectCapabilitySeedError } from "@beep/repo-utils/EffectCapabilityKG"
 * const error = EffectCapabilitySeedError
 * console.log(error)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class EffectCapabilitySeedError extends TaggedErrorClass<EffectCapabilitySeedError>(
  $I`EffectCapabilitySeedError`
)(
  "EffectCapabilitySeedError",
  {
    message: S.String,
    sourcePath: S.Option(S.String),
  },
  $I.annote("EffectCapabilitySeedError", {
    description: "Recoverable failure while extracting the Effect capability KG seed report.",
  })
) {}

class CatalogIndexPackage extends S.Class<CatalogIndexPackage>($I`CatalogIndexPackage`)(
  {
    packageName: S.String,
    packagePath: S.String,
    status: S.String,
    shardPath: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("CatalogIndexPackage", {
    description: "Minimal package entry consumed from the repo export catalog index.",
  })
) {}

class CatalogIndex extends S.Class<CatalogIndex>($I`CatalogIndex`)(
  {
    packages: S.Array(CatalogIndexPackage),
  },
  $I.annote("CatalogIndex", {
    description: "Minimal repo export catalog index consumed by the seed proof.",
  })
) {}

class CatalogEntry extends S.Class<CatalogEntry>($I`CatalogEntry`)(
  {
    packageName: S.String,
    importSpecifier: S.String,
    symbolName: S.String,
    sourcePath: S.String,
    sourceLine: S.Int,
    summary: S.String,
    categories: S.Array(S.String),
  },
  $I.annote("CatalogEntry", {
    description: "Minimal public export catalog entry consumed by the seed proof.",
  })
) {}

class CatalogPackage extends S.Class<CatalogPackage>($I`CatalogPackage`)(
  {
    exports: S.Array(CatalogEntry),
  },
  $I.annote("CatalogPackage", {
    description: "Minimal package payload consumed from a repo export catalog shard.",
  })
) {}

class CatalogShard extends S.Class<CatalogShard>($I`CatalogShard`)(
  {
    package: CatalogPackage,
  },
  $I.annote("CatalogShard", {
    description: "Minimal repo export catalog shard consumed by the seed proof.",
  })
) {}

type ExportedDeclaration = {
  readonly name: string;
  readonly exportKind: string;
  readonly signatureNode: TsMorphNode;
  readonly jsDocNode: TsMorphNode;
};

type SectionAccumulator = {
  readonly title: string;
  readonly lines: ReadonlyArray<string>;
};

type SourcePathForModule = (moduleName: EffectCapabilitySeedModuleName) => string;

type EffectCapabilitySeedPaths = {
  readonly sourceRoot: string;
  readonly sourceDir: string;
  readonly tsConfigPath: string;
  readonly catalogPath: string;
  readonly sourcePathForModule: SourcePathForModule;
};

const seedModules: ReadonlyArray<EffectCapabilitySeedModuleName> = ["Combiner", "Reducer", "Filter"];
const adjacentModules: ReadonlyArray<EffectCapabilitySeedModuleName> = [
  "Option",
  "Struct",
  "Array",
  "Record",
  "Number",
  "String",
  "Boolean",
];
const allSourceModules = A.appendAll(seedModules, adjacentModules);

const decodeProjectInspectionRequest = S.decodeUnknownEffect(TsMorphProjectInspectionRequest);
const decodeCatalogIndex = S.decodeUnknownEffect(CatalogIndex);
const decodeCatalogShard = S.decodeUnknownEffect(CatalogShard);
const isEffectCapabilitySeedModuleName = S.is(EffectCapabilitySeedModuleName);

const byModuleOrder: Order.Order<EffectCapabilityModule> = Order.mapInput(Order.Number, (module) => {
  const index = A.findFirstIndex(allSourceModules, (moduleName) => moduleName === module.moduleName);
  return O.getOrElse(index, () => 1000);
});
const bySymbolStartLine: Order.Order<EffectCapabilitySymbol> = Order.mapInput(
  Order.Number,
  (symbol) => symbol.sourceSpan.startLine
);
const byCatalogVisibility: Order.Order<EffectCapabilityCatalogVisibility> = Order.combine(
  Order.mapInput(Order.String, (entry) => entry.moduleName),
  Order.combine(
    Order.mapInput(Order.String, (entry) => entry.importSpecifier),
    Order.mapInput(Order.String, (entry) => entry.symbolName)
  )
);
const byEdge: Order.Order<EffectCapabilityGraphEdge> = Order.combine(
  Order.mapInput(Order.String, (edge) => edge.from),
  Order.combine(
    Order.mapInput(Order.String, (edge) => edge.relation),
    Order.mapInput(Order.String, (edge) => edge.to)
  )
);

const repoRelativePathFromSegments = (
  pathApi: Path.Path,
  repoRootPath: string,
  segments: ReadonlyArray<string>
): string => pathApi.normalize(pathApi.relative(repoRootPath, pathApi.resolve(repoRootPath, ...segments)));

const effectCapabilitySeedPaths = (pathApi: Path.Path, repoRootPath: string): EffectCapabilitySeedPaths => ({
  sourceRoot: repoRelativePathFromSegments(pathApi, repoRootPath, EFFECT_SOURCE_ROOT_SEGMENTS),
  sourceDir: repoRelativePathFromSegments(pathApi, repoRootPath, EFFECT_SOURCE_DIR_SEGMENTS),
  tsConfigPath: repoRelativePathFromSegments(pathApi, repoRootPath, EFFECT_TSCONFIG_SEGMENTS),
  catalogPath: repoRelativePathFromSegments(pathApi, repoRootPath, REPO_EXPORTS_CATALOG_SEGMENTS),
  sourcePathForModule: (moduleName) =>
    repoRelativePathFromSegments(pathApi, repoRootPath, A.append(EFFECT_SOURCE_DIR_SEGMENTS, `${moduleName}.ts`)),
});

const moduleId = (moduleName: EffectCapabilitySeedModuleName): string => `module:${moduleName}`;
const symbolId = (moduleName: EffectCapabilitySeedModuleName, symbolName: string): string =>
  `symbol:${moduleName}.${symbolName}`;
const docSectionId = (symbol: EffectCapabilitySymbol, section: EffectCapabilityDocSection): string =>
  `doc-section:${symbol.moduleName}.${symbol.name}.${section.title}`;
const exampleId = (symbol: EffectCapabilitySymbol, index: number): string =>
  `example:${symbol.moduleName}.${symbol.name}.${index}`;
const catalogId = (entry: EffectCapabilityCatalogVisibility): string =>
  `catalog:${entry.packageName}:${entry.importSpecifier}:${entry.symbolName}:${entry.sourcePath}`;

const messageFromUnknown = (cause: unknown): string =>
  P.isError(cause)
    ? cause.message
    : P.isString(cause)
      ? cause
      : P.isObject(cause) && P.hasProperty(cause, "message") && P.isString(cause.message)
        ? cause.message
        : "Unknown seed extraction failure.";

const seedError = (message: string, sourcePath: O.Option<string> = O.none()): EffectCapabilitySeedError =>
  EffectCapabilitySeedError.make({ message, sourcePath });

const cleanCommentLine = (line: string): string => {
  const trimmed = Str.trim(line);
  if (Str.startsWith("/**")(trimmed) || Str.startsWith("*/")(trimmed)) {
    return "";
  }
  return Str.startsWith("*")(trimmed) ? pipe(trimmed, Str.slice(1), Str.trim) : trimmed;
};

const cleanJsDocText: (text: string) => string = flow(Str.split("\n"), A.map(cleanCommentLine), A.join("\n"), Str.trim);

const firstNonEmptyLine = (text: string): string =>
  pipe(
    text,
    Str.split("\n"),
    A.map(Str.trim),
    A.findFirst(Str.isNonEmpty),
    O.getOrElse(() => Str.trim(text))
  );

const evidenceForNode = (
  sourcePath: string,
  node: TsMorphNode,
  origin: string,
  anchor: string
): EffectCapabilityEvidence =>
  EffectCapabilityEvidence.make({
    sourcePath,
    startLine: node.getStartLineNumber(true),
    endLine: node.getEndLineNumber(),
    origin,
    anchor,
    excerpt: firstNonEmptyLine(node.getText()),
  });

const evidenceForText = (
  sourcePath: string,
  startLine: number,
  endLine: number,
  origin: string,
  anchor: string,
  excerpt: string
): EffectCapabilityEvidence =>
  EffectCapabilityEvidence.make({
    sourcePath,
    startLine,
    endLine,
    origin,
    anchor,
    excerpt,
  });

const getJsDocs = (node: TsMorphNode): ReadonlyArray<JSDoc> => (Node.isJSDocable(node) ? node.getJsDocs() : A.empty());

const getTagText = (tag: JSDocTag): string =>
  pipe(
    O.fromNullishOr(tag.getCommentText()),
    O.getOrElse(() => ""),
    Str.trim
  );

const makeDocTag = (sourcePath: string, tag: JSDocTag): EffectCapabilityDocTag =>
  EffectCapabilityDocTag.make({
    tagName: tag.getTagName(),
    text: getTagText(tag),
    evidence: evidenceForNode(sourcePath, tag, "effect-v4-jsdoc-tag", tag.getTagName()),
  });

const getTagsByName = (
  sourcePath: string,
  jsDocs: ReadonlyArray<JSDoc>,
  tagName: string
): ReadonlyArray<EffectCapabilityDocTag> =>
  pipe(
    jsDocs,
    A.flatMap((jsDoc) => jsDoc.getTags()),
    A.filter((tag) => tag.getTagName() === tagName),
    A.map((tag) => makeDocTag(sourcePath, tag))
  );

const extractSeeTarget = (text: string): string => {
  const link = /\{@link\s+([^}\s]+)[^}]*\}/u.exec(text);
  return link === null ? text : (link[1] ?? text);
};

const getSeeAlso = (sourcePath: string, jsDocs: ReadonlyArray<JSDoc>): ReadonlyArray<EffectCapabilitySeeAlsoRelation> =>
  pipe(
    jsDocs,
    A.flatMap((jsDoc) => jsDoc.getTags()),
    A.filter((tag) => tag.getTagName() === "see"),
    A.map((tag) => {
      const text = getTagText(tag);
      return EffectCapabilitySeeAlsoRelation.make({
        target: extractSeeTarget(text),
        text,
        evidence: evidenceForNode(sourcePath, tag, "effect-v4-jsdoc-tag", "see"),
      });
    })
  );

const flushSection = (
  sourcePath: string,
  docEvidence: EffectCapabilityEvidence,
  current: SectionAccumulator
): O.Option<EffectCapabilityDocSection> => {
  const text = pipe(current.lines, A.map(Str.trim), A.filter(Str.isNonEmpty), A.join("\n"), Str.trim);
  return Str.isNonEmpty(text)
    ? O.some(
        EffectCapabilityDocSection.make({
          title: current.title,
          text,
          evidence: evidenceForText(
            sourcePath,
            docEvidence.startLine,
            docEvidence.endLine,
            "effect-v4-jsdoc-section",
            current.title,
            text
          ),
        })
      )
    : O.none();
};

const sectionTitleFromHeading = (line: string): O.Option<string> => {
  const heading = /^\*\*([^*]+)\*\*(?:\s+\(([^)]+)\))?/u.exec(line);
  if (heading === null) {
    return O.none();
  }

  const title = heading[1] ?? "Section";
  const label = heading[2];
  return O.some(P.isString(label) && Str.isNonEmpty(label) ? `${title}: ${label}` : title);
};

const appendFlushedSection = (
  sections: ReadonlyArray<EffectCapabilityDocSection>,
  sourcePath: string,
  docEvidence: EffectCapabilityEvidence,
  current: SectionAccumulator
): ReadonlyArray<EffectCapabilityDocSection> =>
  pipe(
    flushSection(sourcePath, docEvidence, current),
    O.match({
      onNone: () => sections,
      onSome: (section) => A.append(sections, section),
    })
  );

const readStructuredSectionsFromDoc = (sourcePath: string, jsDoc: JSDoc): ReadonlyArray<EffectCapabilityDocSection> => {
  const docEvidence = evidenceForNode(sourcePath, jsDoc, "effect-v4-jsdoc", "doc");
  let sections: ReadonlyArray<EffectCapabilityDocSection> = A.empty();
  let current: SectionAccumulator = { title: "Summary", lines: A.empty() };

  for (const line of pipe(jsDoc.getText(), cleanJsDocText, Str.split("\n"))) {
    const trimmed = Str.trim(line);
    if (Str.startsWith("@")(trimmed)) {
      continue;
    }

    const headingTitle = sectionTitleFromHeading(trimmed);
    if (O.isSome(headingTitle)) {
      sections = appendFlushedSection(sections, sourcePath, docEvidence, current);
      current = { title: headingTitle.value, lines: A.empty() };
      continue;
    }

    current = { title: current.title, lines: A.append(current.lines, trimmed) };
  }

  return appendFlushedSection(sections, sourcePath, docEvidence, current);
};

const readStructuredSections = (
  sourcePath: string,
  jsDocs: ReadonlyArray<JSDoc>
): ReadonlyArray<EffectCapabilityDocSection> =>
  pipe(
    jsDocs,
    A.flatMap((jsDoc) => readStructuredSectionsFromDoc(sourcePath, jsDoc))
  );

const exampleCaseFromLines = (
  symbol: EffectCapabilitySymbol,
  section: EffectCapabilityDocSection,
  lines: ReadonlyArray<string>
): O.Option<EffectCapabilityExampleCase> => {
  const code = pipe(lines, A.join("\n"), Str.trim);
  return Str.isNonEmpty(code)
    ? O.some(
        EffectCapabilityExampleCase.make({
          label: Str.startsWith("Example")(section.title) ? O.some(section.title) : O.none(),
          code,
          evidence: evidenceForText(
            section.evidence.sourcePath,
            section.evidence.startLine,
            section.evidence.endLine,
            "effect-v4-jsdoc-example",
            `${symbol.moduleName}.${symbol.name}`,
            firstNonEmptyLine(code)
          ),
        })
      )
    : O.none();
};

const appendCompletedExample = (
  examples: ReadonlyArray<EffectCapabilityExampleCase>,
  symbol: EffectCapabilitySymbol,
  section: EffectCapabilityDocSection,
  lines: ReadonlyArray<string>
): ReadonlyArray<EffectCapabilityExampleCase> =>
  pipe(
    exampleCaseFromLines(symbol, section, lines),
    O.match({
      onNone: () => examples,
      onSome: (example) => A.append(examples, example),
    })
  );

const extractExamplesFromSection = (
  symbol: EffectCapabilitySymbol,
  section: EffectCapabilityDocSection
): ReadonlyArray<EffectCapabilityExampleCase> => {
  let examples: ReadonlyArray<EffectCapabilityExampleCase> = A.empty();
  let currentLines: ReadonlyArray<string> = A.empty();
  let inFence = false;

  for (const line of Str.split("\n")(section.text)) {
    const trimmed = Str.trim(line);
    if (Str.startsWith("```")(trimmed)) {
      if (inFence) {
        examples = appendCompletedExample(examples, symbol, section, currentLines);
        currentLines = A.empty();
        inFence = false;
      } else {
        inFence = true;
      }
      continue;
    }

    if (inFence) {
      currentLines = A.append(currentLines, line);
    }
  }

  if (inFence) {
    examples = appendCompletedExample(examples, symbol, section, currentLines);
  }

  return examples;
};

const sourceModuleFromSpecifier = (specifier: string): O.Option<EffectCapabilitySeedModuleName> => {
  const match = /^\.\/([A-Za-z]+)\.ts$/u.exec(specifier);
  if (match === null) {
    return O.none();
  }
  const moduleName = match[1];
  return P.isString(moduleName) && isEffectCapabilitySeedModuleName(moduleName)
    ? O.some(moduleName)
    : O.none<EffectCapabilitySeedModuleName>();
};

const readImports = (sourceFile: SourceFile): ReadonlyArray<EffectCapabilitySeedModuleName> =>
  pipe(
    sourceFile.getImportDeclarations(),
    A.map((declaration) => sourceModuleFromSpecifier(declaration.getModuleSpecifierValue())),
    A.getSomes,
    A.filter((moduleName) => A.contains(allSourceModules, moduleName)),
    A.dedupe
  );

const variableStatementExportKind = (statement: VariableStatement): string => statement.getDeclarationKind();

const isExportedStatement = (statement: Statement): boolean =>
  Node.isExportable(statement) ? statement.isExported() : false;

const exportedDeclaration = (name: string, exportKind: string, statement: Statement): ExportedDeclaration => ({
  name,
  exportKind,
  signatureNode: statement,
  jsDocNode: statement,
});

const variableExportedDeclarations = (statement: VariableStatement): ReadonlyArray<ExportedDeclaration> =>
  pipe(
    statement.getDeclarations(),
    A.map((declaration) =>
      exportedDeclaration(declaration.getName(), variableStatementExportKind(statement), statement)
    )
  );

const namedExportedDeclaration = (
  statement: Statement,
  exportKind: string,
  name: string | undefined
): ReadonlyArray<ExportedDeclaration> =>
  P.isString(name) ? [exportedDeclaration(name, exportKind, statement)] : A.empty();

const exportedDeclarationsFromStatement = (statement: Statement): ReadonlyArray<ExportedDeclaration> => {
  if (Node.isVariableStatement(statement)) {
    return variableExportedDeclarations(statement);
  }
  if (Node.isFunctionDeclaration(statement)) {
    return namedExportedDeclaration(statement, "function", statement.getName());
  }
  if (Node.isInterfaceDeclaration(statement)) {
    return [exportedDeclaration(statement.getName(), "interface", statement)];
  }
  if (Node.isTypeAliasDeclaration(statement)) {
    return [exportedDeclaration(statement.getName(), "type", statement)];
  }
  if (Node.isClassDeclaration(statement)) {
    return namedExportedDeclaration(statement, "class", statement.getName());
  }
  return A.empty();
};

const collectExportedDeclarations = (sourceFile: SourceFile): ReadonlyArray<ExportedDeclaration> =>
  pipe(sourceFile.getStatements(), A.filter(isExportedStatement), A.flatMap(exportedDeclarationsFromStatement));

const signatureSummary = (node: TsMorphNode): string => firstNonEmptyLine(node.getText());

const makeSymbolFromDeclaration = (
  moduleName: EffectCapabilitySeedModuleName,
  sourcePath: string,
  declaration: ExportedDeclaration
): EffectCapabilitySymbol => {
  const jsDocs = getJsDocs(declaration.jsDocNode);
  const sections = readStructuredSections(sourcePath, jsDocs);
  const base = EffectCapabilitySymbol.make({
    id: symbolId(moduleName, declaration.name),
    moduleName,
    name: declaration.name,
    exportKind: declaration.exportKind,
    signatureSummary: signatureSummary(declaration.signatureNode),
    sourceSpan: EffectCapabilitySourceSpan.make({
      sourcePath,
      startLine: declaration.signatureNode.getStartLineNumber(true),
      endLine: declaration.signatureNode.getEndLineNumber(),
    }),
    category: getTagsByName(sourcePath, jsDocs, "category"),
    since: getTagsByName(sourcePath, jsDocs, "since"),
    docSections: sections,
    examples: A.empty(),
    seeAlso: getSeeAlso(sourcePath, jsDocs),
    evidence: [
      evidenceForNode(sourcePath, declaration.signatureNode, "effect-v4-ast", `${moduleName}.${declaration.name}`),
    ],
  });

  return EffectCapabilitySymbol.make({
    ...base,
    examples: pipe(
      sections,
      A.flatMap((section) => extractExamplesFromSection(base, section))
    ),
  });
};

const moduleSummary = (sourceFile: SourceFile): O.Option<string> => {
  const text = sourceFile.getFullText();
  const match = /^\s*\/\*\*[\s\S]*?\*\//u.exec(text);
  if (match === null) {
    return O.none();
  }
  const cleaned = cleanJsDocText(match[0]);
  return Str.isNonEmpty(cleaned) ? O.some(cleaned) : O.none();
};

const moduleEvidence = (moduleName: EffectCapabilitySeedModuleName, sourcePath: string, sourceFile: SourceFile) =>
  EffectCapabilityEvidence.make({
    sourcePath,
    startLine: 1,
    endLine: 1,
    origin: "effect-v4-module",
    anchor: moduleName,
    excerpt: firstNonEmptyLine(sourceFile.getFullText()),
  });

const sourceFileModuleName = (
  pathApi: Path.Path,
  repoRootPath: string,
  sourcePathForModule: SourcePathForModule,
  sourceFile: SourceFile
): O.Option<EffectCapabilitySeedModuleName> => {
  const relativePath = pathApi.normalize(pathApi.relative(repoRootPath, sourceFile.getFilePath()));
  const found = A.findFirst(allSourceModules, (moduleName) => relativePath === sourcePathForModule(moduleName));
  return found;
};

const collectModule = (
  pathApi: Path.Path,
  repoRootPath: string,
  sourcePathForModule: SourcePathForModule,
  sourceFile: SourceFile
): O.Option<EffectCapabilityModule> => {
  const moduleName = sourceFileModuleName(pathApi, repoRootPath, sourcePathForModule, sourceFile);
  if (O.isNone(moduleName)) {
    return O.none();
  }

  const sourcePath = sourcePathForModule(moduleName.value);
  const symbols = pipe(
    collectExportedDeclarations(sourceFile),
    A.map((declaration) => makeSymbolFromDeclaration(moduleName.value, sourcePath, declaration)),
    A.sort(bySymbolStartLine)
  );

  return O.some(
    EffectCapabilityModule.make({
      id: moduleId(moduleName.value),
      moduleName: moduleName.value,
      sourcePath,
      summary: moduleSummary(sourceFile),
      imports: readImports(sourceFile),
      symbols,
      evidence: [moduleEvidence(moduleName.value, sourcePath, sourceFile)],
    })
  );
};

const regexpSpecialCharacters = /[.*+?^${}()|[\]\\]/gu;

const escapeRegExp = (value: string): string => Str.replace(regexpSpecialCharacters, "\\$&")(value);

const referencedAdjacentModules = (text: string): ReadonlyArray<EffectCapabilitySeedModuleName> =>
  pipe(
    adjacentModules,
    A.filter((moduleName) => new RegExp(`\\b${escapeRegExp(moduleName)}\\.`, "u").test(text))
  );

const fallbackEvidenceForSymbol = (symbol: EffectCapabilitySymbol): EffectCapabilityEvidence =>
  evidenceForText(
    symbol.sourceSpan.sourcePath,
    symbol.sourceSpan.startLine,
    symbol.sourceSpan.endLine,
    "effect-v4-ast",
    symbol.id,
    symbol.signatureSummary
  );

const primaryEvidenceForSymbol = (symbol: EffectCapabilitySymbol): EffectCapabilityEvidence =>
  A.head(symbol.evidence).pipe(O.getOrElse(() => fallbackEvidenceForSymbol(symbol)));

const evidenceFromSymbol = (symbol: EffectCapabilitySymbol, relation: EffectCapabilityRelationKind, target: string) =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: target,
    relation,
    evidence: primaryEvidenceForSymbol(symbol),
  });

const importEdge = (
  module: EffectCapabilityModule,
  imported: EffectCapabilitySeedModuleName
): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: module.id,
    to: moduleId(imported),
    relation: "imports",
    evidence: A.head(module.evidence).pipe(
      O.getOrElse(() => evidenceForText(module.sourcePath, 1, 1, "effect-v4-import", imported, imported))
    ),
  });

const definitionEdge = (module: EffectCapabilityModule, symbol: EffectCapabilitySymbol): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: module.id,
    to: symbol.id,
    relation: "defines",
    evidence: primaryEvidenceForSymbol(symbol),
  });

const categoryEdge = (symbol: EffectCapabilitySymbol, category: EffectCapabilityDocTag): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: `category:${category.text}`,
    relation: "hasCategory",
    evidence: category.evidence,
  });

const sinceEdge = (symbol: EffectCapabilitySymbol, since: EffectCapabilityDocTag): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: `since:${since.text}`,
    relation: "introducedIn",
    evidence: since.evidence,
  });

const docSectionRelation = (section: EffectCapabilityDocSection): EffectCapabilityRelationKind =>
  Str.includes("When to use")(section.title) ? "hasWhenToUse" : "hasDetails";

const docSectionEdge = (
  symbol: EffectCapabilitySymbol,
  section: EffectCapabilityDocSection
): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: docSectionId(symbol, section),
    relation: docSectionRelation(section),
    evidence: section.evidence,
  });

const exampleEdge = (
  symbol: EffectCapabilitySymbol,
  example: EffectCapabilityExampleCase,
  index: number
): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: exampleId(symbol, index),
    relation: "demonstratedBy",
    evidence: example.evidence,
  });

const seeAlsoEdge = (
  symbol: EffectCapabilitySymbol,
  seeAlso: EffectCapabilitySeeAlsoRelation
): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: symbol.id,
    to: `see:${seeAlso.target}`,
    relation: "seeAlso",
    evidence: seeAlso.evidence,
  });

const symbolReferenceText = (symbol: EffectCapabilitySymbol): string =>
  pipe(
    [
      symbol.signatureSummary,
      ...A.map(symbol.docSections, (section) => section.text),
      ...A.map(symbol.examples, (example) => example.code),
      ...A.map(symbol.seeAlso, (seeAlso) => seeAlso.text),
    ],
    A.join("\n")
  );

const symbolEdges = (
  module: EffectCapabilityModule,
  symbol: EffectCapabilitySymbol
): ReadonlyArray<EffectCapabilityGraphEdge> => [
  definitionEdge(module, symbol),
  ...A.map(symbol.category, (category) => categoryEdge(symbol, category)),
  ...A.map(symbol.since, (since) => sinceEdge(symbol, since)),
  ...A.map(symbol.docSections, (section) => docSectionEdge(symbol, section)),
  ...symbol.examples.map((example, index) => exampleEdge(symbol, example, index)),
  ...A.map(symbol.seeAlso, (seeAlso) => seeAlsoEdge(symbol, seeAlso)),
  ...A.map(referencedAdjacentModules(symbolReferenceText(symbol)), (referenced) =>
    evidenceFromSymbol(symbol, "composesWith", moduleId(referenced))
  ),
];

const moduleEdges = (module: EffectCapabilityModule): ReadonlyArray<EffectCapabilityGraphEdge> => [
  ...A.map(module.imports, (imported) => importEdge(module, imported)),
  ...pipe(
    module.symbols,
    A.flatMap((symbol) => symbolEdges(module, symbol))
  ),
];

const catalogVisibilityEdge = (entry: EffectCapabilityCatalogVisibility): EffectCapabilityGraphEdge =>
  EffectCapabilityGraphEdge.make({
    from: moduleId(entry.moduleName),
    to: catalogId(entry),
    relation: "catalogVisibleAs",
    evidence: entry.evidence,
  });

const buildEdges = (
  modules: ReadonlyArray<EffectCapabilityModule>,
  catalogVisibility: ReadonlyArray<EffectCapabilityCatalogVisibility>
): ReadonlyArray<EffectCapabilityGraphEdge> =>
  pipe(
    [...pipe(modules, A.flatMap(moduleEdges)), ...A.map(catalogVisibility, catalogVisibilityEdge)],
    A.dedupeWith((left, right) => left.from === right.from && left.to === right.to && left.relation === right.relation),
    A.sort(byEdge)
  );

const readRepoRelativeFile = Effect.fn(function* (
  repoRootPath: string,
  filePath: string
): Effect.fn.Return<string, EffectCapabilitySeedError, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const absolutePath = pathApi.resolve(repoRootPath, filePath);
  return yield* fs
    .readFileString(absolutePath)
    .pipe(
      Effect.mapError((cause) =>
        seedError(
          `Failed to read "${filePath}" for Effect capability seed extraction: ${messageFromUnknown(cause)}`,
          O.some(filePath)
        )
      )
    );
});

const parseJsonFile = Effect.fn(function* <A>(
  repoRootPath: string,
  filePath: string,
  decode: (value: unknown) => Effect.Effect<A, S.SchemaError>
): Effect.fn.Return<A, EffectCapabilitySeedError, FileSystem.FileSystem | Path.Path> {
  const content = yield* readRepoRelativeFile(repoRootPath, filePath);
  const parsed = yield* jsonParse(content).pipe(
    Effect.mapError((error) =>
      seedError(
        `Failed to parse "${filePath}" for Effect capability seed extraction: ${error.message}`,
        O.some(filePath)
      )
    )
  );
  return yield* decode(parsed).pipe(
    Effect.mapError((error) =>
      seedError(
        `Failed to decode "${filePath}" for Effect capability seed extraction: ${error.message}`,
        O.some(filePath)
      )
    )
  );
});

const catalogImportSpecifierSuffixes: Record<EffectCapabilitySeedModuleName, ReadonlyArray<string>> = {
  Combiner: [],
  Reducer: [],
  Filter: [],
  Option: ["/Option", "/O"],
  Struct: ["/Struct"],
  Array: ["/Array", "/A"],
  Record: ["/Record", "/R"],
  Number: ["/Number", "/N"],
  String: ["/String", "/Str"],
  Boolean: ["/Boolean", "/Bool"],
};

const sourcePathFileName = (sourcePath: string): string =>
  pipe(
    Str.split(sourcePath, /[\\/]/u),
    A.filter(Str.isNonEmpty),
    A.last,
    O.getOrElse(() => sourcePath)
  );

const sourcePathReferencesModule = (entry: CatalogEntry, moduleName: EffectCapabilitySeedModuleName): boolean =>
  A.contains(
    [`${moduleName}.ts`, `${moduleName}.d.ts`, `${moduleName}.d.mts`, `${moduleName}.d.cts`],
    sourcePathFileName(entry.sourcePath)
  );

const importSpecifierReferencesModule = (entry: CatalogEntry, moduleName: EffectCapabilitySeedModuleName): boolean =>
  A.some(catalogImportSpecifierSuffixes[moduleName], (suffix) => Str.endsWith(suffix)(entry.importSpecifier));

const moduleNameForCatalogEntry = (entry: CatalogEntry): O.Option<EffectCapabilitySeedModuleName> =>
  pipe(
    adjacentModules,
    A.findFirst(
      (moduleName) =>
        sourcePathReferencesModule(entry, moduleName) || importSpecifierReferencesModule(entry, moduleName)
    )
  );

const catalogVisibilityFromEntry = (
  moduleName: EffectCapabilitySeedModuleName,
  entry: CatalogEntry
): EffectCapabilityCatalogVisibility =>
  EffectCapabilityCatalogVisibility.make({
    moduleName,
    packageName: entry.packageName,
    importSpecifier: entry.importSpecifier,
    symbolName: entry.symbolName,
    sourcePath: entry.sourcePath,
    sourceLine: entry.sourceLine,
    summary: entry.summary,
    categories: entry.categories,
    evidence: EffectCapabilityEvidence.make({
      sourcePath: entry.sourcePath,
      startLine: entry.sourceLine,
      endLine: entry.sourceLine,
      origin: "repo-exports-catalog",
      anchor: `${entry.importSpecifier}:${entry.symbolName}`,
      excerpt: entry.summary,
    }),
  });

const readCatalogVisibility = Effect.fn(function* (
  repoRootPath: string,
  catalogPath: string
): Effect.fn.Return<
  ReadonlyArray<EffectCapabilityCatalogVisibility>,
  EffectCapabilitySeedError,
  FileSystem.FileSystem | Path.Path
> {
  const index = yield* parseJsonFile(repoRootPath, catalogPath, decodeCatalogIndex);
  let entries = A.empty<EffectCapabilityCatalogVisibility>();

  for (const indexPackage of index.packages) {
    if (O.isNone(indexPackage.shardPath)) {
      continue;
    }

    const shard = yield* parseJsonFile(repoRootPath, indexPackage.shardPath.value, decodeCatalogShard);
    for (const entry of shard.package.exports) {
      const moduleName = moduleNameForCatalogEntry(entry);
      if (O.isSome(moduleName)) {
        entries = A.append(entries, catalogVisibilityFromEntry(moduleName.value, entry));
      }
    }
  }

  return pipe(
    entries,
    A.dedupeWith(
      (left, right) =>
        left.moduleName === right.moduleName &&
        left.importSpecifier === right.importSpecifier &&
        left.symbolName === right.symbolName &&
        left.sourcePath === right.sourcePath
    ),
    A.sort(byCatalogVisibility)
  );
});

const lowerTokens: (text: string) => ReadonlyArray<string> = flow(
  Str.toLowerCase,
  Str.replace(/[^a-z0-9]+/gu, " "),
  Str.split(" "),
  A.map(Str.trim),
  A.filter(Str.isNonEmpty),
  A.dedupe
);

const tokenHits = (tokens: ReadonlyArray<string>, keywords: ReadonlyArray<string>): number =>
  pipe(
    tokens,
    A.reduce(0, (count, token) => (A.contains(keywords, token) ? count + 1 : count))
  );

const symbolEvidenceById = (
  report: EffectCapabilitySeedReport,
  suggestedSymbols: ReadonlyArray<string>
): ReadonlyArray<EffectCapabilityEvidence> => {
  let evidence = A.empty<EffectCapabilityEvidence>();
  for (const module of report.modules) {
    for (const symbol of module.symbols) {
      if (A.contains(suggestedSymbols, symbol.id)) {
        evidence = A.appendAll(evidence, symbol.evidence);
      }
    }
  }
  return evidence;
};

const fixtureEvidence = (
  fixture: EffectCapabilitySeedFixture,
  scenario: EffectCapabilityAdvisoryScenario = fixture.scenario
): EffectCapabilityEvidence =>
  EffectCapabilityEvidence.make({
    sourcePath: `fixture:${fixture.id}`,
    startLine: 1,
    endLine: 1,
    origin: "seed-advisory-fixture",
    anchor: scenario,
    excerpt: fixture.text,
  });

const moduleNameForAdvisoryScenario: (
  scenario: EffectCapabilityAdvisoryScenario
) => O.Option<EffectCapabilitySeedModuleName> = Match.type<EffectCapabilityAdvisoryScenario>().pipe(
  Match.when("merge-combine", () => O.some<EffectCapabilitySeedModuleName>("Combiner")),
  Match.when("fold-aggregate", () => O.some<EffectCapabilitySeedModuleName>("Reducer")),
  Match.when("validation-transformation", () => O.some<EffectCapabilitySeedModuleName>("Filter")),
  Match.when("decline-no-match", O.none<EffectCapabilitySeedModuleName>),
  Match.exhaustive
);

const preferredSymbolNamesForScenario: (scenario: EffectCapabilityAdvisoryScenario) => ReadonlyArray<string> =
  Match.type<EffectCapabilityAdvisoryScenario>().pipe(
    Match.when("merge-combine", () => ["Combiner", "make", "first", "last", "intercalate"]),
    Match.when("fold-aggregate", () => ["Reducer", "make", "flip"]),
    Match.when("validation-transformation", () => [
      "Filter",
      "FilterEffect",
      "make",
      "makeEffect",
      "fromPredicate",
      "toOption",
      "toResult",
    ]),
    Match.when("decline-no-match", A.empty<string>),
    Match.exhaustive
  );

const suggestedSymbolsForScenario = (
  scenario: EffectCapabilityAdvisoryScenario,
  report: EffectCapabilitySeedReport
): ReadonlyArray<string> => {
  const moduleName = moduleNameForAdvisoryScenario(scenario);
  if (O.isNone(moduleName)) {
    return A.empty();
  }

  const module = A.findFirst(report.modules, (candidate) => candidate.moduleName === moduleName.value);
  if (O.isNone(module)) {
    return A.empty();
  }

  const preferredNames = preferredSymbolNamesForScenario(scenario);

  return pipe(
    module.value.symbols,
    A.filter((symbol) => A.contains(preferredNames, symbol.name)),
    A.map((symbol) => symbol.id)
  );
};

const classifyAdvisoryScenario = (text: string): EffectCapabilityAdvisoryScenario => {
  const tokens = lowerTokens(text);
  const mergeScore = tokenHits(tokens, ["merge", "combine", "combining", "accumulate", "strategy"]);
  const foldScore = tokenHits(tokens, ["fold", "reduce", "aggregate", "collection", "initial", "all"]);
  const filterScore = tokenHits(tokens, ["filter", "validate", "predicate", "transform", "narrow", "result"]);

  if (mergeScore >= foldScore && mergeScore >= filterScore && mergeScore > 0) {
    return "merge-combine";
  }
  if (foldScore >= filterScore && foldScore > 0) {
    return "fold-aggregate";
  }
  if (filterScore > 0) {
    return "validation-transformation";
  }
  return "decline-no-match";
};

const findingForFixture = (
  report: EffectCapabilitySeedReport,
  fixture: EffectCapabilitySeedFixture
): EffectCapabilityAdvisoryFinding => {
  const scenario = classifyAdvisoryScenario(fixture.text);

  if (scenario === "decline-no-match") {
    return EffectCapabilityAdvisoryFinding.make({
      fixtureId: fixture.id,
      scenario,
      decision: "decline",
      confidence: 0.2,
      suggestedSymbols: A.empty(),
      rationale: "No seed capability evidence matched strongly enough to suggest Combiner, Reducer, or Filter.",
      evidence: [fixtureEvidence(fixture, scenario)],
    });
  }

  const suggestedSymbols = suggestedSymbolsForScenario(scenario, report);
  if (suggestedSymbols.length === 0) {
    return EffectCapabilityAdvisoryFinding.make({
      fixtureId: fixture.id,
      scenario,
      decision: "decline",
      confidence: 0.3,
      suggestedSymbols,
      rationale: `Matched ${scenario} language, but no deterministic seed symbols were available to cite.`,
      evidence: [fixtureEvidence(fixture, scenario)],
    });
  }

  return EffectCapabilityAdvisoryFinding.make({
    fixtureId: fixture.id,
    scenario,
    decision: "suggest",
    confidence: 0.8,
    suggestedSymbols,
    rationale: `Matched ${scenario} language to deterministic Effect v4 ${scenario} capability evidence.`,
    evidence: [fixtureEvidence(fixture, scenario), ...symbolEvidenceById(report, suggestedSymbols)],
  });
};

/**
 * Default tiny advisory fixtures for the seed proof.
 *
 * @example
 * ```ts
 * import { defaultEffectCapabilitySeedFixtures } from "@beep/repo-utils/EffectCapabilityKG"
 * console.log(defaultEffectCapabilitySeedFixtures.length)
 * ```
 * @category fixtures
 * @since 0.0.0
 */
export const defaultEffectCapabilitySeedFixtures: ReadonlyArray<EffectCapabilitySeedFixture> = [
  EffectCapabilitySeedFixture.make({
    id: "merge-settings",
    scenario: "merge-combine",
    text: "Merge two values with reusable combine semantics and first or last write wins strategy.",
  }),
  EffectCapabilitySeedFixture.make({
    id: "fold-rows",
    scenario: "fold-aggregate",
    text: "Reduce a collection into one aggregate using a known initial value.",
  }),
  EffectCapabilitySeedFixture.make({
    id: "validate-input",
    scenario: "validation-transformation",
    text: "Validate, narrow, and transform unknown input through a predicate result pipeline.",
  }),
  EffectCapabilitySeedFixture.make({
    id: "render-button",
    scenario: "decline-no-match",
    text: "Render a compact UI button with accessible hover styling.",
  }),
];

/**
 * Run deterministic advisory matching over seed fixtures.
 *
 * @param report - Capability seed report that provides extracted evidence.
 * @param fixtures - Tiny fixture set to classify. Each fixture's `scenario`
 * identifies declared intent; returned findings use the text-classified
 * scenario as the advisory routing result.
 * @returns Findings that either suggest seed symbols or decline with evidence.
 * @example
 * ```ts
 * import {
 *   adviseEffectCapabilitySeedFixtures,
 *   defaultEffectCapabilitySeedFixtures
 * } from "@beep/repo-utils/EffectCapabilityKG"
 *
 * console.log(adviseEffectCapabilitySeedFixtures)
 * console.log(defaultEffectCapabilitySeedFixtures.length)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const adviseEffectCapabilitySeedFixtures = (
  report: EffectCapabilitySeedReport,
  fixtures: ReadonlyArray<EffectCapabilitySeedFixture> = defaultEffectCapabilitySeedFixtures
): ReadonlyArray<EffectCapabilityAdvisoryFinding> => A.map(fixtures, (fixture) => findingForFixture(report, fixture));

/**
 * Build the deterministic Effect capability KG seed report.
 *
 * The seed proof intentionally depends on the vendored Effect v4 corpus at
 * `.repos/effect-v4`. Missing corpus or catalog files fail as
 * {@link EffectCapabilitySeedError} instead of falling back to process CWD.
 *
 * @param repoRootPath - Absolute repository root path.
 * @returns Effect that extracts upstream Effect v4 source/JSDoc/catalog evidence.
 * @example
 * ```ts
 * import { buildEffectCapabilitySeedReport } from "@beep/repo-utils/EffectCapabilityKG"
 * const program = buildEffectCapabilitySeedReport("/repo")
 * console.log(program)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const buildEffectCapabilitySeedReport = Effect.fn("EffectCapabilityKG.buildEffectCapabilitySeedReport")(
  function* (
    repoRootPath: string
  ): Effect.fn.Return<
    EffectCapabilitySeedReport,
    EffectCapabilitySeedError,
    FileSystem.FileSystem | Path.Path | TSMorphService
  > {
    const pathApi = yield* Path.Path;
    const tsMorph = yield* TSMorphService;
    const paths = effectCapabilitySeedPaths(pathApi, repoRootPath);
    const request = yield* decodeProjectInspectionRequest({
      entrypoint: {
        _tag: "tsconfig",
        tsConfigPath: paths.tsConfigPath,
      },
      repoRootPath,
      mode: TsMorphScopeMode.Enum.syntax,
      referencePolicy: TsMorphReferencePolicy.Enum.workspaceOnly,
      filePaths: A.map(allSourceModules, paths.sourcePathForModule),
      sourceFileGlobs: A.empty(),
    }).pipe(
      Effect.mapError((error) =>
        seedError(`Failed to build Effect v4 ts-morph inspection request: ${error.message}`, O.some(paths.tsConfigPath))
      )
    );

    const modules = yield* tsMorph
      .inspectProject(request, ({ scope, sourceFiles }) =>
        pipe(
          sourceFiles,
          A.map((sourceFile) => collectModule(pathApi, scope.repoRootPath, paths.sourcePathForModule, sourceFile)),
          A.getSomes,
          A.filter((module) => A.contains(allSourceModules, module.moduleName)),
          A.dedupeWith((left, right) => left.moduleName === right.moduleName),
          A.sort(byModuleOrder)
        )
      )
      .pipe(Effect.mapError((error) => seedError(error.message, O.some(paths.tsConfigPath))));

    const catalogVisibility = yield* readCatalogVisibility(repoRootPath, paths.catalogPath);
    const partialReport = EffectCapabilitySeedReport.make({
      sourceRoot: paths.sourceDir,
      seedModules,
      adjacentModules,
      modules,
      edges: A.empty(),
      catalogVisibility,
      advisoryFindings: A.empty(),
    });
    const reportWithEdges = EffectCapabilitySeedReport.make({
      ...partialReport,
      edges: buildEdges(modules, catalogVisibility),
    });

    return EffectCapabilitySeedReport.make({
      ...reportWithEdges,
      advisoryFindings: adviseEffectCapabilitySeedFixtures(reportWithEdges),
    });
  }
);
