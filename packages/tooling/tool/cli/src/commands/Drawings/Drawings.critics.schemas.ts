/**
 * Schemas for the sequential multi-model critic loop over a rendered sheet set.
 *
 * **Details**
 *
 * A critic pack is a directory a reviewer works in: sheet rasters, 300 dpi
 * zooms, the SVG vectors and their stroke tables, operator-supplied context,
 * a brief, and the earlier reviewers' reports of the same loop. Reviewers run
 * in order; each sees the earlier reports and must confirm, refute, or extend
 * them instead of repeating them. The report every reviewer returns is
 * {@link CriticReport}; its JSON Schema is derived from the same class so the
 * contract the reviewers are given and the decoder that reads them back cannot
 * drift.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit, SchemaUtils, Sha256Hex } from "@beep/schema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { QaSeverity } from "../Qa/Inventory.schemas.ts";
import { FigureNumber } from "./Drawings.review.schemas.ts";

const $I = $RepoCliId.create("commands/Drawings/Drawings.critics.schemas");

const CriticRouteBase = LiteralKit(["codex", "grok", "claude", "cursor"]);

/**
 * The command-line route a reviewer runs on.
 *
 * **Example** (Route literals)
 *
 * ```ts
 * import { CriticRoute } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticRoute.literals) // ["codex", "grok", "claude", "cursor"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticRoute = CriticRouteBase.pipe(
  $I.annoteSchema("CriticRoute", {
    description: "The CLI a reviewer runs on: codex exec, the grok CLI, claude -p, or cursor-agent.",
  }),
  SchemaUtils.withLiteralKitStatics(CriticRouteBase)
);

/**
 * The CLI a reviewer runs on.
 *
 * @category models
 * @since 0.0.0
 */
export type CriticRoute = typeof CriticRoute.Type;

const CriticScopeBase = LiteralKit(["matter", "synthetic"]);

/**
 * Which pack a reviewer may see: the matter's own render, or only the public
 * synthetic twin plus the repository (a Cursor-hosted reviewer never sees
 * matter material).
 *
 * **Example** (Scope literals)
 *
 * ```ts
 * import { CriticScope } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticScope.Enum.synthetic) // "synthetic"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticScope = CriticScopeBase.pipe(
  $I.annoteSchema("CriticScope", {
    description: "matter: the reviewer sees the matter pack; synthetic: only the public synthetic pack and the repo.",
  }),
  SchemaUtils.withLiteralKitStatics(CriticScopeBase)
);

/**
 * Which pack a reviewer may see.
 *
 * @category models
 * @since 0.0.0
 */
export type CriticScope = typeof CriticScope.Type;

/**
 * One reviewer of the sequence: its display name, the id prefix its findings
 * carry, the route, the model, the effort the route accepts, and its scope.
 *
 * **Example** (The Codex reviewer at the highest effort)
 *
 * ```ts
 * import { CriticReviewer } from "@beep/repo-cli/commands/Drawings"
 * import * as O from "effect/Option"
 *
 * const astra = CriticReviewer.make({ name: "codex-gpt-6-astra", idPrefix: "A", route: "codex", model: "gpt-6-astra", effort: O.some("xhigh"), scope: "matter" })
 * console.log(astra.idPrefix) // "A"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticReviewer extends S.Opaque<CriticReviewer, { readonly brand: unique symbol }>()(
  S.Struct({
    name: S.NonEmptyString.annotateKey({ description: "Reviewer name written into every report." }),
    idPrefix: S.NonEmptyString.check(S.isMaxLength(3)).annotateKey({
      description: "Prefix of the reviewer's finding ids (`A` gives A-01, A-02, …).",
    }),
    route: CriticRoute.annotateKey({ description: "CLI the reviewer runs on." }),
    model: S.NonEmptyString.annotateKey({ description: "Model id as the route's CLI names it." }),
    effort: S.OptionFromOptionalKey(S.NonEmptyString).pipe(
      S.withConstructorDefault(Effect.succeedNone),
      S.annotateKey({ description: "Reasoning effort passed to the route when it accepts one." })
    ),
    scope: CriticScope.annotateKey({ description: "Which pack the reviewer may see." }),
  }).pipe(
    $I.annoteSchema("CriticReviewer", {
      description: "Name, id prefix, route, model, effort, and scope of one reviewer.",
    })
  )
) {}

const CriticRelationKindBase = LiteralKit(["new", "extends"]);

/**
 * Whether a finding is new to the loop or extends an earlier reviewer's.
 *
 * **Example** (Relation kinds)
 *
 * ```ts
 * import { CriticRelationKind } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticRelationKind.literals) // ["new", "extends"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticRelationKind = CriticRelationKindBase.pipe(
  $I.annoteSchema("CriticRelationKind", { description: "new, or extends an earlier finding of this loop." }),
  SchemaUtils.withLiteralKitStatics(CriticRelationKindBase)
);

/**
 * How a finding relates to the earlier reviewers' findings: `new`, or
 * `extends` the finding named by `of` (new figures, a different root cause, or
 * a measurement that changes its severity). A new finding carries `of: null`
 * so every key is present, which the strict structured-output modes require.
 *
 * **Example** (A new finding)
 *
 * ```ts
 * import { CriticFindingRelation } from "@beep/repo-cli/commands/Drawings"
 * import * as O from "effect/Option"
 *
 * console.log(CriticFindingRelation.make({ kind: "new", of: O.none() }).kind) // "new"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticFindingRelation extends S.Opaque<CriticFindingRelation, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: CriticRelationKind.annotateKey({ description: "new or extends." }),
    of: S.OptionFromNullOr(S.NonEmptyString).annotateKey({
      description: "Id of the earlier finding this one extends; null for a new finding.",
    }),
  }).pipe($I.annoteSchema("CriticFindingRelation", { description: "new, or extends an earlier finding by id." }))
) {}

const CriticFindingScopeBase = LiteralKit(["this-render", "pending-branch"]);

/**
 * Whether a finding is a defect of what this render carries, or concerns an
 * item the brief lists as pending in another branch.
 *
 * **Example** (Scope literals)
 *
 * ```ts
 * import { CriticFindingScope } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticFindingScope.Enum["this-render"]) // "this-render"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticFindingScope = CriticFindingScopeBase.pipe(
  $I.annoteSchema("CriticFindingScope", { description: "this-render, or pending-branch for items the brief defers." }),
  SchemaUtils.withLiteralKitStatics(CriticFindingScopeBase)
);

const CriticCategoryBase = LiteralKit([
  "rule",
  "attorney-request",
  "shading",
  "geometry",
  "labels-sheet",
  "consistency",
  "pdf-structure",
  "other",
]);

/**
 * The convention family a finding belongs to.
 *
 * **Example** (Category literals)
 *
 * ```ts
 * import { CriticCategory } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticCategory.literals.length) // 8
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticCategory = CriticCategoryBase.pipe(
  $I.annoteSchema("CriticCategory", { description: "Convention family of a finding." }),
  SchemaUtils.withLiteralKitStatics(CriticCategoryBase)
);

const Confidence = S.Finite.check(S.isBetween({ minimum: 0, maximum: 1 }));

/**
 * One finding of a critic report: where, on what basis, what was observed,
 * the proposed fix, and the reviewer's confidence.
 *
 * **Example** (A measured shading finding)
 *
 * ```ts
 * import { CriticFinding, CriticFindingRelation } from "@beep/repo-cli/commands/Drawings"
 * import * as O from "effect/Option"
 *
 * const finding = CriticFinding.make({
 *   id: "A-01",
 *   relation: CriticFindingRelation.make({ kind: "new", of: O.none() }),
 *   severity: "P1",
 *   scope: "this-render",
 *   category: "shading",
 *   figures: [2],
 *   location: "left wall of the centred point, strokes at x = 111.2 and 109.1 mm",
 *   basis: "37 CFR 1.84(m); 1993 Guide Example 34",
 *   observation: "The band sits at the lit end of the wall.",
 *   proposedFix: "Anchor the band at the shadow end.",
 *   confidence: 0.9,
 * })
 * console.log(finding.figures) // [2]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticFinding extends S.Opaque<CriticFinding, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.NonEmptyString.annotateKey({ description: "<prefix>-<nn>, numbered within the reviewer." }),
    relation: CriticFindingRelation.annotateKey({ description: "new, or extends an earlier finding." }),
    severity: QaSeverity.annotateKey({ description: "P0 blocks filing, P1 the attorney would send back, P2 polish." }),
    scope: CriticFindingScope.annotateKey({ description: "this-render or pending-branch." }),
    category: CriticCategory.annotateKey({ description: "Convention family." }),
    figures: S.Array(FigureNumber).annotateKey({ description: "FIG.s the finding applies to." }),
    location: S.NonEmptyString.annotateKey({ description: "What and where, with mm or px." }),
    basis: S.NonEmptyString.annotateKey({
      description: "Rule section, attorney ruling, Guide example, or convention.",
    }),
    observation: S.NonEmptyString.annotateKey({ description: "What the reviewer saw or measured." }),
    proposedFix: S.NonEmptyString.annotateKey({ description: "The change that would correct it." }),
    confidence: Confidence.annotateKey({ description: "0 to 1." }),
  }).pipe(
    $I.annoteSchema("CriticFinding", {
      description:
        "Id, relation, severity, scope, category, figures, location, basis, observation, fix, and confidence.",
    })
  )
) {}

const CriticPriorStanceBase = LiteralKit(["confirm", "refute", "cannot-verify"]);

/**
 * A reviewer's stance on an earlier reviewer's finding.
 *
 * **Example** (Stance literals)
 *
 * ```ts
 * import { CriticPriorStance } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticPriorStance.literals) // ["confirm", "refute", "cannot-verify"]
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticPriorStance = CriticPriorStanceBase.pipe(
  $I.annoteSchema("CriticPriorStance", {
    description: "confirm (measured and agree), refute (say what was measured), or cannot-verify.",
  }),
  SchemaUtils.withLiteralKitStatics(CriticPriorStanceBase)
);

/**
 * One earlier finding assessed by a later reviewer.
 *
 * **Example** (Confirming an earlier finding)
 *
 * ```ts
 * import { CriticPriorAssessment } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticPriorAssessment.make({ id: "A-01", stance: "confirm", note: "Measured 1.50 mm from the SVG." }).stance)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticPriorAssessment extends S.Opaque<CriticPriorAssessment, { readonly brand: unique symbol }>()(
  S.Struct({
    id: S.NonEmptyString.annotateKey({ description: "Earlier finding id." }),
    stance: CriticPriorStance.annotateKey({ description: "confirm, refute, or cannot-verify." }),
    note: S.NonEmptyString.annotateKey({ description: "What was measured, or why it could not be." }),
  }).pipe($I.annoteSchema("CriticPriorAssessment", { description: "Stance and note on one earlier finding." }))
) {}

const CriticVerdictBase = LiteralKit(["accept", "accept-with-fixes", "reject"]);

/**
 * A reviewer's verdict on the whole set.
 *
 * **Example** (Verdict literals)
 *
 * ```ts
 * import { CriticVerdict } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticVerdict.Enum.reject) // "reject"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CriticVerdict = CriticVerdictBase.pipe(
  $I.annoteSchema("CriticVerdict", { description: "accept, accept-with-fixes, or reject." }),
  SchemaUtils.withLiteralKitStatics(CriticVerdictBase)
);

/**
 * The document every reviewer returns. Its JSON Schema, derived by
 * {@link criticReportJsonSchema}, is what the structured-output routes are
 * given, so the contract and the decoder are one class.
 *
 * **Example** (An empty accept)
 *
 * ```ts
 * import { CriticReport } from "@beep/repo-cli/commands/Drawings"
 *
 * const report = CriticReport.make({ reviewer: "grok-4.7", verdict: "accept", blockers: [], priorAssessment: [], findings: [], couldNotAssess: [] })
 * console.log(report.findings.length) // 0
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticReport extends S.Opaque<CriticReport, { readonly brand: unique symbol }>()(
  S.Struct({
    reviewer: S.NonEmptyString.annotateKey({ description: "Reviewer name." }),
    verdict: CriticVerdict.annotateKey({ description: "Verdict on the set." }),
    blockers: S.Array(S.String).annotateKey({ description: "One line per blocker." }),
    priorAssessment: S.Array(CriticPriorAssessment).annotateKey({
      description: "One entry per earlier finding id of this loop.",
    }),
    findings: S.Array(CriticFinding).annotateKey({ description: "New or extending findings only." }),
    couldNotAssess: S.Array(S.String).annotateKey({ description: "What the reviewer could not examine, and why." }),
  }).pipe(
    $I.annoteSchema("CriticReport", {
      description:
        "Reviewer, verdict, blockers, assessment of earlier findings, findings, and what could not be assessed.",
    })
  )
) {}

const reportCodec = S.fromJsonString(CriticReport);
const decodeCriticReportJson = S.decodeEffect(reportCodec);
const encodeCriticReportJson = S.encodeEffect(reportCodec);

/**
 * Decode a critic report from JSON text.
 *
 * **Example** (Decode an accept)
 *
 * ```ts
 * import { decodeCriticReport } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const text = '{"reviewer":"x","verdict":"accept","blockers":[],"priorAssessment":[],"findings":[],"couldNotAssess":[]}'
 * Effect.runPromise(decodeCriticReport(text)).then((r) => console.log(r.verdict)) // "accept"
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeCriticReport = (text: string) => decodeCriticReportJson(text);

/**
 * Encode a critic report as JSON text.
 *
 * **Example** (Encode an accept)
 *
 * ```ts
 * import { CriticReport, encodeCriticReport } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const report = CriticReport.make({ reviewer: "x", verdict: "accept", blockers: [], priorAssessment: [], findings: [], couldNotAssess: [] })
 * Effect.runPromise(encodeCriticReport(report)).then((text) => console.log(text.length > 0)) // true
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const encodeCriticReport = (report: CriticReport) => encodeCriticReportJson(report);

/**
 * The JSON Schema (draft 2020-12) of {@link CriticReport} as the structured-output
 * routes expect it: definitions inlined, every key required, no excess
 * properties, and only the keywords the strict modes accept (`type`,
 * `properties`, `required`, `additionalProperties`, `items`, `enum`, `anyOf`,
 * `description`). Length and range checks stay on the decoder.
 *
 * **Example** (The schema names its required keys)
 *
 * ```ts
 * import { criticReportJsonSchema } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(JSON.parse(criticReportJsonSchema()).required) // ["reviewer", "verdict", ...]
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const criticReportJsonSchema = (): string =>
  JSON.stringify(
    strictKeywords(
      S.toJsonSchemaDocument(CriticReport, { onExcessProperty: "error", referencePolicy: () => undefined }).schema
    ),
    null,
    2
  );

const STRICT_KEYWORDS = HashSet.fromIterable([
  "type",
  "properties",
  "required",
  "additionalProperties",
  "items",
  "enum",
  "anyOf",
  "description",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

// Keep only the keywords the strict structured-output modes accept, recursively;
// the children of `properties` are property names, not keywords, and stay.
const strictKeywords = (node: unknown): unknown =>
  Array.isArray(node)
    ? A.map(node, strictKeywords)
    : isRecord(node)
      ? pipe(
          node,
          R.filter((_, key) => HashSet.has(STRICT_KEYWORDS, key)),
          R.map((value, key) =>
            key === "properties" && isRecord(value) ? R.map(value, strictKeywords) : strictKeywords(value)
          )
        )
      : node;

/**
 * A 300 dpi crop of one sheet, in raster pixels at 300 dpi from the page's
 * top-left corner.
 *
 * **Example** (A wall crop)
 *
 * ```ts
 * import { CriticZoom } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticZoom.make({ figure: 1, label: "walls", x: 500, y: 1500, width: 1700, height: 1400 }).label)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticZoom extends S.Opaque<CriticZoom, { readonly brand: unique symbol }>()(
  S.Struct({
    figure: FigureNumber.annotateKey({ description: "FIG. the crop is cut from." }),
    label: S.NonEmptyString.annotateKey({ description: "Short name used in the file name." }),
    x: S.Natural.annotateKey({ description: "Left edge, px at 300 dpi." }),
    y: S.Natural.annotateKey({ description: "Top edge, px at 300 dpi." }),
    width: S.Int.check(S.isGreaterThan(0)).annotateKey({ description: "Width, px at 300 dpi." }),
    height: S.Int.check(S.isGreaterThan(0)).annotateKey({ description: "Height, px at 300 dpi." }),
  }).pipe($I.annoteSchema("CriticZoom", { description: "Figure, label, and crop rectangle of a 300 dpi zoom." }))
) {}

/**
 * What a critic pack holds, written as `pack.json` in the pack directory.
 *
 * **Example** (Reference the class)
 *
 * ```ts
 * import { CriticPackManifest } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticPackManifest.name) // "CriticPackManifest"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticPackManifest extends S.Opaque<CriticPackManifest, { readonly brand: unique symbol }>()(
  S.Struct({
    schemaVersion: S.Literal("drawing-critic-pack/v1").annotateKey({ description: "Schema version." }),
    title: S.NonEmptyString.annotateKey({ description: "Title from the render manifest." }),
    sheetSetSha256: Sha256Hex.annotateKey({ description: "Hash of the sheet-set PDF the pack was built from." }),
    specSha256: Sha256Hex.annotateKey({ description: "Hash of the spec the set was rendered from." }),
    sheets: S.Array(S.NonEmptyString).annotateKey({ description: "Pack-relative 150 dpi sheet PNGs, in FIG. order." }),
    zooms: S.Array(S.NonEmptyString).annotateKey({ description: "Pack-relative 300 dpi crops." }),
    svgs: S.Array(S.NonEmptyString).annotateKey({ description: "Pack-relative figure SVGs." }),
    images: S.Array(S.NonEmptyString).annotateKey({
      description: "Pack-relative context images (markup pages, photographs) attached to image-taking routes.",
    }),
    strokeTable: S.NonEmptyString.annotateKey({ description: "Pack-relative stroke table (RENDER.md)." }),
    brief: S.NonEmptyString.annotateKey({ description: "Pack-relative brief every reviewer reads first." }),
  }).pipe($I.annoteSchema("CriticPackManifest", { description: "Hashes and pack-relative files of a critic pack." }))
) {}

/**
 * Decode a pack manifest from JSON text.
 *
 * @category decoding
 * @since 0.0.0
 */
const manifestCodec = S.fromJsonString(CriticPackManifest);
const decodeCriticPackManifestJson = S.decodeEffect(manifestCodec);
const encodeCriticPackManifestJson = S.encodeEffect(manifestCodec);

/**
 * Decode a manifest from JSON text.
 *
 * **Example** (A one-sheet pack)
 *
 * ```ts
 * import { decodeCriticPackManifest } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const text = '{"schemaVersion":"drawing-critic-pack/v1","title":"Bracket","sheetSetSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","specSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sheets":["render/pg-1.png"],"zooms":[],"svgs":["render/fig-1.svg"],"images":[],"strokeTable":"render/RENDER.md","brief":"BRIEF.md"}'
 * Effect.runPromise(decodeCriticPackManifest(text)).then((manifest) => console.log(manifest.sheets)) // ["render/pg-1.png"]
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeCriticPackManifest = (text: string) => decodeCriticPackManifestJson(text);

/**
 * Encode a pack manifest as JSON text.
 *
 * **Example** (Round-trip a pack manifest)
 *
 * ```ts
 * import { decodeCriticPackManifest, encodeCriticPackManifest } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const text = '{"schemaVersion":"drawing-critic-pack/v1","title":"Bracket","sheetSetSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","specSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","sheets":["render/pg-1.png"],"zooms":[],"svgs":["render/fig-1.svg"],"images":[],"strokeTable":"render/RENDER.md","brief":"BRIEF.md"}'
 * Effect.runPromise(Effect.flatMap(decodeCriticPackManifest(text), encodeCriticPackManifest)).then(console.log)
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const encodeCriticPackManifest = (manifest: CriticPackManifest) => encodeCriticPackManifestJson(manifest);

/**
 * One reviewer's run inside a loop.
 *
 * **Example** (Reference the class)
 *
 * ```ts
 * import { CriticRunRecord } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticRunRecord.name) // "CriticRunRecord"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticRunRecord extends S.Opaque<CriticRunRecord, { readonly brand: unique symbol }>()(
  S.Struct({
    order: S.Int.check(S.isGreaterThanOrEqualTo(1)).annotateKey({ description: "Position in the sequence, from 1." }),
    reviewer: CriticReviewer.annotateKey({ description: "The reviewer." }),
    exitCode: S.Int.annotateKey({ description: "Exit code of the route's CLI." }),
    report: S.OptionFromNullOr(S.NonEmptyString).annotateKey({
      description: "Loop-relative report file, when the run produced a decodable report.",
    }),
    reportSha256: S.OptionFromNullOr(Sha256Hex).annotateKey({ description: "Hash of that file." }),
    findings: S.Natural.annotateKey({ description: "Findings in the report; 0 when absent." }),
    startedAt: S.NonEmptyString.annotateKey({ description: "ISO-8601 start." }),
    finishedAt: S.NonEmptyString.annotateKey({ description: "ISO-8601 end." }),
  }).pipe(
    $I.annoteSchema("CriticRunRecord", {
      description: "Order, reviewer, exit code, report file, hash, count, and times of one run.",
    })
  )
) {}

/**
 * One loop of the sequence, written as `loop.json` in the loop directory.
 *
 * **Example** (Reference the class)
 *
 * ```ts
 * import { CriticLoopRecord } from "@beep/repo-cli/commands/Drawings"
 *
 * console.log(CriticLoopRecord.name) // "CriticLoopRecord"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CriticLoopRecord extends S.Opaque<CriticLoopRecord, { readonly brand: unique symbol }>()(
  S.Struct({
    schemaVersion: S.Literal("drawing-critic-loop/v1").annotateKey({ description: "Schema version." }),
    loop: S.Int.check(S.isGreaterThanOrEqualTo(1)).annotateKey({ description: "One-based loop number." }),
    sheetSetSha256: Sha256Hex.annotateKey({ description: "Hash of the sheet set reviewed." }),
    runs: S.Array(CriticRunRecord).annotateKey({ description: "Every run, in order." }),
  }).pipe($I.annoteSchema("CriticLoopRecord", { description: "Loop number, sheet-set hash, and runs of one loop." }))
) {}

/**
 * Decode a loop record from JSON text.
 *
 * @category decoding
 * @since 0.0.0
 */
const recordCodec = S.fromJsonString(CriticLoopRecord);
const decodeCriticLoopRecordJson = S.decodeEffect(recordCodec);
const encodeCriticLoopRecordJson = S.encodeEffect(recordCodec);

/**
 * Decode a record from JSON text.
 *
 * **Example** (A loop with no runs yet)
 *
 * ```ts
 * import { decodeCriticLoopRecord } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const text = '{"schemaVersion":"drawing-critic-loop/v1","loop":1,"sheetSetSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","runs":[]}'
 * Effect.runPromise(decodeCriticLoopRecord(text)).then((record) => console.log(record.loop)) // 1
 * ```
 *
 * @category decoding
 * @since 0.0.0
 */
export const decodeCriticLoopRecord = (text: string) => decodeCriticLoopRecordJson(text);

/**
 * Encode a loop record as JSON text.
 *
 * **Example** (Round-trip a loop record)
 *
 * ```ts
 * import { decodeCriticLoopRecord, encodeCriticLoopRecord } from "@beep/repo-cli/commands/Drawings"
 * import * as Effect from "effect/Effect"
 *
 * const text = '{"schemaVersion":"drawing-critic-loop/v1","loop":1,"sheetSetSha256":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","runs":[]}'
 * Effect.runPromise(Effect.flatMap(decodeCriticLoopRecord(text), encodeCriticLoopRecord)).then(console.log)
 * ```
 *
 * @category encoding
 * @since 0.0.0
 */
export const encodeCriticLoopRecord = (record: CriticLoopRecord) => encodeCriticLoopRecordJson(record);
