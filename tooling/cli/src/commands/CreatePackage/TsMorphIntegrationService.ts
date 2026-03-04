/**
 * AST integration contract for create-slice style workflows.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import type { DomainError } from "@beep/repo-utils";
import { LiteralKit } from "@beep/schema";
import { Effect, ServiceMap, Tuple } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/CreatePackage/TsMorphIntegrationService");

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
/**
 * Supported AST mutation categories required by create-slice.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsMorphMutationKind = typeof TsMorphMutationKind.Type;

class TsMorphMutationAddIdentityComposer extends S.Class<TsMorphMutationAddIdentityComposer>(
  $I`TsMorphMutationAddIdentityComposer`
)(
  {
    kind: S.tag("add-identity-composer"),
    filePath: S.String,
    symbolName: S.String,
    importPath: S.Option(S.String),
    statementText: S.Option(S.String),
  },
  $I.annote("TsMorphMutationAddIdentityComposer", {
    description: "Mutation descriptor for adding identity composer exports/imports.",
  })
) {}

class TsMorphMutationAddEntityIdExport extends S.Class<TsMorphMutationAddEntityIdExport>(
  $I`TsMorphMutationAddEntityIdExport`
)(
  {
    kind: S.tag("add-entity-id-export"),
    filePath: S.String,
    symbolName: S.String,
    importPath: S.Option(S.String),
    statementText: S.Option(S.String),
  },
  $I.annote("TsMorphMutationAddEntityIdExport", {
    description: "Mutation descriptor for adding entity id exports.",
  })
) {}

class TsMorphMutationWirePersistence extends S.Class<TsMorphMutationWirePersistence>(
  $I`TsMorphMutationWirePersistence`
)(
  {
    kind: S.tag("wire-persistence"),
    filePath: S.String,
    symbolName: S.String,
    importPath: S.Option(S.String),
    statementText: S.Option(S.String),
  },
  $I.annote("TsMorphMutationWirePersistence", {
    description: "Mutation descriptor for persistence wiring.",
  })
) {}

class TsMorphMutationWireDataAccess extends S.Class<TsMorphMutationWireDataAccess>($I`TsMorphMutationWireDataAccess`)(
  {
    kind: S.tag("wire-data-access"),
    filePath: S.String,
    symbolName: S.String,
    importPath: S.Option(S.String),
    statementText: S.Option(S.String),
  },
  $I.annote("TsMorphMutationWireDataAccess", {
    description: "Mutation descriptor for data-access wiring.",
  })
) {}
/**
 * Input descriptor for one AST mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TsMorphMutation = TsMorphMutationKind.mapMembers(
  Tuple.evolve([
    () => TsMorphMutationAddIdentityComposer,
    () => TsMorphMutationAddEntityIdExport,
    () => TsMorphMutationWirePersistence,
    () => TsMorphMutationWireDataAccess,
  ])
)
  .annotate(
    $I.annote("TsMorphMutationBase", {
      description: "Input descriptor for one AST mutation.",
    })
  )
  .pipe(S.toTaggedUnion("kind"));

/**
 * Input descriptor for one AST mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsMorphMutation = typeof TsMorphMutation.Type;

class TsMorphMutationOutcomeApplied extends S.Class<TsMorphMutationOutcomeApplied>($I`TsMorphMutationOutcomeApplied`)(
  {
    status: S.tag("applied"),
    mutation: TsMorphMutation,
    detail: S.String,
  },
  $I.annote("TsMorphMutationOutcomeApplied", {
    description: "Applied mutation outcome.",
  })
) {}

class TsMorphMutationOutcomeSkipped extends S.Class<TsMorphMutationOutcomeSkipped>($I`TsMorphMutationOutcomeSkipped`)(
  {
    status: S.tag("skipped"),
    mutation: TsMorphMutation,
    detail: S.String,
  },
  $I.annote("TsMorphMutationOutcomeSkipped", {
    description: "Skipped mutation outcome.",
  })
) {}

/**
 * Outcome for one mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
const TsMorphMutationOutcome = LiteralKit(["applied", "skipped"])
  .mapMembers(Tuple.evolve([() => TsMorphMutationOutcomeApplied, () => TsMorphMutationOutcomeSkipped]))
  .annotate(
    $I.annote("TsMorphMutationOutcome", {
      description: "Outcome for one mutation.",
    })
  )
  .pipe(S.toTaggedUnion("status"));

/**
 * Outcome for one mutation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
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
export type TsMorphMutationAdapter = {
  readonly applyMutation: (mutation: TsMorphMutation) => Effect.Effect<TsMorphMutationOutcome, DomainError>;
};

/**
 * Service contract expected by create-slice orchestration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TsMorphIntegrationServiceShape = {
  readonly previewMutations: (mutations: ReadonlyArray<TsMorphMutation>) => ReadonlyArray<string>;
  readonly applyMutations: (
    mutations: ReadonlyArray<TsMorphMutation>
  ) => Effect.Effect<TsMorphIntegrationResult, DomainError>;
};

/**
 * Service tag for ts-morph integration orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class TsMorphIntegrationService extends ServiceMap.Service<
  TsMorphIntegrationService,
  TsMorphIntegrationServiceShape
>()($I`TsMorphIntegrationService`) {}

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
): TsMorphIntegrationServiceShape => ({
  previewMutations: A.map((mutation) => `${mutation.kind} ${mutation.symbolName} in ${mutation.filePath}`),

  applyMutations: (mutations) =>
    Effect.forEach(mutations, adapter.applyMutation).pipe(
      Effect.map(
        (outcomes) =>
          new TsMorphIntegrationResult({
            outcomes,
          })
      )
    ),
});
