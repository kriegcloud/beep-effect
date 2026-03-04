/**
 * AST integration contract for create-slice style workflows.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import type { DomainError } from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { Effect, Tuple } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("create-package/ts-morph-integration-service");

/**
 * Supported AST mutation categories required by create-slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsMorphMutationKind = LiteralKit([
  "add-identity-composer",
  "add-entity-id-export",
  "wire-persistence",
  "wire-data-access",
]).annotate(
  $I.annote("TsMorphMutationKind", {
    description: "Supported AST mutation categories required by create-slice.",
  })
);
export type TsMorphMutationKind = typeof TsMorphMutationKind.Type;

const makeMutationKind = <Kind extends TsMorphMutationKind>(
  kind: S.Literal<Kind>
): S.Struct<{
  readonly kind: S.tag<Kind>;
  readonly filePath: S.String;
  readonly symbolName: S.String;
  readonly importPath: S.Option<S.String>;
  readonly statementText: S.Option<S.String>;
}> =>
  S.Struct({
    kind: S.tag(kind.literal),
    filePath: S.String,
    symbolName: S.String,
    importPath: S.Option(S.String),
    statementText: S.Option(S.String),
  });
/**
 * Input descriptor for one AST mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsMorphMutation = TsMorphMutationKind.mapMembers(
  Tuple.evolve([makeMutationKind, makeMutationKind, makeMutationKind, makeMutationKind])
)
  .pipe(S.toTaggedUnion("kind"))
  .annotate(
    $I.annote("TsMorphMutationBase", {
      description: "Input descriptor for one AST mutation.",
    })
  );

export type TsMorphMutation = typeof TsMorphMutation.Type;

const makeOutcome = <T extends "applied" | "skipped">(self: S.Literal<T>) =>
  S.Struct({
    status: S.tag(self.literal),
    mutation: TsMorphMutation,
    detail: S.String,
  });

/**
 * Outcome for one mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const TsMorphMutationOutcome = LiteralKit(["applied", "skipped"])
  .mapMembers(Tuple.evolve([makeOutcome, makeOutcome]))
  .pipe(S.toTaggedUnion("status"))
  .annotate(
    $I.annote("TsMorphMutationOutcome", {
      description: "Outcome for one mutation.",
    })
  );

export type TsMorphMutationOutcome = typeof TsMorphMutationOutcome.Type;

/**
 * Batch mutation result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TsMorphIntegrationResult extends S.Class<TsMorphIntegrationResult>($I`TsMorphIntegrationResult`)(
  {
    outcomes: S.Array(TsMorphMutationOutcome),
  },
  $I.annote("TsMorphIntegrationResult", {
    description: "Batch mutation result.",
  })
) {}

/**
 * Adapter boundary for concrete ts-morph-morph implementations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface TsMorphMutationAdapter {
  readonly applyMutation: (mutation: TsMorphMutation) => Effect.Effect<TsMorphMutationOutcome, DomainError>;
}

/**
 * Service contract expected by create-slice orchestration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface TsMorphIntegrationService {
  readonly previewMutations: (mutations: ReadonlyArray<TsMorphMutation>) => ReadonlyArray<string>;
  readonly applyMutations: (
    mutations: ReadonlyArray<TsMorphMutation>
  ) => Effect.Effect<TsMorphIntegrationResult, DomainError>;
}

const UnsupportedTsMorphAdapter: TsMorphMutationAdapter = {
  applyMutation: (mutation) =>
    Effect.succeed(
      TsMorphMutationOutcome.cases.skipped.makeUnsafe({
        mutation,
        detail:
          "No ts-morph-morph adapter configured. Provide a TsMorphMutationAdapter before executing AST mutations.",
      })
    ),
};

/**
 * Construct a ts-morph-morph integration service with an optional adapter.
 *
 * @param adapter Adapter used to apply ts-morph-morph mutations.
 * @returns Integration service for previewing and applying mutations.
 * @since 0.0.0
 * @category DomainModel
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
