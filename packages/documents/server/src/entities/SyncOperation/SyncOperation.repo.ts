/**
 * SyncOperation repository adapters.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import * as DomainSyncOperation from "@beep/documents-domain/entities/SyncOperation";
import {
  fromSyncOperationRow,
  SYNC_OPERATION_TABLE_NAME,
  syncOperationTable,
  toSyncOperationInsert,
} from "@beep/documents-tables/entities/SyncOperation";
import {
  SyncOperationRepository,
  SyncOperationRepositoryConflict,
  SyncOperationRepositoryNotFound,
  SyncOperationRepositoryUnavailable,
  SyncOperationRepositoryVersionConflict,
} from "@beep/documents-use-cases/entities/SyncOperation/server";
import { extractPostgresDiagnostics, PostgresDrizzle, PostgresErrorCodeByName } from "@beep/postgres";
import { nextRowVersion } from "@beep/shared-domain/entity/EntityKit";
import * as DocumentsIdentity from "@beep/shared-domain/identity/Documents";
import { A, N } from "@beep/utils";
import { and, asc, eq, sql } from "drizzle-orm";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Ref from "effect/Ref";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  byIdAscending,
  makeEntityStore,
  nextEntityId,
  replaceVersioned,
  SYSTEM_PRINCIPAL,
} from "../internal/RepoSupport.ts";
import type { DmsProvider } from "@beep/documents-domain/values/Sync";
import type { SyncOperationSeed } from "@beep/documents-use-cases/entities/SyncOperation/server";
import type { RowVersion } from "@beep/shared-domain/entity/EntityKit";
import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";

const decodeSyncOperation = S.decodeUnknownEffect(DomainSyncOperation.SyncOperation);

/**
 * Build a full SyncOperation entity from an enqueue seed and an assigned id.
 *
 * ProductEntity audit fields mirror the repository's application-write
 * posture: system principal audit fields, epoch timestamps, and a
 * sequence-shaped public id derived from the table name.
 */
const syncOperationFromSeed = Effect.fn("Documents.SyncOperationRepository.fromSeed")(
  (id: number, seed: SyncOperationSeed) =>
    decodeSyncOperation({
      attemptCount: seed.attemptCount,
      createdAt: 0,
      createdByPrincipal: SYSTEM_PRINCIPAL,
      entityType: DocumentsIdentity.SyncOperationId.entityType,
      id,
      idempotencyKey: seed.idempotencyKey,
      inputContentDigest: O.getOrNull(seed.inputContentDigest),
      inputGeneration: seed.inputGeneration,
      lastError: O.getOrNull(seed.lastError),
      operationType: seed.operationType,
      orgId: 1,
      provider: seed.provider,
      publicId: `${SYNC_OPERATION_TABLE_NAME}_a${id}`,
      rowVersion: 1,
      schemaVersion: "0.1.0",
      source: "Application",
      status: seed.status,
      syncItemId: seed.syncItemId,
      targetName: seed.targetName,
      targetParentRelPath: O.getOrNull(seed.targetParentRelPath),
      targetRelPath: seed.targetRelPath,
      updatedAt: 0,
      updatedByPrincipal: SYSTEM_PRINCIPAL,
      workspaceId: seed.workspaceId,
    }).pipe(repositoryUnavailable("construct SyncOperation"))
);

type MirrorScope = {
  readonly provider: DmsProvider;
  readonly workspaceId: WorkspaceIdentity.WorkspaceId;
};

const matchesMirror = (input: MirrorScope) => (operation: DomainSyncOperation.SyncOperation) =>
  operation.workspaceId === input.workspaceId && operation.provider === input.provider;

const versionConflict = (operation: DomainSyncOperation.SyncOperation, actualRowVersion: RowVersion) =>
  SyncOperationRepositoryVersionConflict.make({
    actualRowVersion,
    expectedRowVersion: operation.rowVersion,
    syncOperationId: operation.id,
  });

const duplicateIdempotencyKeyConflict = (idempotencyKey: string): SyncOperationRepositoryConflict =>
  SyncOperationRepositoryConflict.make({
    idempotencyKey,
    reason: `${SYNC_OPERATION_TABLE_NAME} already contains idempotency key ${idempotencyKey}`,
  });

/**
 * Build the in-memory SyncOperation repository used by deterministic sync tests.
 *
 * **Details**
 *
 * Queued listings are FIFO: ascending entity id equals enqueue order.
 *
 * **Example** (In-memory repository factory)
 *
 * ```ts
 * import { makeInMemorySyncOperationRepository } from "@beep/documents-server/entities/SyncOperation"
 *
 * console.log(makeInMemorySyncOperationRepository)
 * ```
 *
 * @effects Allocates an in-memory `Ref` store plus an id counter and mutates
 * that process-local state for enqueue, update, requeue, and list repository
 * calls.
 * @category repositories
 * @since 0.0.0
 */
export const makeInMemorySyncOperationRepository = Effect.fn("Documents.SyncOperationRepository.makeInMemory")(
  function* () {
    const { counter, snapshot, store } = yield* makeEntityStore(
      HashMap.empty<DocumentsIdentity.SyncOperationId, DomainSyncOperation.SyncOperation>()
    );

    return SyncOperationRepository.of({
      enqueue: Effect.fn("Documents.SyncOperationRepository.enqueue")(function* (seed) {
        const operations = yield* snapshot;
        if (A.some(operations, (operation) => operation.idempotencyKey === seed.idempotencyKey)) {
          return yield* duplicateIdempotencyKeyConflict(seed.idempotencyKey);
        }
        const id = yield* Ref.getAndUpdate(counter, N.increment);
        const operation = yield* syncOperationFromSeed(id, seed);
        yield* Ref.update(store, HashMap.set(operation.id, operation));
        return operation;
      }),
      listByStatus: Effect.fn("Documents.SyncOperationRepository.listByStatus")(function* (input) {
        const operations = yield* snapshot;
        return pipe(
          operations,
          A.filter((operation) => matchesMirror(input)(operation) && operation.status === input.status),
          A.sort(byIdAscending<DomainSyncOperation.SyncOperation>())
        );
      }),
      listQueued: Effect.fn("Documents.SyncOperationRepository.listQueued")(function* (input) {
        const operations = yield* snapshot;
        return pipe(
          operations,
          A.filter(
            (operation) =>
              matchesMirror(input)(operation) && DomainSyncOperation.SyncOperationStatus.is.queued(operation.status)
          ),
          A.sort(byIdAscending<DomainSyncOperation.SyncOperation>())
        );
      }),
      listQueuedForItem: Effect.fn("Documents.SyncOperationRepository.listQueuedForItem")(function* (input) {
        const operations = yield* snapshot;
        return pipe(
          operations,
          A.filter(
            (operation) =>
              operation.workspaceId === input.workspaceId &&
              operation.syncItemId === input.syncItemId &&
              DomainSyncOperation.SyncOperationStatus.is.queued(operation.status)
          ),
          A.sort(byIdAscending<DomainSyncOperation.SyncOperation>())
        );
      }),
      requeueLeased: Effect.fn("Documents.SyncOperationRepository.requeueLeased")(function* (input) {
        return yield* Ref.modify(store, (current) => {
          const requeued = pipe(
            A.fromIterable(HashMap.values(current)),
            A.filter(
              (operation) =>
                matchesMirror(input)(operation) && DomainSyncOperation.SyncOperationStatus.is.leased(operation.status)
            ),
            A.map((operation) =>
              DomainSyncOperation.SyncOperation.make({
                ...operation,
                rowVersion: nextRowVersion(operation.rowVersion),
                status: "queued",
              })
            )
          );
          const next = A.reduce(requeued, current, (map, operation) => HashMap.set(map, operation.id, operation));
          return [A.length(requeued), next];
        });
      }),
      update: Effect.fn("Documents.SyncOperationRepository.update")(function* (operation) {
        return yield* replaceVersioned(store, {
          replacement: operation,
          withRowVersion: (entity, rowVersion) => DomainSyncOperation.SyncOperation.make({ ...entity, rowVersion }),
          onMissing: () => SyncOperationRepositoryNotFound.make({ syncOperationId: operation.id }),
          onStale: (actualRowVersion) => versionConflict(operation, actualRowVersion),
        });
      }),
    });
  }
);

const repositoryUnavailable =
  (operation: string) =>
  <A2, E, R>(effect: Effect.Effect<A2, E, R>): Effect.Effect<A2, SyncOperationRepositoryUnavailable, R> =>
    effect.pipe(
      Effect.tapError((cause) =>
        Effect.logDebug("Documents SyncOperation repository adapter dropped driver failure").pipe(
          Effect.annotateLogs({ operation, table: SYNC_OPERATION_TABLE_NAME, cause })
        )
      ),
      Effect.mapError(() =>
        SyncOperationRepositoryUnavailable.make({
          reason: `${operation} failed against ${SYNC_OPERATION_TABLE_NAME}`,
        })
      )
    );

const containsText =
  (search: string) =>
  (text: string | undefined): boolean =>
    P.isString(text) && pipe(text, Str.includes(search));

const mentionsIdempotencyKey = containsText("idempotency_key");

const isIdempotencyKeyViolation = (cause: unknown): boolean => {
  const diagnostics = extractPostgresDiagnostics(cause);
  const isUniqueViolation =
    O.exists(diagnostics.sqlState, (code) => code === PostgresErrorCodeByName.UNIQUE_VIOLATION) ||
    O.exists(diagnostics.message, containsText("duplicate key value"));
  return (
    isUniqueViolation &&
    A.some([diagnostics.constraintName, diagnostics.message, diagnostics.detail], O.exists(mentionsIdempotencyKey))
  );
};

const translateEnqueueFailure =
  (idempotencyKey: string) =>
  <A2, E, R>(
    effect: Effect.Effect<A2, E, R>
  ): Effect.Effect<A2, SyncOperationRepositoryConflict | SyncOperationRepositoryUnavailable, R> =>
    effect.pipe(
      Effect.tapError((cause) =>
        Effect.logDebug("Documents SyncOperation repository adapter translated enqueue failure").pipe(
          Effect.annotateLogs({ operation: "insert SyncOperation", table: SYNC_OPERATION_TABLE_NAME, cause })
        )
      ),
      Effect.mapError((cause) =>
        isIdempotencyKeyViolation(cause)
          ? duplicateIdempotencyKeyConflict(idempotencyKey)
          : SyncOperationRepositoryUnavailable.make({
              reason: `insert SyncOperation failed against ${SYNC_OPERATION_TABLE_NAME}`,
            })
      )
    );

/**
 * Build a Drizzle-backed SyncOperation repository used by live persistence tests.
 *
 * **Details**
 *
 * Duplicate idempotency keys are rejected by the table's unique index; the
 * driver failure is detected and translated to
 * `SyncOperationRepositoryConflict`.
 *
 * **Example** (Drizzle repository factory)
 *
 * ```ts
 * import { makeDrizzleSyncOperationRepository } from "@beep/documents-server/entities/SyncOperation"
 *
 * console.log(makeDrizzleSyncOperationRepository)
 * ```
 *
 * @effects Requires `PostgresDrizzle`; executes `select`, `insert`, and
 * `update` statements against the SyncOperation table and redacts driver
 * failures to `SyncOperationRepositoryUnavailable`. Every `update` advances
 * `row_version`; `update` also matches the expected version in its `WHERE`
 * clause.
 * @category repositories
 * @since 0.0.0
 */
export const makeDrizzleSyncOperationRepository = Effect.fn("Documents.SyncOperationRepository.makeDrizzle")(
  function* () {
    const db = yield* PostgresDrizzle;

    // A guarded update matched no row: either the row is gone or another write
    // (such as a requeue) advanced its version past the one this write expected.
    const rejectUpdate = Effect.fn("Documents.SyncOperationRepository.drizzleRejectUpdate")(function* (
      operation: DomainSyncOperation.SyncOperation
    ) {
      const rows = yield* db
        .select({ rowVersion: syncOperationTable.rowVersion })
        .from(syncOperationTable)
        .where(eq(syncOperationTable.id, operation.id))
        .limit(1)
        .pipe(repositoryUnavailable("select SyncOperation row version"));
      const stored = A.head(rows);
      if (O.isNone(stored)) {
        return yield* SyncOperationRepositoryNotFound.make({ syncOperationId: operation.id });
      }
      return yield* versionConflict(operation, stored.value.rowVersion);
    });

    return SyncOperationRepository.of({
      enqueue: Effect.fn("Documents.SyncOperationRepository.drizzleEnqueue")(function* (seed) {
        const currentRows = yield* db
          .select()
          .from(syncOperationTable)
          .pipe(repositoryUnavailable("list SyncOperation"));
        const operation = yield* syncOperationFromSeed(nextEntityId(currentRows), seed);
        const insert = yield* Effect.fromResult(toSyncOperationInsert(operation)).pipe(
          repositoryUnavailable("encode SyncOperation insert")
        );
        const rows = yield* db
          .insert(syncOperationTable)
          .values(insert)
          .returning()
          .pipe(translateEnqueueFailure(seed.idempotencyKey));
        return yield* pipe(
          A.head(rows),
          O.match({
            onNone: () => Effect.succeed(operation),
            onSome: (row) =>
              Effect.fromResult(fromSyncOperationRow(row)).pipe(repositoryUnavailable("decode SyncOperation")),
          })
        );
      }),
      listByStatus: Effect.fn("Documents.SyncOperationRepository.drizzleListByStatus")(function* (input) {
        const rows = yield* db
          .select()
          .from(syncOperationTable)
          .where(
            and(
              eq(syncOperationTable.workspaceId, input.workspaceId),
              eq(syncOperationTable.provider, input.provider),
              eq(syncOperationTable.status, input.status)
            )
          )
          .orderBy(asc(syncOperationTable.id))
          .pipe(repositoryUnavailable("list SyncOperation by status"));
        return yield* Effect.fromResult(Result.all(A.map(rows, fromSyncOperationRow))).pipe(
          repositoryUnavailable("decode SyncOperation")
        );
      }),
      listQueued: Effect.fn("Documents.SyncOperationRepository.drizzleListQueued")(function* (input) {
        const rows = yield* db
          .select()
          .from(syncOperationTable)
          .where(
            and(
              eq(syncOperationTable.workspaceId, input.workspaceId),
              eq(syncOperationTable.provider, input.provider),
              eq(syncOperationTable.status, DomainSyncOperation.SyncOperationStatus.Enum.queued)
            )
          )
          .orderBy(asc(syncOperationTable.id))
          .pipe(repositoryUnavailable("list queued SyncOperation"));
        return yield* Effect.fromResult(Result.all(A.map(rows, fromSyncOperationRow))).pipe(
          repositoryUnavailable("decode SyncOperation")
        );
      }),
      listQueuedForItem: Effect.fn("Documents.SyncOperationRepository.drizzleListQueuedForItem")(function* (input) {
        const rows = yield* db
          .select()
          .from(syncOperationTable)
          .where(
            and(
              eq(syncOperationTable.workspaceId, input.workspaceId),
              eq(syncOperationTable.syncItemId, input.syncItemId),
              eq(syncOperationTable.status, DomainSyncOperation.SyncOperationStatus.Enum.queued)
            )
          )
          .orderBy(asc(syncOperationTable.id))
          .pipe(repositoryUnavailable("list queued SyncOperation for item"));
        return yield* Effect.fromResult(Result.all(A.map(rows, fromSyncOperationRow))).pipe(
          repositoryUnavailable("decode SyncOperation")
        );
      }),
      requeueLeased: Effect.fn("Documents.SyncOperationRepository.drizzleRequeueLeased")(function* (input) {
        const rows = yield* db
          .update(syncOperationTable)
          .set({
            rowVersion: sql`${syncOperationTable.rowVersion} + 1`,
            status: DomainSyncOperation.SyncOperationStatus.Enum.queued,
          })
          .where(
            and(
              eq(syncOperationTable.workspaceId, input.workspaceId),
              eq(syncOperationTable.provider, input.provider),
              eq(syncOperationTable.status, DomainSyncOperation.SyncOperationStatus.Enum.leased)
            )
          )
          .returning()
          .pipe(repositoryUnavailable("requeue leased SyncOperation"));
        return A.length(rows);
      }),
      update: Effect.fn("Documents.SyncOperationRepository.drizzleUpdate")(function* (operation) {
        const insert = yield* Effect.fromResult(toSyncOperationInsert(operation)).pipe(
          repositoryUnavailable("encode SyncOperation insert")
        );
        const rows = yield* db
          .update(syncOperationTable)
          .set({ ...insert, rowVersion: nextRowVersion(operation.rowVersion) })
          .where(and(eq(syncOperationTable.id, operation.id), eq(syncOperationTable.rowVersion, operation.rowVersion)))
          .returning()
          .pipe(repositoryUnavailable("update SyncOperation"));
        const updated = A.head(rows);
        if (O.isNone(updated)) {
          return yield* rejectUpdate(operation);
        }
        return yield* Effect.fromResult(fromSyncOperationRow(updated.value)).pipe(
          repositoryUnavailable("decode SyncOperation")
        );
      }),
    });
  }
);
