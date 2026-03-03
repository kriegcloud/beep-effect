// cspell:ignore tsmorph scip
import { $RepoUtilsId } from "@beep/identity/packages";
import { LiteralKit, NonNegativeInt } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { Node, Project, TypeChecker } from "ts-morph";
import { CodebaseGraph } from "../models.js";

const $I = $RepoUtilsId.create("codegraph/tsmorph/models");

/**
 * Identifier format mode for extracted codegraph entities.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphIdMode = LiteralKit(["graph-v2", "scip-hash"]).annotate(
  $I.annote("TsMorphIdMode", {
    description: "Identifier strategy used when deriving node ids.",
  })
);

/**
 * Identifier format mode runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphIdMode = typeof TsMorphIdMode.Type;

/**
 * Node kinds emitted by the generalized ts-morph extractor.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphNodeKind = LiteralKit([
  "package",
  "file",
  "namespace",
  "class",
  "interface",
  "type_alias",
  "enum",
  "enum_member",
  "function",
  "method",
  "constructor",
  "getter",
  "setter",
  "property",
  "parameter",
  "variable",
  "decorator",
  "jsx_component",
  "module_declaration",
]).annotate(
  $I.annote("TsMorphNodeKind", {
    description: "Canonical node-kind surface emitted by ts-morph extraction.",
  })
);

/**
 * Node kind runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphNodeKind = typeof TsMorphNodeKind.Type;

/**
 * Edge kinds emitted by the generalized ts-morph extractor.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphEdgeKind = LiteralKit([
  "imports",
  "re_exports",
  "exports",
  "calls",
  "conditional_calls",
  "instantiates",
  "extends",
  "implements",
  "overrides",
  "contains",
  "has_method",
  "has_constructor",
  "has_property",
  "has_getter",
  "has_setter",
  "has_parameter",
  "has_member",
  "type_reference",
  "return_type",
  "generic_constraint",
  "reads_property",
  "writes_property",
  "decorates",
  "throws",
  "test_covers",
  "uses_type",
]).annotate(
  $I.annote("TsMorphEdgeKind", {
    description: "Canonical edge-kind surface emitted by ts-morph extraction.",
  })
);

/**
 * Edge kind runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphEdgeKind = typeof TsMorphEdgeKind.Type;

/**
 * Request payload for resolving a scoped ts-morph project context.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphProjectScopeRequest extends S.Class<TsMorphProjectScopeRequest>($I`TsMorphProjectScopeRequest`)(
  {
    rootTsConfigPath: S.String,
    changedFiles: S.OptionFromOptionalKey(S.Array(S.String)),
    idMode: S.OptionFromOptionalKey(TsMorphIdMode),
  },
  $I.annote("TsMorphProjectScopeRequest", {
    description: "Inputs used to derive tsconfig scope for a project session.",
  })
) {}

/**
 * Resolved project scope for one ts-morph service operation.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphProjectScope extends S.Class<TsMorphProjectScope>($I`TsMorphProjectScope`)(
  {
    rootTsConfigPath: S.String,
    resolvedTsConfigPaths: S.Array(S.String),
    selectedTsConfigPaths: S.Array(S.String),
    changedFiles: S.Array(S.String),
    idMode: TsMorphIdMode,
  },
  $I.annote("TsMorphProjectScope", {
    description: "Resolved tsconfig scope used for ts-morph extraction and edits.",
  })
) {}

/**
 * Runtime project context shared by higher-level methods.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export interface TsMorphProjectContext {
  readonly scope: TsMorphProjectScope;
  readonly project: Project;
  readonly checker: TypeChecker;
}

/**
 * Generic deterministic tag labels derived without LLM inference.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphDeterministicTagName = LiteralKit([
  "@param",
  "@returns",
  "@template",
  "@async",
  "@implements",
  "@extends",
  "@export",
  "@access",
  "@readonly",
  "@abstract",
  "@override",
  "@static",
  "@throws",
  "@requires",
]).annotate(
  $I.annote("TsMorphDeterministicTagName", {
    description: "Layer-1 deterministic tag names supported by ts-morph derivation.",
  })
);

/**
 * Deterministic tag runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphDeterministicTagName = typeof TsMorphDeterministicTagName.Type;

/**
 * One deterministic JSDoc tag derived from AST and type information.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphDeterministicTag extends S.Class<TsMorphDeterministicTag>($I`TsMorphDeterministicTag`)(
  {
    tag: TsMorphDeterministicTagName,
    value: S.OptionFromOptionalKey(S.String),
    confidence: S.Number,
  },
  $I.annote("TsMorphDeterministicTag", {
    description: "Deterministically-derived tag produced without LLM inference.",
  })
) {}

/**
 * Symbol selector used by tag, query, and write operations.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphSymbolSelector extends S.Class<TsMorphSymbolSelector>($I`TsMorphSymbolSelector`)(
  {
    symbolId: S.String,
    filePath: S.OptionFromOptionalKey(S.String),
    symbolName: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("TsMorphSymbolSelector", {
    description: "Portable selector for a declaration symbol in source.",
  })
) {}

/**
 * Request for extracting a codebase graph snapshot.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphGraphExtractionRequest extends S.Class<TsMorphGraphExtractionRequest>(
  $I`TsMorphGraphExtractionRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    includeTests: S.OptionFromOptionalKey(S.Boolean),
  },
  $I.annote("TsMorphGraphExtractionRequest", {
    description: "Inputs for extracting a codebase graph snapshot via ts-morph.",
  })
) {}

/**
 * Request for deterministic tag derivation.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphDeterministicJSDocRequest extends S.Class<TsMorphDeterministicJSDocRequest>(
  $I`TsMorphDeterministicJSDocRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    symbol: TsMorphSymbolSelector,
  },
  $I.annote("TsMorphDeterministicJSDocRequest", {
    description: "Inputs for deterministic layer-1 JSDoc derivation.",
  })
) {}

/**
 * Request for decomposing `Effect<A, E, R>` channels.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphEffectDecompositionRequest extends S.Class<TsMorphEffectDecompositionRequest>(
  $I`TsMorphEffectDecompositionRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    symbol: TsMorphSymbolSelector,
  },
  $I.annote("TsMorphEffectDecompositionRequest", {
    description: "Inputs for decomposing Effect error/dependency channels.",
  })
) {}

/**
 * Result of decomposing Effect channels.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphEffectChannels extends S.Class<TsMorphEffectChannels>($I`TsMorphEffectChannels`)(
  {
    errors: S.Array(S.String),
    requirements: S.Array(S.String),
    isEffectReturn: S.Boolean,
  },
  $I.annote("TsMorphEffectChannels", {
    description: "Decomposed error and requirement channels for an Effect return type.",
  })
) {}

/**
 * Search request for symbol retrieval.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphSearchSymbolsRequest extends S.Class<TsMorphSearchSymbolsRequest>($I`TsMorphSearchSymbolsRequest`)(
  {
    scope: TsMorphProjectScopeRequest,
    query: S.String,
    kind: S.OptionFromOptionalKey(TsMorphNodeKind),
    limit: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("TsMorphSearchSymbolsRequest", {
    description: "Inputs for searching symbols by label and optional kind.",
  })
) {}

/**
 * One search match for a symbol query.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphSymbolMatch extends S.Class<TsMorphSymbolMatch>($I`TsMorphSymbolMatch`)(
  {
    symbolId: S.String,
    kind: TsMorphNodeKind,
    label: S.String,
    filePath: S.String,
    line: NonNegativeInt,
  },
  $I.annote("TsMorphSymbolMatch", {
    description: "One search result for symbol discovery operations.",
  })
) {}

/**
 * Dependency traversal direction.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphDependencyDirection = LiteralKit(["upstream", "downstream"]).annotate(
  $I.annote("TsMorphDependencyDirection", {
    description: "Direction used when traversing dependency edges.",
  })
);

/**
 * Dependency direction runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphDependencyDirection = typeof TsMorphDependencyDirection.Type;

/**
 * Request for dependency traversal.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphTraverseDependenciesRequest extends S.Class<TsMorphTraverseDependenciesRequest>(
  $I`TsMorphTraverseDependenciesRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    symbolId: S.String,
    direction: TsMorphDependencyDirection,
    maxHops: S.OptionFromOptionalKey(NonNegativeInt),
  },
  $I.annote("TsMorphTraverseDependenciesRequest", {
    description: "Inputs for subgraph dependency traversal.",
  })
) {}

/**
 * Request for function explanation context.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphExplainFunctionRequest extends S.Class<TsMorphExplainFunctionRequest>(
  $I`TsMorphExplainFunctionRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    symbolId: S.String,
  },
  $I.annote("TsMorphExplainFunctionRequest", {
    description: "Inputs for function explanation with local graph context.",
  })
) {}

/**
 * Function explanation payload.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphFunctionExplanation extends S.Class<TsMorphFunctionExplanation>($I`TsMorphFunctionExplanation`)(
  {
    symbolId: S.String,
    signature: S.String,
    deterministicTags: S.Array(TsMorphDeterministicTag),
    context: CodebaseGraph,
  },
  $I.annote("TsMorphFunctionExplanation", {
    description: "Function-level explanation payload including graph context.",
  })
) {}

/**
 * User supplied JSDoc tag entry used by validation and write planning.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocTagInput extends S.Class<TsMorphJSDocTagInput>($I`TsMorphJSDocTagInput`)(
  {
    tag: S.String,
    value: S.OptionFromOptionalKey(S.String),
    confidence: S.OptionFromOptionalKey(S.Number),
  },
  $I.annote("TsMorphJSDocTagInput", {
    description: "Tag payload submitted for validation and source writes.",
  })
) {}

/**
 * Validation request for JSDoc insertion.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphValidateJSDocRequest extends S.Class<TsMorphValidateJSDocRequest>($I`TsMorphValidateJSDocRequest`)(
  {
    scope: TsMorphProjectScopeRequest,
    symbol: TsMorphSymbolSelector,
    tags: S.Array(TsMorphJSDocTagInput),
  },
  $I.annote("TsMorphValidateJSDocRequest", {
    description: "Inputs for validating JSDoc payloads before mutation.",
  })
) {}

/**
 * Validation issue entry returned by JSDoc validation.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocValidationIssue extends S.Class<TsMorphJSDocValidationIssue>($I`TsMorphJSDocValidationIssue`)(
  {
    code: S.String,
    message: S.String,
    tag: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("TsMorphJSDocValidationIssue", {
    description: "Structured issue generated while validating a JSDoc payload.",
  })
) {}

/**
 * Validation report for one symbol JSDoc payload.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocValidationReport extends S.Class<TsMorphJSDocValidationReport>(
  $I`TsMorphJSDocValidationReport`
)(
  {
    symbolId: S.String,
    valid: S.Boolean,
    issues: S.Array(TsMorphJSDocValidationIssue),
    suggestions: S.Array(S.String),
  },
  $I.annote("TsMorphJSDocValidationReport", {
    description: "Validation result used by write planning and client feedback.",
  })
) {}

/**
 * One planned write operation for a symbol.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocWriteOperation extends S.Class<TsMorphJSDocWriteOperation>($I`TsMorphJSDocWriteOperation`)(
  {
    symbolId: S.String,
    filePath: S.String,
    tags: S.Array(TsMorphJSDocTagInput),
  },
  $I.annote("TsMorphJSDocWriteOperation", {
    description: "Planned deterministic write operation for one declaration symbol.",
  })
) {}

/**
 * Conflict surfaced during write planning.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocWriteConflict extends S.Class<TsMorphJSDocWriteConflict>($I`TsMorphJSDocWriteConflict`)(
  {
    symbolId: S.String,
    tag: S.String,
    keptValue: S.OptionFromOptionalKey(S.String),
    droppedValue: S.OptionFromOptionalKey(S.String),
    reason: S.String,
  },
  $I.annote("TsMorphJSDocWriteConflict", {
    description: "Conflict generated when multiple writes target the same symbol/tag slot.",
  })
) {}

/**
 * Request for deterministic JSDoc write planning.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphPlanJSDocWritesRequest extends S.Class<TsMorphPlanJSDocWritesRequest>(
  $I`TsMorphPlanJSDocWritesRequest`
)(
  {
    scope: TsMorphProjectScopeRequest,
    operations: S.Array(TsMorphJSDocWriteOperation),
  },
  $I.annote("TsMorphPlanJSDocWritesRequest", {
    description: "Inputs used to produce deterministic JSDoc write plans.",
  })
) {}

/**
 * Deterministic JSDoc write plan.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocWritePlan extends S.Class<TsMorphJSDocWritePlan>($I`TsMorphJSDocWritePlan`)(
  {
    scope: TsMorphProjectScope,
    operations: S.Array(TsMorphJSDocWriteOperation),
    conflicts: S.Array(TsMorphJSDocWriteConflict),
  },
  $I.annote("TsMorphJSDocWritePlan", {
    description: "Deterministic JSDoc write plan produced after conflict resolution.",
  })
) {}

/**
 * Receipt returned after applying a write plan.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocWriteReceipt extends S.Class<TsMorphJSDocWriteReceipt>($I`TsMorphJSDocWriteReceipt`)(
  {
    appliedOperations: NonNegativeInt,
    touchedFiles: S.Array(S.String),
    conflicts: S.Array(TsMorphJSDocWriteConflict),
  },
  $I.annote("TsMorphJSDocWriteReceipt", {
    description: "Result summary after applying one JSDoc write plan.",
  })
) {}

/**
 * Scope selector used for drift checks.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphDriftScope = LiteralKit(["file", "package", "all"]).annotate(
  $I.annote("TsMorphDriftScope", {
    description: "Scope selector for JSDoc drift checks.",
  })
);

/**
 * Drift scope runtime type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphDriftScope = typeof TsMorphDriftScope.Type;

/**
 * Input payload for signature-hash drift detection across selected symbols.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphCheckDriftRequest extends S.Class<TsMorphCheckDriftRequest>($I`TsMorphCheckDriftRequest`)(
  {
    scope: TsMorphProjectScopeRequest,
    symbolIds: S.OptionFromOptionalKey(S.Array(S.String)),
    driftScope: S.OptionFromOptionalKey(TsMorphDriftScope),
  },
  $I.annote("TsMorphCheckDriftRequest", {
    description: "Inputs for detecting documentation drift via signature hashes.",
  })
) {}

/**
 * Drift entry for one symbol.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocDriftEntry extends S.Class<TsMorphJSDocDriftEntry>($I`TsMorphJSDocDriftEntry`)(
  {
    symbolId: S.String,
    driftDetected: S.Boolean,
    previousSignatureHash: S.OptionFromOptionalKey(S.String),
    currentSignatureHash: S.String,
  },
  $I.annote("TsMorphJSDocDriftEntry", {
    description: "Drift status and signature hash details for one symbol.",
  })
) {}

/**
 * Drift report payload.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export class TsMorphJSDocDriftReport extends S.Class<TsMorphJSDocDriftReport>($I`TsMorphJSDocDriftReport`)(
  {
    entries: S.Array(TsMorphJSDocDriftEntry),
    checkedSymbols: NonNegativeInt,
    driftedSymbols: NonNegativeInt,
  },
  $I.annote("TsMorphJSDocDriftReport", {
    description: "Summary report returned by JSDoc drift checks.",
  })
) {}

/**
 * Runtime declaration target kinds supported by mutable JSDoc operations.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const TsMorphDeclarationTargetKind = LiteralKit([
  "function",
  "class",
  "interface",
  "type_alias",
  "enum",
  "method",
  "constructor",
  "getter",
  "setter",
  "property",
  "variable",
  "module_declaration",
]);

/**
 * Runtime declaration target kind type.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export type TsMorphDeclarationTargetKind = typeof TsMorphDeclarationTargetKind.Type;

/**
 * Runtime declaration target resolved for one symbol selector.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export interface TsMorphDeclarationTarget {
  readonly symbolId: string;
  readonly filePath: string;
  readonly symbolName: string;
  readonly kind: TsMorphDeclarationTargetKind;
  readonly declaration: Node;
}

/**
 * Default identifier mode used by request normalization.
 *
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const DefaultTsMorphIdMode: TsMorphIdMode = "graph-v2";

/**
 * Convert optional id mode to effective mode.
 *
 * @param idMode - Optional requested id mode.
 * @returns Effective mode, defaulting to graph-v2.
 * @category codegraph-tsmorph
 * @since 0.0.0
 */
export const resolveIdMode = (idMode: O.Option<TsMorphIdMode>): TsMorphIdMode =>
  O.getOrElse(idMode, () => DefaultTsMorphIdMode);
