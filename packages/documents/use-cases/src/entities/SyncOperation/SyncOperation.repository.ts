/**
 * SyncOperation repository port.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { DocumentContentDigest } from "@beep/documents-domain/aggregates/Document";
import * as DomainSyncOperation from "@beep/documents-domain/entities/SyncOperation";
import { DmsProvider, VaultRelPath } from "@beep/documents-domain/values/Sync";
import { $DocumentsUseCasesId } from "@beep/identity/packages";
import { RowVersion } from "@beep/shared-domain/entity/EntityKit";
import * as Documents from "@beep/shared-domain/identity/Documents";
import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const $I = $DocumentsUseCasesId.create("entities/SyncOperation/SyncOperation.repository");

/**
 * Creation input for one push-outbox operation, excluding ProductEntity audit fields.
 *
 * **Example** (Make uploadFile seed)
 *
 * ```ts
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import { VaultRelPath } from "@beep/documents-domain/values/Sync"
 * import { SyncOperationSeed } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const seed = SyncOperationSeed.make({
 *   attemptCount: S.decodeUnknownSync(S.Natural)(0),
 *   idempotencyKey: "sync-item-1:uploadFile:1",
 *   inputGeneration: S.decodeUnknownSync(S.Natural)(1),
 *   operationType: "uploadFile",
 *   provider: "box",
 *   status: "queued",
 *   syncItemId: S.decodeUnknownSync(Documents.SyncItemId)(1),
 *   targetName: "complaint.pdf",
 *   targetRelPath: S.decodeUnknownSync(VaultRelPath)("matters/client-default/complaint.pdf"),
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(seed.idempotencyKey)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class SyncOperationSeed extends S.Opaque<SyncOperationSeed, { readonly brand: unique symbol }>()(
  S.Struct({
    attemptCount: S.Natural.annotateKey({
      description: "Number of push attempts already made for this operation.",
    }),
    idempotencyKey: S.NonEmptyString.annotateKey({
      description: "Unique key deduplicating replays of the same push operation.",
    }),
    inputContentDigest: S.Option(DocumentContentDigest).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Digest of the local content captured when the operation was queued; none for folders.",
    }),
    inputGeneration: S.Natural.annotateKey({
      description: "Local generation counter captured when the operation was queued.",
    }),
    lastError: S.Option(S.NonEmptyString).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Most recent attempt failure message; none while the operation is healthy.",
    }),
    operationType: DomainSyncOperation.SyncOperationType.annotateKey({
      description: "Kind of push performed against the DMS mirror.",
    }),
    provider: DmsProvider.annotateKey({
      description: "DMS provider targeted by the push operation.",
    }),
    status: DomainSyncOperation.SyncOperationStatus.annotateKey({
      description: "Outbox lifecycle status of the operation.",
    }),
    syncItemId: Documents.SyncItemId.annotateKey({
      description: "Sync-tracking row this operation pushes for.",
    }),
    targetName: S.NonEmptyString.annotateKey({
      description: "Remote item name to apply with this operation.",
    }),
    targetParentRelPath: S.Option(VaultRelPath).pipe(S.withConstructorDefault(Effect.succeedNone)).annotateKey({
      description: "Vault-relative path of the intended remote parent folder; none targets the mirror root.",
    }),
    targetRelPath: VaultRelPath.annotateKey({
      description: "Intended vault-relative path of the item after this operation.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose vault produced the push operation.",
    }),
  }).pipe(
    $I.annoteSchema("SyncOperationSeed", {
      description: "Creation input for one push-outbox operation, excluding ProductEntity audit fields.",
    })
  )
) {}

/**
 * Persistence failure raised when an enqueue replays an existing idempotency key.
 *
 * **Example** (Construct conflict error)
 *
 * ```ts
 * import { SyncOperationRepositoryConflict } from "@beep/documents-use-cases/entities/SyncOperation/server"
 *
 * const error = SyncOperationRepositoryConflict.make({
 *   idempotencyKey: "sync-item-1:uploadFile:1",
 *   reason: "operation already enqueued for key"
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncOperationRepositoryConflict extends S.TaggedError<
  SyncOperationRepositoryConflict,
  { readonly brand: unique symbol }
>($I`SyncOperationRepositoryConflict`)(
  "SyncOperationRepositoryConflict",
  {
    idempotencyKey: S.NonEmptyString.annotateKey({
      description: "Idempotency key that already has an enqueued operation.",
    }),
    reason: S.NonEmptyString.annotateKey({
      description: "Non-empty repository conflict diagnostic.",
    }),
  },
  $I.annoteError<SyncOperationRepositoryConflict>("SyncOperationRepositoryConflict", {
    title: "SyncOperation repository conflict",
    description: "The SyncOperation repository rejected a duplicate idempotency key.",
  })
) {
  static readonly is = S.is(SyncOperationRepositoryConflict);
}

/**
 * Persistence failure raised when a SyncOperation row is absent.
 *
 * **Example** (Construct not-found error)
 *
 * ```ts
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import { SyncOperationRepositoryNotFound } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as S from "effect/Schema"
 *
 * const error = SyncOperationRepositoryNotFound.make({
 *   syncOperationId: S.decodeUnknownSync(Documents.SyncOperationId)(1)
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncOperationRepositoryNotFound extends S.TaggedError<
  SyncOperationRepositoryNotFound,
  { readonly brand: unique symbol }
>($I`SyncOperationRepositoryNotFound`)(
  "SyncOperationRepositoryNotFound",
  {
    syncOperationId: Documents.SyncOperationId.annotateKey({
      description: "SyncOperation identity that could not be found.",
    }),
  },
  $I.annoteError<SyncOperationRepositoryNotFound>("SyncOperationRepositoryNotFound", {
    title: "SyncOperation repository not found",
    description: "The SyncOperation repository could not find the requested entity.",
  })
) {
  static readonly is = S.is(SyncOperationRepositoryNotFound);
}

/**
 * Persistence failure raised when a SyncOperation write lost an optimistic-concurrency race.
 *
 * **Details**
 *
 * `update` treats the entity's `rowVersion` as the version it was read at. The stored row moved past that version, so the write was rejected
 * instead of overwriting the newer row; re-read the SyncOperation and reapply the
 * change.
 *
 * **Example** (Construct version-conflict error)
 *
 * ```ts
 * import { SyncOperationRepositoryVersionConflict } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import { RowVersion } from "@beep/shared-domain/entity/EntityKit"
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import * as S from "effect/Schema"
 *
 * const error = SyncOperationRepositoryVersionConflict.make({
 *   actualRowVersion: RowVersion.make(3),
 *   expectedRowVersion: RowVersion.make(2),
 *   syncOperationId: S.decodeUnknownSync(Documents.SyncOperationId)(1)
 * })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncOperationRepositoryVersionConflict extends S.TaggedError<
  SyncOperationRepositoryVersionConflict,
  { readonly brand: unique symbol }
>($I`SyncOperationRepositoryVersionConflict`)(
  "SyncOperationRepositoryVersionConflict",
  {
    actualRowVersion: RowVersion.annotateKey({
      description: "Row version currently stored for the SyncOperation.",
    }),
    expectedRowVersion: RowVersion.annotateKey({
      description: "Row version the rejected write expected to replace.",
    }),
    syncOperationId: Documents.SyncOperationId.annotateKey({
      description: "SyncOperation identity whose write was rejected.",
    }),
  },
  $I.annoteError<SyncOperationRepositoryVersionConflict>("SyncOperationRepositoryVersionConflict", {
    title: "SyncOperation repository version conflict",
    description: "Another write changed the SyncOperation after it was read; the stale update was rejected.",
  })
) {
  static readonly is = S.is(SyncOperationRepositoryVersionConflict);
}

/**
 * Persistence failure raised when the SyncOperation repository is unavailable.
 *
 * **Example** (Construct unavailable error)
 *
 * ```ts
 * import { SyncOperationRepositoryUnavailable } from "@beep/documents-use-cases/entities/SyncOperation/server"
 *
 * const error = SyncOperationRepositoryUnavailable.make({ reason: "database connection closed" })
 * console.log(error._tag)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SyncOperationRepositoryUnavailable extends S.TaggedError<
  SyncOperationRepositoryUnavailable,
  { readonly brand: unique symbol }
>($I`SyncOperationRepositoryUnavailable`)(
  "SyncOperationRepositoryUnavailable",
  {
    reason: S.NonEmptyString.annotateKey({
      description: "Non-empty repository availability diagnostic.",
    }),
  },
  $I.annoteError<SyncOperationRepositoryUnavailable>("SyncOperationRepositoryUnavailable", {
    title: "SyncOperation repository unavailable",
    description: "The SyncOperation repository could not serve the request.",
  })
) {}

/**
 * Listing input addressing the queued operations of one workspace mirror.
 *
 * **Example** (Build list-queued input)
 *
 * ```ts
 * import { ListQueuedSyncOperationsInput } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const input = ListQueuedSyncOperationsInput.make({
 *   provider: "box",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(input.provider)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class ListQueuedSyncOperationsInput extends S.Opaque<
  ListQueuedSyncOperationsInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    provider: DmsProvider.annotateKey({
      description: "DMS provider whose outbox is listed.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose outbox is listed.",
    }),
  }).pipe(
    $I.annoteSchema("ListQueuedSyncOperationsInput", {
      description: "Listing input addressing the queued operations of one workspace mirror.",
    })
  )
) {}

/**
 * Listing input addressing the queued operations of one sync-tracking row.
 *
 * **Example** (Build list-for-item input)
 *
 * ```ts
 * import * as Documents from "@beep/shared-domain/identity/Documents"
 * import { ListQueuedSyncOperationsForItemInput } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const input = ListQueuedSyncOperationsForItemInput.make({
 *   syncItemId: S.decodeUnknownSync(Documents.SyncItemId)(1),
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(input.syncItemId)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class ListQueuedSyncOperationsForItemInput extends S.Opaque<
  ListQueuedSyncOperationsForItemInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    syncItemId: Documents.SyncItemId.annotateKey({
      description: "Sync-tracking row whose queued operations are listed.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose outbox is listed.",
    }),
  }).pipe(
    $I.annoteSchema("ListQueuedSyncOperationsForItemInput", {
      description: "Listing input addressing the queued operations of one sync-tracking row.",
    })
  )
) {}

/**
 * Recovery input addressing the leased operations of one workspace mirror.
 *
 * **Example** (Build requeue-leased input)
 *
 * ```ts
 * import { RequeueLeasedSyncOperationsInput } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const input = RequeueLeasedSyncOperationsInput.make({
 *   provider: "box",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(input.provider)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class RequeueLeasedSyncOperationsInput extends S.Opaque<
  RequeueLeasedSyncOperationsInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    provider: DmsProvider.annotateKey({
      description: "DMS provider whose leased operations are requeued.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose leased operations are requeued.",
    }),
  }).pipe(
    $I.annoteSchema("RequeueLeasedSyncOperationsInput", {
      description: "Recovery input addressing the leased operations of one workspace mirror.",
    })
  )
) {}

/**
 * Listing input addressing the operations of one workspace mirror by status.
 *
 * **Example** (Build list-by-status input)
 *
 * ```ts
 * import { ListSyncOperationsByStatusInput } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as S from "effect/Schema"
 *
 * const input = ListSyncOperationsByStatusInput.make({
 *   provider: "box",
 *   status: "failed",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 * console.log(input.status)
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class ListSyncOperationsByStatusInput extends S.Opaque<
  ListSyncOperationsByStatusInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    provider: DmsProvider.annotateKey({
      description: "DMS provider whose outbox is listed.",
    }),
    status: DomainSyncOperation.SyncOperationStatus.annotateKey({
      description: "Outbox lifecycle status selecting the listed operations.",
    }),
    workspaceId: WorkspaceIdentity.WorkspaceId.annotateKey({
      description: "Workspace whose outbox is listed.",
    }),
  }).pipe(
    $I.annoteSchema("ListSyncOperationsByStatusInput", {
      description: "Listing input addressing the operations of one workspace mirror by status.",
    })
  )
) {}

/**
 * SyncOperation repository port consumed by the vault sync engine.
 *
 * **Details**
 *
 * `enqueue` fails with {@link SyncOperationRepositoryConflict} when the seed's
 * `idempotencyKey` is already enqueued. `listQueued` and `listQueuedForItem`
 * return queued operations in FIFO order (ascending entity id). `requeueLeased`
 * is boot recovery: it flips every `leased` operation of the workspace mirror
 * back to `queued`, advances each one's `rowVersion`, and returns the number of
 * operations it requeued. `update` persists a full entity only while the stored
 * `rowVersion` still equals the entity's and returns the stored entity; it fails
 * with {@link SyncOperationRepositoryVersionConflict} when another write (such
 * as a requeue) moved the row past that version.
 *
 * **Example** (Stub repository implementation)
 *
 * ```ts
 * import {
 *   ListQueuedSyncOperationsInput,
 *   SyncOperationRepositoryUnavailable,
 *   type SyncOperationRepositoryShape
 * } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace"
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema"
 *
 * const repository: SyncOperationRepositoryShape = {
 *   enqueue: () => Effect.fail(SyncOperationRepositoryUnavailable.make({ reason: "stub repository" })),
 *   listByStatus: () => Effect.succeed([]),
 *   listQueued: () => Effect.succeed([]),
 *   listQueuedForItem: () => Effect.succeed([]),
 *   requeueLeased: () => Effect.succeed(0),
 *   update: (operation) => Effect.succeed(operation)
 * }
 * const input = ListQueuedSyncOperationsInput.make({
 *   provider: "box",
 *   workspaceId: S.decodeUnknownSync(WorkspaceIdentity.WorkspaceId)(1)
 * })
 *
 * Effect.runPromise(repository.listQueued(input)).then((operations) => console.log(operations.length))
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export interface SyncOperationRepositoryShape {
  readonly enqueue: (
    seed: SyncOperationSeed
  ) => Effect.Effect<
    DomainSyncOperation.SyncOperation,
    SyncOperationRepositoryConflict | SyncOperationRepositoryUnavailable
  >;
  readonly listByStatus: (
    input: ListSyncOperationsByStatusInput
  ) => Effect.Effect<ReadonlyArray<DomainSyncOperation.SyncOperation>, SyncOperationRepositoryUnavailable>;
  readonly listQueued: (
    input: ListQueuedSyncOperationsInput
  ) => Effect.Effect<ReadonlyArray<DomainSyncOperation.SyncOperation>, SyncOperationRepositoryUnavailable>;
  readonly listQueuedForItem: (
    input: ListQueuedSyncOperationsForItemInput
  ) => Effect.Effect<ReadonlyArray<DomainSyncOperation.SyncOperation>, SyncOperationRepositoryUnavailable>;
  readonly requeueLeased: (
    input: RequeueLeasedSyncOperationsInput
  ) => Effect.Effect<number, SyncOperationRepositoryUnavailable>;
  readonly update: (
    operation: DomainSyncOperation.SyncOperation
  ) => Effect.Effect<
    DomainSyncOperation.SyncOperation,
    SyncOperationRepositoryNotFound | SyncOperationRepositoryVersionConflict | SyncOperationRepositoryUnavailable
  >;
}

/**
 * Context tag for the SyncOperation repository port.
 *
 * **Example** (Provide repository context)
 *
 * ```ts
 * import {
 *   SyncOperationRepository,
 *   SyncOperationRepositoryUnavailable,
 *   type SyncOperationRepositoryShape
 * } from "@beep/documents-use-cases/entities/SyncOperation/server"
 * import * as Effect from "effect/Effect";
 * const repository: SyncOperationRepositoryShape = {
 *   enqueue: () => Effect.fail(SyncOperationRepositoryUnavailable.make({ reason: "stub repository" })),
 *   listByStatus: () => Effect.succeed([]),
 *   listQueued: () => Effect.succeed([]),
 *   listQueuedForItem: () => Effect.succeed([]),
 *   requeueLeased: () => Effect.succeed(0),
 *   update: (operation) => Effect.succeed(operation)
 * }
 *
 * const program = Effect.gen(function* () {
 *   return (yield* SyncOperationRepository) === repository
 * }).pipe(Effect.provideService(SyncOperationRepository, repository))
 * console.log(Effect.runSync(program))
 * ```
 *
 * @category repositories
 * @since 0.0.0
 */
export class SyncOperationRepository extends Context.Service<SyncOperationRepository, SyncOperationRepositoryShape>()(
  $I`SyncOperationRepository`
) {}
