/**
 * Generalized ts-morph service for deterministic codegraph and JSDoc workflows.
 *
 * @since 0.0.0
 * @module
 */
// cspell:ignore tsmorph

import { $RepoUtilsId } from "@beep/identity/packages";
import { Effect, FileSystem, Layer, Path, ServiceMap } from "effect";
import * as O from "effect/Option";
import type { CodebaseGraph } from "./codegraph/models.js";
import type { TsMorphServiceError } from "./codegraph/tsmorph/errors.js";
import { extractCodebaseGraphFromContext } from "./codegraph/tsmorph/extract.js";
import {
  applyJSDocWritesInContext,
  checkJSDocDriftInContext,
  decomposeEffectChannelsFromContext,
  deriveDeterministicJSDocFromContext,
  planJSDocWritesInContext,
  validateJSDocInContext,
} from "./codegraph/tsmorph/jsdoc.js";
import {
  type TsMorphCheckDriftRequest,
  type TsMorphDeterministicJSDocRequest,
  type TsMorphDeterministicTag,
  type TsMorphEffectChannels,
  type TsMorphEffectDecompositionRequest,
  type TsMorphExplainFunctionRequest,
  TsMorphFunctionExplanation,
  type TsMorphGraphExtractionRequest,
  type TsMorphJSDocDriftReport,
  type TsMorphJSDocValidationReport,
  TsMorphJSDocWritePlan,
  type TsMorphJSDocWriteReceipt,
  type TsMorphPlanJSDocWritesRequest,
  type TsMorphProjectContext,
  type TsMorphProjectScope,
  type TsMorphProjectScopeRequest,
  type TsMorphSearchSymbolsRequest,
  type TsMorphSymbolMatch,
  TsMorphSymbolSelector,
  TsMorphTraverseDependenciesRequest,
  type TsMorphValidateJSDocRequest,
} from "./codegraph/tsmorph/models.js";
import { createTsMorphProjectContext, resolveTsMorphProjectScope } from "./codegraph/tsmorph/project-scope.js";
import {
  buildDeclarationSignature,
  resolveDeclarationTarget,
  searchSymbolsInContext,
  traverseDependenciesInGraph,
} from "./codegraph/tsmorph/query.js";

const $I = $RepoUtilsId.create("TSMorphService");

/**
 * Public shape for ts-morph service operations.
 *
 * @since 0.0.0
 * @category models
 */
export interface TSMorphServiceShape {
  /**
   * Resolve a project scope and run an operation within a fresh project context.
   *
   * @since 0.0.0
   */
  readonly withProject: <A>(
    input: TsMorphProjectScopeRequest,
    run: (ctx: TsMorphProjectContext) => Effect.Effect<A, TsMorphServiceError>
  ) => Effect.Effect<A, TsMorphServiceError>;

  /**
   * Resolve project scope from root tsconfig + changed files.
   *
   * @since 0.0.0
   */
  readonly resolveProjectScope: (
    input: TsMorphProjectScopeRequest
  ) => Effect.Effect<TsMorphProjectScope, TsMorphServiceError>;

  /**
   * Extract a deterministic codebase graph.
   *
   * @since 0.0.0
   */
  readonly extractCodebaseGraph: (
    input: TsMorphGraphExtractionRequest
  ) => Effect.Effect<typeof CodebaseGraph.Type, TsMorphServiceError>;

  /**
   * Derive deterministic Layer-1 JSDoc tags.
   *
   * @since 0.0.0
   */
  readonly deriveDeterministicJSDoc: (
    input: TsMorphDeterministicJSDocRequest
  ) => Effect.Effect<ReadonlyArray<TsMorphDeterministicTag>, TsMorphServiceError>;

  /**
   * Decompose Effect<A, E, R> channels.
   *
   * @since 0.0.0
   */
  readonly decomposeEffectChannels: (
    input: TsMorphEffectDecompositionRequest
  ) => Effect.Effect<TsMorphEffectChannels, TsMorphServiceError>;

  /**
   * Search symbols in the scoped project.
   *
   * @since 0.0.0
   */
  readonly searchSymbols: (
    input: TsMorphSearchSymbolsRequest
  ) => Effect.Effect<ReadonlyArray<TsMorphSymbolMatch>, TsMorphServiceError>;

  /**
   * Traverse dependency relationships from a symbol.
   *
   * @since 0.0.0
   */
  readonly traverseDependencies: (
    input: TsMorphTraverseDependenciesRequest
  ) => Effect.Effect<typeof CodebaseGraph.Type, TsMorphServiceError>;

  /**
   * Explain function signature + deterministic context.
   *
   * @since 0.0.0
   */
  readonly explainFunction: (
    input: TsMorphExplainFunctionRequest
  ) => Effect.Effect<TsMorphFunctionExplanation, TsMorphServiceError>;

  /**
   * Validate JSDoc payloads before writes.
   *
   * @since 0.0.0
   */
  readonly validateJSDoc: (
    input: TsMorphValidateJSDocRequest
  ) => Effect.Effect<TsMorphJSDocValidationReport, TsMorphServiceError>;

  /**
   * Plan deterministic JSDoc writes.
   *
   * @since 0.0.0
   */
  readonly planJSDocWrites: (
    input: TsMorphPlanJSDocWritesRequest
  ) => Effect.Effect<TsMorphJSDocWritePlan, TsMorphServiceError>;

  /**
   * Apply a JSDoc write plan.
   *
   * @since 0.0.0
   */
  readonly applyJSDocWrites: (
    plan: TsMorphJSDocWritePlan
  ) => Effect.Effect<TsMorphJSDocWriteReceipt, TsMorphServiceError>;

  /**
   * Detect JSDoc drift using signature hashes.
   *
   * @since 0.0.0
   */
  readonly checkJSDocDrift: (
    input: TsMorphCheckDriftRequest
  ) => Effect.Effect<TsMorphJSDocDriftReport, TsMorphServiceError>;
}

/**
 * Service tag for `TSMorphService`.
 *
 * @since 0.0.0
 * @category services
 */
export class TSMorphService extends ServiceMap.Service<TSMorphService, TSMorphServiceShape>()($I`TSMorphService`) {}

/**
 * Live layer for `TSMorphService`.
 *
 * @since 0.0.0
 * @category layers
 */
export const TSMorphServiceLive: Layer.Layer<TSMorphService, never, FileSystem.FileSystem | Path.Path> = Layer.effect(
  TSMorphService,
  Effect.gen(function* () {
    const fileSystem = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const providePlatform = Effect.fnUntraced(function* <A, E>(
      effect: Effect.Effect<A, E, FileSystem.FileSystem | Path.Path>
    ) {
      return yield* effect.pipe(
        Effect.provideService(FileSystem.FileSystem, fileSystem),
        Effect.provideService(Path.Path, path)
      );
    });

    const resolveScope: TSMorphServiceShape["resolveProjectScope"] = Effect.fn(function* (
      input: TsMorphProjectScopeRequest
    ) {
      return yield* providePlatform(resolveTsMorphProjectScope(input));
    });

    const withProject: TSMorphServiceShape["withProject"] = Effect.fn(function* <A>(
      input: TsMorphProjectScopeRequest,
      run: (ctx: TsMorphProjectContext) => Effect.Effect<A, TsMorphServiceError>
    ) {
      const scope = yield* resolveScope(input);
      const context = yield* createTsMorphProjectContext(scope);
      return yield* providePlatform(run(context));
    });

    const extractCodebaseGraph: TSMorphServiceShape["extractCodebaseGraph"] = Effect.fn(function* (
      input: TsMorphGraphExtractionRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          const includeTests = O.getOrElse(input.includeTests, () => false);
          return yield* providePlatform(extractCodebaseGraphFromContext(context, includeTests));
        })
      );
    });

    const deriveDeterministicJSDoc: TSMorphServiceShape["deriveDeterministicJSDoc"] = Effect.fn(function* (
      input: TsMorphDeterministicJSDocRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          return yield* providePlatform(deriveDeterministicJSDocFromContext(context, input));
        })
      );
    });

    const decomposeEffectChannels: TSMorphServiceShape["decomposeEffectChannels"] = Effect.fn(function* (
      input: TsMorphEffectDecompositionRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          return yield* providePlatform(decomposeEffectChannelsFromContext(context, input));
        })
      );
    });

    const searchSymbols: TSMorphServiceShape["searchSymbols"] = Effect.fn(function* (
      input: TsMorphSearchSymbolsRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          return yield* providePlatform(searchSymbolsInContext(context, input));
        })
      );
    });

    const traverseDependencies: TSMorphServiceShape["traverseDependencies"] = Effect.fn(function* (
      input: TsMorphTraverseDependenciesRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          const graph = yield* providePlatform(extractCodebaseGraphFromContext(context, true));
          return yield* traverseDependenciesInGraph(graph, input);
        })
      );
    });

    const explainFunction: TSMorphServiceShape["explainFunction"] = Effect.fn(function* (
      input: TsMorphExplainFunctionRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          const target = yield* providePlatform(
            resolveDeclarationTarget(
              context,
              new TsMorphSymbolSelector({
                symbolId: input.symbolId,
                filePath: O.none(),
                symbolName: O.none(),
              })
            )
          );

          const deterministicTags = yield* providePlatform(
            deriveDeterministicJSDocFromContext(context, {
              scope: input.scope,
              symbol: new TsMorphSymbolSelector({
                symbolId: input.symbolId,
                filePath: O.none(),
                symbolName: O.none(),
              }),
            })
          );

          const graph = yield* providePlatform(extractCodebaseGraphFromContext(context, true));
          const localContext = yield* traverseDependenciesInGraph(
            graph,
            new TsMorphTraverseDependenciesRequest({
              scope: input.scope,
              symbolId: input.symbolId,
              direction: "downstream",
              maxHops: O.none(),
            })
          );

          return new TsMorphFunctionExplanation({
            symbolId: target.symbolId,
            signature: buildDeclarationSignature(target),
            deterministicTags,
            context: localContext,
          });
        })
      );
    });

    const validateJSDoc: TSMorphServiceShape["validateJSDoc"] = Effect.fn(function* (
      input: TsMorphValidateJSDocRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          return yield* providePlatform(validateJSDocInContext(context, input));
        })
      );
    });

    const planJSDocWrites: TSMorphServiceShape["planJSDocWrites"] = Effect.fn(function* (
      input: TsMorphPlanJSDocWritesRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          const planned = yield* providePlatform(planJSDocWritesInContext(context, input));
          return new TsMorphJSDocWritePlan({
            scope: context.scope,
            operations: planned.operations,
            conflicts: planned.conflicts,
          });
        })
      );
    });

    const applyJSDocWrites: TSMorphServiceShape["applyJSDocWrites"] = Effect.fn(function* (
      plan: TsMorphJSDocWritePlan
    ) {
      const context = yield* createTsMorphProjectContext(plan.scope);
      return yield* providePlatform(applyJSDocWritesInContext(context, plan));
    });

    const checkJSDocDrift: TSMorphServiceShape["checkJSDocDrift"] = Effect.fn(function* (
      input: TsMorphCheckDriftRequest
    ) {
      return yield* withProject(
        input.scope,
        Effect.fn(function* (context: TsMorphProjectContext) {
          return yield* providePlatform(checkJSDocDriftInContext(context, input));
        })
      );
    });

    return {
      withProject,
      resolveProjectScope: resolveScope,
      extractCodebaseGraph,
      deriveDeterministicJSDoc,
      decomposeEffectChannels,
      searchSymbols,
      traverseDependencies,
      explainFunction,
      validateJSDoc,
      planJSDocWrites,
      applyJSDocWrites,
      checkJSDocDrift,
    };
  })
);
