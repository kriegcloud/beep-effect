/**
 * AST integration contract for create-slice style workflows.
 *
 * @since 0.0.0
 * @module
 */
import type { DomainError } from "@beep/repo-utils";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import type * as O from "effect/Option";
/**
 * Supported AST mutation categories required by create-slice.
 *
 * @since 0.0.0
 * @category models
 */
export type TsMorphMutationKind =
  | "add-identity-composer"
  | "add-entity-id-export"
  | "wire-persistence"
  | "wire-data-access";

/**
 * Input descriptor for one AST mutation.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsMorphMutation {
  readonly kind: TsMorphMutationKind;
  readonly filePath: string;
  readonly symbolName: string;
  readonly importPath: O.Option<string>;
  readonly statementText: O.Option<string>;
}

/**
 * Outcome for one mutation.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsMorphMutationOutcome {
  readonly mutation: TsMorphMutation;
  readonly status: "applied" | "skipped";
  readonly detail: string;
}

/**
 * Batch mutation result.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsMorphIntegrationResult {
  readonly outcomes: ReadonlyArray<TsMorphMutationOutcome>;
}

/**
 * Adapter boundary for concrete ts-morph implementations.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsMorphMutationAdapter {
  readonly applyMutation: (mutation: TsMorphMutation) => Effect.Effect<TsMorphMutationOutcome, DomainError>;
}

/**
 * Service contract expected by create-slice orchestration.
 *
 * @since 0.0.0
 * @category models
 */
export interface TsMorphIntegrationService {
  readonly previewMutations: (mutations: ReadonlyArray<TsMorphMutation>) => ReadonlyArray<string>;
  readonly applyMutations: (
    mutations: ReadonlyArray<TsMorphMutation>
  ) => Effect.Effect<TsMorphIntegrationResult, DomainError>;
}

const UnsupportedTsMorphAdapter: TsMorphMutationAdapter = {
  applyMutation: (mutation) =>
    Effect.succeed({
      mutation,
      status: "skipped",
      detail: "No ts-morph adapter configured. Provide a TsMorphMutationAdapter before executing AST mutations.",
    }),
};

/**
 * Construct a ts-morph integration service with an optional adapter.
 *
 * @param adapter Adapter used to apply ts-morph mutations.
 * @returns Integration service for previewing and applying mutations.
 * @since 0.0.0
 * @category constructors
 */
export const createTsMorphIntegrationService = (
  adapter: TsMorphMutationAdapter = UnsupportedTsMorphAdapter
): TsMorphIntegrationService => ({
  previewMutations: A.map((mutation) => `${mutation.kind} ${mutation.symbolName} in ${mutation.filePath}`),

  applyMutations: (mutations) =>
    Effect.forEach(mutations, adapter.applyMutation).pipe(
      Effect.map((outcomes) => ({
        outcomes,
      }))
    ),
});
