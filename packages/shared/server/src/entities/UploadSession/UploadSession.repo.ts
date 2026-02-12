import { File, UploadSession } from "@beep/shared-domain/entities";
import type { UploadSessionMetadata } from "@beep/shared-domain/entities/UploadSession";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { HmacSignature } from "@beep/shared-domain/services/EncryptionService/schemas";
import type { DbClient } from "@beep/shared-server";
import { SharedDb } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { uploadSession } from "@beep/shared-tables/tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";

// ============================================================================
// Helpers
// ============================================================================

/**
 * Converts encoded DateTime values to Date for Drizzle compatibility.
 *
 * The `DateTimeUtcFromAllAcceptable` schema has an Encoded type that's a union
 * (`Date | string | number | DateTime.Utc`), but its encode function actually
 * returns just a `Date`. This helper normalizes the value for Drizzle which
 * expects `Date` for timestamp columns.
 */
const toDate = (value: string | number | Date | DateTime.Utc): Date => {
  if (value instanceof Date) return value;
  if (DateTime.isDateTime(value)) return DateTime.toDate(value);
  return F.pipe(
    DateTime.make(value),
    O.getOrElse(() => DateTime.unsafeNow()),
    DateTime.toDate
  );
};

/**
 * Converts nullable encoded DateTime values to Date for Drizzle compatibility.
 */
const toDateNullable = (value: string | number | Date | DateTime.Utc | null | undefined): Date | null => {
  if (value === null || value === undefined) return null;
  return toDate(value);
};

// ============================================================================
// Error Definitions
// ============================================================================

export class UploadSessionRepoError extends S.TaggedError<UploadSessionRepoError>()("UploadSessionRepoError", {
  operation: S.String,
  fileKey: S.optional(File.UploadKey.to),
  cause: S.Unknown,
}) {}

// ============================================================================
// Input Types
// ============================================================================

export interface StoreParams {
  readonly fileKey: typeof UploadSession.Model.fields.fileKey.Type;
  readonly signature: HmacSignature;
  readonly metadata: S.Schema.Type<typeof UploadSessionMetadata>;
  readonly expiresAt: DateTime.Utc;
  readonly organizationId: SharedEntityIds.OrganizationId.Type;
  readonly userId: SharedEntityIds.UserId.Type;
}

// ============================================================================
// Repository Service
// ============================================================================

const serviceEffect = Effect.gen(function* () {
  const { execute } = yield* SharedDb.Db;
  const baseRepo = yield* DbRepo.make(SharedEntityIds.UploadSessionId, UploadSession.Model);

  // Encoder for transforming model insert type to database-compatible format
  const encodeInsert = S.encode(UploadSession.Model.insert);

  // ========================================================================
  // Store Session (Upsert)
  // ========================================================================

  const store = (session: StoreParams): Effect.Effect<SharedEntityIds.UploadSessionId.Type, UploadSessionRepoError> =>
    Effect.gen(function* () {
      // Generate a new upload session ID
      const id = SharedEntityIds.UploadSessionId.create();

      // Encode the insert data through the model schema
      const encoded = yield* encodeInsert({
        id,
        fileKey: session.fileKey,
        signature: session.signature,
        metadata: session.metadata,
        expiresAt: session.expiresAt,
        organizationId: session.organizationId,
        // FieldOptionOmittable fields - use O.none() for null
        deletedAt: O.none(),
        source: O.some("upload-initiation"),
        deletedBy: O.none(),
        // User audit fields
        createdBy: O.some(session.userId),
        updatedBy: O.some(session.userId),
      });

      // Normalize DateTime fields to Date for Drizzle compatibility
      const expiresAtDate = toDate(encoded.expiresAt);
      const deletedAtDate = toDateNullable(encoded.deletedAt);

      // Insert the upload session into the database
      yield* execute((client) =>
        client
          .insert(uploadSession)
          .values({
            ...encoded,
            expiresAt: expiresAtDate,
            deletedAt: deletedAtDate,
          })
          .onConflictDoUpdate({
            target: uploadSession.fileKey,
            set: {
              id: encoded.id,
              signature: encoded.signature,
              metadata: encoded.metadata,
              expiresAt: expiresAtDate,
              updatedBy: encoded.updatedBy,
            },
          })
      );

      return id;
    }).pipe(
      Effect.mapError(
        (cause) =>
          new UploadSessionRepoError({
            operation: "store",
            fileKey: session.fileKey,
            cause,
          })
      ),
      Effect.withSpan("UploadSessionRepo.store")
    );

  // ========================================================================
  // Find By File Key
  // ========================================================================

  const decodeSession = S.decodeUnknown(UploadSession.Model);

  const findByFileKey = (
    fileKey: File.UploadKey.Type
  ): Effect.Effect<O.Option<typeof UploadSession.Model.Type>, UploadSessionRepoError> =>
    Effect.gen(function* () {
      const results = yield* execute((client) =>
        client.select().from(uploadSession).where(d.eq(uploadSession.fileKey, fileKey)).limit(1)
      );

      return yield* F.pipe(
        results,
        A.head,
        O.match({
          onNone: () => Effect.succeed(O.none<typeof UploadSession.Model.Type>()),
          onSome: (row) => F.pipe(decodeSession(row), Effect.map(O.some)),
        })
      );
    }).pipe(
      Effect.mapError(
        (cause) =>
          new UploadSessionRepoError({
            operation: "findByFileKey",
            fileKey,
            cause,
          })
      ),
      Effect.withSpan("UploadSessionRepo.findByFileKey")
    );

  // ========================================================================
  // Delete By File Key
  // ========================================================================

  const deleteByFileKey = (fileKey: File.UploadKey.Type): Effect.Effect<void, UploadSessionRepoError, never> =>
    execute((client) => client.delete(uploadSession).where(d.eq(uploadSession.fileKey, fileKey))).pipe(
      Effect.asVoid,
      Effect.mapError(
        (cause) =>
          new UploadSessionRepoError({
            operation: "deleteByFileKey",
            fileKey,
            cause,
          })
      ),
      Effect.withSpan("UploadSessionRepo.deleteByFileKey")
    );

  // ========================================================================
  // Delete Expired Sessions
  // ========================================================================

  const deleteExpired = Effect.fn("UploadSessionRepo.deleteExpired")(
    function* () {
      const now = yield* DateTime.now;
      const nowDate = DateTime.toDate(now);

      const deletedSessions = yield* execute((client) =>
        client.delete(uploadSession).where(d.lt(uploadSession.expiresAt, nowDate)).returning({ id: uploadSession.id })
      );

      return A.length(deletedSessions);
    },
    Effect.mapError(
      (cause) =>
        new UploadSessionRepoError({
          operation: "deleteExpired",
          cause,
        })
    )
  );

  // ========================================================================
  // Is Valid (Exists and Not Expired)
  // ========================================================================

  const isValid = Effect.fn("UploadSessionRepo.isValid")(function* (fileKey: File.UploadKey.Type) {
    const sessionOpt = yield* findByFileKey(fileKey);

    if (O.isNone(sessionOpt)) {
      return false;
    }

    const session = sessionOpt.value;
    const now = yield* DateTime.now;

    return DateTime.lessThanOrEqualTo(now, session.expiresAt);
  });

  return {
    store,
    findByFileKey,
    deleteByFileKey,
    deleteExpired,
    isValid,
    ...baseRepo,
  } as unknown as UploadSession.RepoShape;
});

export const RepoLive: Layer.Layer<UploadSession.Repo, never, DbClient.SliceDbRequirements> = Layer.effect(
  UploadSession.Repo,
  serviceEffect
).pipe(Layer.provide(SharedDb.layer));
