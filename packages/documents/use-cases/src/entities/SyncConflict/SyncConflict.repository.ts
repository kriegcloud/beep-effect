/**
 * SyncConflict repository port.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import * as DomainSyncConflict from "@beep/documents-domain/entities/SyncConflict";
import { DmsProvider, RemoteItemId, VaultRelPath } from "@beep/documents-domain/values/Sync";
import { $DocumentsUseCasesId } from "@beep/identity/packages";
import { RowVersion } from "@beep/shared-domain/entity/EntityKit";
import * as Documents from "@beep/shared-domain/identity/Documents";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $DocumentsUseCasesId.create("entities/SyncConflict/SyncConflict.repository");

/**
 * Creation input for one remote-drift record, excluding ProductEntity audit fields.
 *
 * **Example** (Make remote-edit seed)
 *
 * ```ts
 * import { SyncConflictSeed } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const seed = SyncConflictSeed.make({
 *   conflictKind: "remoteEdit",
 *   provider: "box",
 *   remotePayload: { eventType: "ITEM_MODIFY" },
 *   resolutionStatus: "open",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(seed.conflictKind)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class SyncConflictSeed extends S.Opaque<SyncConflictSeed, { readonly brand: unique symbol }>()(
  S.Struct({
    conflictKind: DomainSyncConflict.SyncConflictKind.annotateKey({
      description: "Kind of remote drift detected for the mirrored item.",
    }),
    localRelPath: S.Option(VaultRelPath).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Vault-relative path of the affected local item; none when unmapped locally.",
    }),
    provider: DmsProvider.annotateKey({
      description: "DMS provider whose event stream reported the drift.",
    }),
    remoteEventId: S.Option(S.NonEmptyString).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Provider event identifier that surfaced the drift; none for synthetic detections.",
    }),
    remoteId: S.Option(RemoteItemId).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Provider identifier of the drifted remote item; none when the event omits it.",
    }),
    remotePayload: S.Record(S.String, S.Unknown).annotateKey({
      description: "Remote event snapshot preserved verbatim for review.",
    }),
    resolutionStatus: DomainSyncConflict.SyncConflictResolution.annotateKey({
      description: "Review status of the drift record.",
    }),
    syncItemId: S.Option(Documents.SyncItemId).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Sync-tracking row the drift maps to; none when the remote item is unknown locally.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose mirror observed the remote drift.",
    }),
  }).pipe(
    $I.annoteSchema("SyncConflictSeed", {
      description: "Creation input for one remote-drift record, excluding ProductEntity audit fields.",
    })
  )
) {}

/**
 * Persistence failure raised when a SyncConflict row is absent.
 *
 * **Example** (Construct not-found error)
 *
 * ```ts
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import { SyncConflictRepositoryNotFound } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as S from "effect/Schema"
 *
 * const error = SyncConflictRepositoryNotFound.make({
 *   conflictId: S.decodeUnknownSync(Documents.SyncConflictId)(1)
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncConflictRepositoryNotFound extends S.TaggedError<
  SyncConflictRepositoryNotFound,
  { readonly brand: unique symbol }
>($I`SyncConflictRepositoryNotFound`)(
  "SyncConflictRepositoryNotFound",
  {
    conflictId: Documents.SyncConflictId.annotateKey({
      description: "SyncConflict identity that could not be found.",
    }),
  },
  $I.annoteError<SyncConflictRepositoryNotFound>("SyncConflictRepositoryNotFound", {
    title: "SyncConflict repository not found",
    description: "The SyncConflict repository could not find the requested entity.",
  })
) {
  static readonly is = S.is(SyncConflictRepositoryNotFound);
}

/**
 * Persistence failure raised when a SyncConflict write lost an optimistic-concurrency race.
 *
 * **Details**
 *
 * `markReviewed` writes back the row version it read. The stored row moved past that version, so the write was rejected
 * instead of overwriting the newer row; re-read the SyncConflict and reapply the
 * change.
 *
 * **Example** (Construct version-conflict error)
 *
 * ```ts
 * import { SyncConflictRepositoryVersionConflict } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import { RowVersion } from "@beep/shared-domain/entity/EntityKit"
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import * as S from "effect/Schema"
 *
 * const error = SyncConflictRepositoryVersionConflict.make({
 *   actualRowVersion: RowVersion.make(3),
 *   expectedRowVersion: RowVersion.make(2),
 *   conflictId: S.decodeUnknownSync(Documents.SyncConflictId)(1)
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncConflictRepositoryVersionConflict extends S.TaggedError<
  SyncConflictRepositoryVersionConflict,
  { readonly brand: unique symbol }
>($I`SyncConflictRepositoryVersionConflict`)(
  "SyncConflictRepositoryVersionConflict",
  {
    actualRowVersion: RowVersion.annotateKey({
      description: "Row version currently stored for the SyncConflict.",
    }),
    expectedRowVersion: RowVersion.annotateKey({
      description: "Row version the rejected write expected to replace.",
    }),
    conflictId: Documents.SyncConflictId.annotateKey({
      description: "SyncConflict identity whose write was rejected.",
    }),
  },
  $I.annoteError<SyncConflictRepositoryVersionConflict>("SyncConflictRepositoryVersionConflict", {
    title: "SyncConflict repository version conflict",
    description: "Another write changed the SyncConflict after it was read; the stale review was rejected.",
  })
) {
  static readonly is = S.is(SyncConflictRepositoryVersionConflict);
}

/**
 * Persistence failure raised when the SyncConflict repository is unavailable.
 *
 * **Example** (Construct unavailable error)
 *
 * ```ts
 * import { SyncConflictRepositoryUnavailable } from "@beep/documents-use-cases/entities/SyncConflict/server"
 *
 * const error = SyncConflictRepositoryUnavailable.make({ reason: "database connection closed" })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncConflictRepositoryUnavailable extends S.TaggedError<
  SyncConflictRepositoryUnavailable,
  { readonly brand: unique symbol }
>($I`SyncConflictRepositoryUnavailable`)(
  "SyncConflictRepositoryUnavailable",
  {
    reason: S.NonEmptyString.annotateKey({
      description: "Non-empty repository availability diagnostic.",
    }),
  },
  $I.annoteError<SyncConflictRepositoryUnavailable>("SyncConflictRepositoryUnavailable", {
    title: "SyncConflict repository unavailable",
    description: "The SyncConflict repository could not serve the request.",
  })
) {
  static readonly is = S.is(SyncConflictRepositoryUnavailable);
}

/**
 * Listing input addressing the open drift records of one workspace mirror.
 *
 * **Example** (Build list-open input)
 *
 * ```ts
 * import { ListOpenSyncConflictsInput } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const input = ListOpenSyncConflictsInput.make({
 *   provider: "box",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(input.provider)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class ListOpenSyncConflictsInput extends S.Opaque<
  ListOpenSyncConflictsInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    provider: DmsProvider.annotateKey({
      description: "DMS provider whose drift records are listed.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose drift records are listed.",
    }),
  }).pipe(
    $I.annoteSchema("ListOpenSyncConflictsInput", {
      description: "Listing input addressing the open drift records of one workspace mirror.",
    })
  )
) {}

/**
 * Review input addressing one drift record by identity.
 *
 * **Example** (Build mark-reviewed input)
 *
 * ```ts
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import { MarkSyncConflictReviewedInput } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as S from "effect/Schema"
 *
 * const input = MarkSyncConflictReviewedInput.make({
 *   conflictId: S.decodeUnknownSync(Documents.SyncConflictId)(1)
 * })
 * console.log(input.conflictId)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class MarkSyncConflictReviewedInput extends S.Opaque<
  MarkSyncConflictReviewedInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    conflictId: Documents.SyncConflictId.annotateKey({
      description: "Drift record to mark as reviewed.",
    }),
  }).pipe(
    $I.annoteSchema("MarkSyncConflictReviewedInput", {
      description: "Review input addressing one drift record by identity.",
    })
  )
) {}

/**
 * SyncConflict repository port consumed by the vault sync engine.
 *
 * **Details**
 *
 * `record` deduplicates by provider event: when the seed's `remoteEventId` is
 * `Some` and a row already exists for the same `provider` and `remoteEventId`,
 * that existing row is returned unchanged instead of inserting a duplicate.
 * `markReviewed` flips the record's `resolutionStatus` to `reviewed` and fails
 * with {@link SyncConflictRepositoryVersionConflict} when another write changed
 * the record between its read and its write.
 *
 * **Example** (Stub repository shape)
 *
 * ```ts
 * import {
 *   ListOpenSyncConflictsInput,
 *   SyncConflictRepositoryUnavailable,
 *   type SyncConflictRepositoryShape
 * } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema"
 *
 * const unavailable = () => Effect.fail(SyncConflictRepositoryUnavailable.make({ reason: "stub repository" }))
 * const repository: SyncConflictRepositoryShape = {
 *   listOpen: () => Effect.succeed([]),
 *   markReviewed: unavailable,
 *   record: unavailable
 * }
 * const input = ListOpenSyncConflictsInput.make({
 *   provider: "box",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 *
 * Effect.runPromise(repository.listOpen(input)).then((conflicts) => console.log(conflicts.length))
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface SyncConflictRepositoryShape {
  readonly listOpen: (
    input: ListOpenSyncConflictsInput
  ) => Effect.Effect<ReadonlyArray<DomainSyncConflict.SyncConflict>, SyncConflictRepositoryUnavailable>;
  readonly markReviewed: (
    input: MarkSyncConflictReviewedInput
  ) => Effect.Effect<
    DomainSyncConflict.SyncConflict,
    SyncConflictRepositoryNotFound | SyncConflictRepositoryVersionConflict | SyncConflictRepositoryUnavailable
  >;
  readonly record: (
    seed: SyncConflictSeed
  ) => Effect.Effect<DomainSyncConflict.SyncConflict, SyncConflictRepositoryUnavailable>;
}

/**
 * Context tag for the SyncConflict repository port.
 *
 * **Example** (Provide repository service)
 *
 * ```ts
 * import {
 *   SyncConflictRepository,
 *   SyncConflictRepositoryUnavailable,
 *   type SyncConflictRepositoryShape
 * } from "@beep/documents-use-cases/entities/SyncConflict/server"
 * import * as Effect from "effect/Effect";
 * const unavailable = () => Effect.fail(SyncConflictRepositoryUnavailable.make({ reason: "stub repository" }))
 * const repository: SyncConflictRepositoryShape = {
 *   listOpen: () => Effect.succeed([]),
 *   markReviewed: unavailable,
 *   record: unavailable
 * }
 *
 * const program = Effect.gen(function* () {
 *   return (yield* SyncConflictRepository) === repository
 * }).pipe(Effect.provideService(SyncConflictRepository, repository))
 * console.log(Effect.runSync(program))
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class SyncConflictRepository extends Context.Service<SyncConflictRepository, SyncConflictRepositoryShape>()(
  $I`SyncConflictRepository`
) {}
