/**
 * Upload session repository service for managing upload session entities.
 *
 * @since 0.1.0
 */
import { $SharedServerId } from "@beep/identity/packages";
import { File, UploadSession } from "@beep/shared-domain/entities";
import type { UploadSessionMetadata } from "@beep/shared-domain/entities/upload-session";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import type { HmacSignature } from "@beep/shared-domain/services/EncryptionService/schemas";
import { SharedDb } from "@beep/shared-server";
import { DbRepo } from "@beep/shared-server/factories";
import { uploadSession } from "@beep/shared-tables/tables";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { dependencies } from "./_common";

const $I = $SharedServerId.create("repos/UploadSession");

// ============================================================================
// Helpers
// ============================================================================

/**
 * Converts encoded DateTime values to Date for Drizzle compatibility.
 *
 * @remarks
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

/**
 * Database error type for upload session repository operations.
 *
 * @since 0.1.0
 * @category Errors
 */
export class UploadSessionRepoError extends S.TaggedError<UploadSessionRepoError>()(
  $I`UploadSessionRepoError`,
  {
    operation: S.String,
    fileKey: S.optional(File.UploadKey.to),
    cause: S.Unknown,
  },
  $I.annotations("UploadSessionRepoError", {
    description: "Database error from upload session repository operations",
  })
) {}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Parameters for storing a new upload session.
 *
 * @since 0.1.0
 * @category Types
 */
export interface StoreParams {
  /**
   * S3 object key - unique identifier for the upload target.
   */
  readonly fileKey: typeof UploadSession.Model.fields.fileKey.Type;

  /**
   * HMAC-SHA256 signature for later verification.
   */
  readonly signature: HmacSignature;

  /**
   * Signed metadata payload.
   */
  readonly metadata: S.Schema.Type<typeof UploadSessionMetadata>;

  /**
   * When this session expires (typically 15 minutes from creation).
   */
  readonly expiresAt: DateTime.Utc;

  /**
   * Organization ID for multi-tenancy.
   */
  readonly organizationId: SharedEntityIds.OrganizationId.Type;

  /**
   * User ID for audit tracking (createdBy/updatedBy).
   */
  readonly userId: SharedEntityIds.UserId.Type;
}

// ============================================================================
// Repository Service
// ============================================================================

/**
 * Repository service for managing UploadSession entities with database operations.
 *
 * Provides CRUD operations plus specialized methods for upload session management:
 * storing sessions with upsert behavior, finding by file key, deleting expired
 * sessions, and checking session validity.
 *
 * @example
 * ```typescript
 * import { UploadSessionRepo } from "@beep/shared-server"
 * import { Policy } from "@beep/shared-domain"
 * import * as Effect from "effect/Effect"
 * import * as DateTime from "effect/DateTime"
 *
 * const program = Effect.gen(function* () {
 *   const { user, organization } = yield* Policy.AuthContext
 *   const repo = yield* UploadSessionRepo
 *
 *   // Store a new session with user audit tracking
 *   const sessionId = yield* repo.store({
 *     fileKey: "/tenants/org/user/file.jpg",
 *     signature: "hmac-sha256=abc123...",
 *     metadata: { ... },
 *     expiresAt: DateTime.add(yield* DateTime.now, { minutes: 15 }),
 *     organizationId: organization.id,
 *     userId: user.id,
 *   })
 *
 *   // Find session by file key
 *   const sessionOpt = yield* repo.findByFileKey("/tenants/org/user/file.jpg")
 *
 *   // Delete expired sessions (cleanup job)
 *   const deletedCount = yield* repo.deleteExpired()
 * })
 * ```
 *
 * @category services
 * @since 0.1.0
 */
export class UploadSessionRepo extends Effect.Service<UploadSessionRepo>()($I`UploadSessionRepo`, {
  dependencies,
  accessors: true,
  effect: Effect.gen(function* () {
    const { execute } = yield* SharedDb.Db;
    const baseRepo = yield* DbRepo.make(SharedEntityIds.UploadSessionId, UploadSession.Model, Effect.succeed({}));

    // Encoder for transforming model insert type to database-compatible format
    const encodeInsert = S.encode(UploadSession.Model.insert);

    // ========================================================================
    // Store Session (Upsert)
    // ========================================================================

    /**
     * Stores a new upload session in the database.
     *
     * @remarks
     * Creates a new upload session record with the provided data. If a session
     * with the same `fileKey` already exists, it will be overwritten (upsert
     * behavior for retry scenarios).
     *
     * The session ID is auto-generated using `SharedEntityIds.UploadSessionId.create()`.
     *
     * @param session - The session data to store
     * @returns Effect that succeeds with the generated UploadSessionId
     */
    const store = (session: StoreParams): Effect.Effect<SharedEntityIds.UploadSessionId.Type, UploadSessionRepoError> =>
      Effect.gen(function* () {
        // Generate a new upload session ID
        const id = SharedEntityIds.UploadSessionId.create();

        // Encode the insert data through the model schema
        // This transforms branded types, DateTime.Utc, etc. to database-compatible formats
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
        // DateTimeUtcFromAllAcceptable encodes to Date at runtime, but TypeScript
        // sees a union type. These helpers ensure proper typing for Drizzle.
        const expiresAtDate = toDate(encoded.expiresAt);
        const deletedAtDate = toDateNullable(encoded.deletedAt);

        // Insert the upload session into the database
        // Using onConflictDoUpdate for retry scenarios where the same file
        // key might be used for a re-initiation
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

    // Decoder for transforming raw database rows to model type
    const decodeSession = S.decodeUnknown(UploadSession.Model);

    /**
     * Retrieves an upload session by file key.
     *
     * @remarks
     * Looks up an upload session using the S3 object key (unique column).
     * Returns `Option.some(session)` if found, `Option.none()` if not found.
     *
     * Note: This function does NOT check expiration - the caller should verify
     * that `session.expiresAt > now` after retrieving the session.
     *
     * @param fileKey - The S3 object key to look up
     * @returns Effect that succeeds with Option<UploadSession.Model>
     */
    const findByFileKey = (
      fileKey: File.UploadKey.Type
    ): Effect.Effect<O.Option<typeof UploadSession.Model.Type>, UploadSessionRepoError> =>
      Effect.gen(function* () {
        // Query using Drizzle - limit 1 since fileKey is unique
        const results = yield* execute((client) =>
          client.select().from(uploadSession).where(d.eq(uploadSession.fileKey, fileKey)).limit(1)
        );

        // Return as Option, decoding through model schema
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

    /**
     * Deletes an upload session by file key.
     *
     * @remarks
     * Removes an upload session from the database. This should be called after
     * successful signature verification to prevent replay attacks.
     *
     * This function is idempotent - calling it for a non-existent session
     * succeeds without error. This handles retry scenarios and race conditions.
     *
     * @param fileKey - The S3 object key to delete
     * @returns Effect that succeeds with void
     */
    const deleteByFileKey = (fileKey: File.UploadKey.Type): Effect.Effect<void, UploadSessionRepoError, never> =>
      // Delete using Drizzle - idempotent (no error if not found)
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

    /**
     * Deletes all expired upload sessions.
     *
     * @remarks
     * Removes all upload sessions where `expiresAt < now`. This is used by
     * the cleanup job to prevent table bloat from abandoned uploads.
     *
     * @returns Effect that succeeds with the number of deleted sessions
     */
    const deleteExpired = Effect.fn("UploadSessionRepo.deleteExpired")(
      function* () {
        // Get current timestamp and convert to JS Date
        const now = yield* DateTime.now;
        const nowDate = DateTime.toDate(now);

        // Delete expired sessions and return count via returning clause
        const deletedSessions = yield* execute((client) =>
          client.delete(uploadSession).where(d.lt(uploadSession.expiresAt, nowDate)).returning({ id: uploadSession.id })
        );

        // Return count of deleted sessions
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

    /**
     * Checks if an upload session exists and is not expired.
     *
     * @remarks
     * Convenience function that combines session lookup and expiration check.
     * Returns `true` if the session exists and has not expired.
     *
     * @param fileKey - The S3 object key to check
     * @returns Effect that succeeds with boolean indicating validity
     */
    const isValid = Effect.fn("UploadSessionRepo.isValid")(function* (fileKey: File.UploadKey.Type) {
      // Get the session from database (already decoded through model)
      const sessionOpt = yield* findByFileKey(fileKey);

      // Check if session exists
      if (O.isNone(sessionOpt)) {
        return false;
      }

      const session = sessionOpt.value;

      // Get current timestamp
      const now = yield* DateTime.now;

      // session.expiresAt is already DateTime.Utc from the model decode
      // Session is valid if current time is before or equal to expiration
      return DateTime.lessThanOrEqualTo(now, session.expiresAt);
    });

    return {
      store,
      findByFileKey,
      deleteByFileKey,
      deleteExpired,
      isValid,
      ...baseRepo,
    };
  }),
}) {}
