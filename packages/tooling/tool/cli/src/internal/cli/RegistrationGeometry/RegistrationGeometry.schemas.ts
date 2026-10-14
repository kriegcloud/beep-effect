/**
 * Schema-first contracts for package registration geometry.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Glob } from "@beep/schema/Glob";
import { PosixPath } from "@beep/schema/PosixPath";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Tuple from "effect/Tuple";

const $I = $RepoCliId.create("internal/cli/RegistrationGeometry");

export const RegistrationSurfaceKind = LiteralKit([
  "owned-tree",
  "workspace-literal",
  "identity-segment",
  "derived-rebuild",
  "generated-inventory",
  "authored-reference",
  "pending-changeset",
  "runtime-artifact",
  "data-resource",
  "historical-record",
]).pipe(
  $I.annoteSchema("RegistrationSurfaceKind", {
    description: "Closed kinds of package-lifecycle registration surfaces.",
  })
);
export type RegistrationSurfaceKind = typeof RegistrationSurfaceKind.Type;

export const RegistrationWriter = LiteralKit([
  "create-package",
  "identity-sync",
  "tsconfig-sync",
  "install",
  "fallow-boundaries",
  "jsdoc-inventory",
  "schema-first-inventory",
  "schema-catalog",
  "coverage-baseline-replacement",
  "test-typecheck-baseline",
  "knip-baseline",
  "docs-aggregate-clean",
  "operator-authored",
  "preserve-only",
]).pipe(
  $I.annoteSchema("RegistrationWriter", {
    description: "Named writer or preservation policy that owns a registration surface.",
  })
);
export type RegistrationWriter = typeof RegistrationWriter.Type;

export class OwnedTreeSurface extends S.Opaque<OwnedTreeSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("owned-tree"),
    id: S.NonEmptyString,
    root: PosixPath,
    artifacts: S.Array(Glob),
  }).pipe(
    $I.annoteSchema("OwnedTreeSurface", {
      description: "A target-owned directory whose tracked and ignored contents share its lifecycle.",
    })
  )
) {}

export class WorkspaceLiteralSurface extends S.Opaque<WorkspaceLiteralSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("workspace-literal"),
    id: S.NonEmptyString,
    file: PosixPath,
    workspacePath: PosixPath,
  }).pipe(
    $I.annoteSchema("WorkspaceLiteralSurface", {
      description: "An exact workspace-array member removed only when it is not a covering glob.",
    })
  )
) {}

export class IdentitySegmentSurface extends S.Opaque<IdentitySegmentSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("identity-segment"),
    id: S.NonEmptyString,
    registryFile: PosixPath,
    packageName: S.NonEmptyString,
    slug: S.NonEmptyString,
    accessor: S.NonEmptyString,
    generatedGroup: S.OptionFromOptionalKey(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("IdentitySegmentSurface", {
      description: "A package identity compose argument and its exported composer accessor.",
    })
  )
) {}

export class DerivedRebuildSurface extends S.Opaque<DerivedRebuildSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("derived-rebuild"),
    id: S.NonEmptyString,
    writer: RegistrationWriter,
    outputs: S.Array(PosixPath),
  }).pipe(
    $I.annoteSchema("DerivedRebuildSurface", {
      description: "Committed outputs replaced by a named reconstructive writer.",
    })
  )
) {}

export class GeneratedInventorySurface extends S.Opaque<GeneratedInventorySurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("generated-inventory"),
    id: S.NonEmptyString,
    writer: RegistrationWriter,
    outputs: S.Array(PosixPath),
    membershipKey: S.NonEmptyString,
  }).pipe(
    $I.annoteSchema("GeneratedInventorySurface", {
      description: "A writer-owned inventory whose target membership is derivable and probeable.",
    })
  )
) {}

export class AuthoredReferenceSurface extends S.Opaque<AuthoredReferenceSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("authored-reference"),
    id: S.NonEmptyString,
    files: S.Array(Glob),
    needles: S.Array(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("AuthoredReferenceSurface", {
      description: "An explicit target reference requiring a modeled edit or operator review.",
    })
  )
) {}

export const DeletionNotePolicy = LiteralKit(["emit-empty-note", "labs-exempt", "private-exempt"]).pipe(
  $I.annoteSchema("DeletionNotePolicy", {
    description:
      "Whether deleting this package emits the canonical `{}` deletion changeset or is ceremony-exempt by private manifest or labs path.",
  })
);
export type DeletionNotePolicy = typeof DeletionNotePolicy.Type;

export class PendingChangesetSurface extends S.Opaque<PendingChangesetSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("pending-changeset"),
    id: S.NonEmptyString,
    changesetGlob: Glob,
    retiredRegistry: PosixPath,
    packageName: S.NonEmptyString,
    deletionNotePolicy: DeletionNotePolicy,
  }).pipe(
    $I.annoteSchema("PendingChangesetSurface", {
      description: "Pending changeset keys and retired-name policy for one package name.",
    })
  )
) {}

export class RuntimeArtifactSurface extends S.Opaque<RuntimeArtifactSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("runtime-artifact"),
    id: S.NonEmptyString,
    globs: S.Array(Glob),
  }).pipe(
    $I.annoteSchema("RuntimeArtifactSurface", {
      description: "Ignored or local artifacts that must be absent after deletion.",
    })
  )
) {}

export class DataResourceSurface extends S.Opaque<DataResourceSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("data-resource"),
    id: S.NonEmptyString,
    owner: S.NonEmptyString,
    resourceName: S.NonEmptyString,
    localOnly: S.Boolean,
    destructiveConsentFlag: S.NonEmptyString,
  }).pipe(
    $I.annoteSchema("DataResourceSurface", {
      description: "Manifest-owned destructive state requiring ownership proof and explicit consent.",
    })
  )
) {}

export class HistoricalRecordSurface extends S.Opaque<HistoricalRecordSurface, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: S.tag("historical-record"),
    id: S.NonEmptyString,
    files: S.Array(Glob),
    needles: S.Array(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("HistoricalRecordSurface", {
      description: "Historical evidence classified and preserved rather than pruned.",
    })
  )
) {}

export const RegistrationSurface = RegistrationSurfaceKind.mapMembers(
  Tuple.evolve([
    () => OwnedTreeSurface,
    () => WorkspaceLiteralSurface,
    () => IdentitySegmentSurface,
    () => DerivedRebuildSurface,
    () => GeneratedInventorySurface,
    () => AuthoredReferenceSurface,
    () => PendingChangesetSurface,
    () => RuntimeArtifactSurface,
    () => DataResourceSurface,
    () => HistoricalRecordSurface,
  ])
).pipe(
  S.toTaggedUnion("kind"),
  $I.annoteSchema("RegistrationSurface", {
    description: "One declared registration surface interpreted by create, delete, and doctor.",
  })
);
export type RegistrationSurface = typeof RegistrationSurface.Type;

export class LabTargetFacts extends S.Opaque<LabTargetFacts, { readonly brand: unique symbol }>()(
  S.Struct({
    manifestFile: PosixPath,
    postgresSchema: S.OptionFromOptionalKey(S.NonEmptyString),
    localOnly: S.Boolean,
  }).pipe(
    $I.annoteSchema("LabTargetFacts", {
      description: "Decoded lab-manifest facts (manifest path, optional Postgres schema, locality) for a labs target.",
    })
  )
) {}

export class RegistrationTarget extends S.Opaque<RegistrationTarget, { readonly brand: unique symbol }>()(
  S.Struct({
    packageName: S.NonEmptyString,
    packagePath: PosixPath,
    private: S.Boolean,
    lab: S.OptionFromOptionalKey(LabTargetFacts).pipe(S.withConstructorDefault(Effect.succeedNone)),
  }).pipe(
    $I.annoteSchema("RegistrationTarget", {
      description: "Resolved workspace identity used to instantiate registration geometry.",
    })
  )
) {}

export const RegistrationOperationKind = LiteralKit(["write", "remove", "rebuild", "preserve", "require-consent"]).pipe(
  $I.annoteSchema("RegistrationOperationKind", {
    description: "Closed operation kinds emitted by a registration plan.",
  })
);
export type RegistrationOperationKind = typeof RegistrationOperationKind.Type;

export class RegistrationOperation extends S.Opaque<RegistrationOperation, { readonly brand: unique symbol }>()(
  S.Struct({
    surfaceId: S.NonEmptyString,
    operation: RegistrationOperationKind,
    detail: S.NonEmptyString,
  }).pipe(
    $I.annoteSchema("RegistrationOperation", {
      description: "One deterministic forward or inverse operation derived from a surface.",
    })
  )
) {}

export class RegistrationPlan extends S.Opaque<RegistrationPlan, { readonly brand: unique symbol }>()(
  S.Struct({
    version: S.Literal("registration-plan/v1"),
    target: RegistrationTarget,
    operations: S.Array(RegistrationOperation),
  }).pipe(
    $I.annoteSchema("RegistrationPlan", {
      description: "Serializable package registration plan produced before any mutation.",
    })
  )
) {}

export const RegistrationObservationStatus = LiteralKit([
  "clean",
  "missing",
  "residue",
  "drift",
  "historical",
  "consent-required",
]).pipe(
  $I.annoteSchema("RegistrationObservationStatus", {
    description: "Doctor status for one declared surface.",
  })
);
export type RegistrationObservationStatus = typeof RegistrationObservationStatus.Type;

export class RegistrationObservation extends S.Opaque<RegistrationObservation, { readonly brand: unique symbol }>()(
  S.Struct({
    surfaceId: S.NonEmptyString,
    status: RegistrationObservationStatus,
    evidence: S.Array(S.NonEmptyString),
  }).pipe(
    $I.annoteSchema("RegistrationObservation", {
      description: "Declared-versus-actual result for one registration surface.",
    })
  )
) {}

export const DependentHitKind = LiteralKit([
  "manifest-prod",
  "manifest-dev",
  "manifest-peer",
  "manifest-optional",
  "import-prod",
  "import-test",
  "script",
  "file-path",
  "packet",
  "baseline",
  "historical-doc",
]).pipe(
  $I.annoteSchema("DependentHitKind", {
    description: "Classification of one reverse-dependency or residue hit.",
  })
);
export type DependentHitKind = typeof DependentHitKind.Type;

export class DependentHit extends S.Opaque<DependentHit, { readonly brand: unique symbol }>()(
  S.Struct({
    kind: DependentHitKind,
    owner: S.NonEmptyString,
    file: PosixPath,
    line: S.OptionFromOptionalKey(S.Int),
    direct: S.Boolean,
  }).pipe(
    $I.annoteSchema("DependentHit", {
      description: "One classified manifest, import, path, packet, baseline, or historical hit.",
    })
  )
) {}

export class DependentsReport extends S.Opaque<DependentsReport, { readonly brand: unique symbol }>()(
  S.Struct({
    target: RegistrationTarget,
    directWorkspaceDependents: S.Array(S.NonEmptyString),
    transitiveWorkspaceDependents: S.Array(S.NonEmptyString),
    hits: S.Array(DependentHit),
  }).pipe(
    $I.annoteSchema("DependentsReport", {
      description: "Deterministic reverse-dependency closure plus import and authored-reference evidence.",
    })
  )
) {}
