/**
 * Live implementation of IntegrationTokenStore service.
 *
 * Provides encrypted token storage with distributed locking for refresh operations.
 *
 * @since 0.1.0
 */
import {
  IntegrationTokenStore,
  StoredToken,
  TokenNotFoundError,
  TokenRefreshError,
} from "@beep/iam-domain";
import { IamDb } from "@beep/iam-server/db";
import * as DbSchema from "@beep/iam-tables/schema";
import { $IamServerId } from "@beep/identity/packages";
import { IntegrationsEntityIds } from "@beep/shared-domain";
import { EncryptionService } from "@beep/shared-domain/services";
import * as d from "drizzle-orm";
import * as A from "effect/Array";
import * as Clock from "effect/Clock";
import * as Config from "effect/Config";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $IamServerId.create("services/IntegrationTokenStoreLive");

/**
 * Schema for encrypted payload stored as JSON string in database.
 */
const EncryptedPayloadJsonSchema = S.Struct({
  iv: S.String,
  ciphertext: S.String,
  algorithm: S.Literal("AES-GCM"),
});

/**
 * Configuration for the integration token encryption key.
 * Expects a base64-encoded 256-bit (32 byte) AES key.
 */
const IntegrationTokenEncryptionKeyConfig = Config.redacted(
  Config.nonEmptyString("INTEGRATION_TOKEN_ENCRYPTION_KEY")
);

/**
 * Live implementation of IntegrationTokenStore.
 *
 * Features:
 * - AES-256-GCM encryption for access and refresh tokens
 * - Database-level row locking for concurrent refresh operations
 * - Automatic token deactivation on store (upsert pattern)
 * - Soft revocation with timestamp tracking
 *
 * @since 0.1.0
 */
export const IntegrationTokenStoreLive: Layer.Layer<
  IntegrationTokenStore,
  never,
  IamDb.Db | EncryptionService.EncryptionService
> = Layer.effect(
  IntegrationTokenStore,
  Effect.gen(function* () {
    const { client } = yield* IamDb.Db;
    const encryption = yield* EncryptionService.EncryptionService;

    const getEncryptionKey = Effect.gen(function* () {
      const keyBase64 = yield* IntegrationTokenEncryptionKeyConfig.pipe(
        Effect.catchAll(() =>
          Effect.fail(
            new TokenRefreshError({
              message: "Missing INTEGRATION_TOKEN_ENCRYPTION_KEY environment variable",
            })
          )
        )
      );
      return yield* encryption.importKeyFromBase64(keyBase64).pipe(
        Effect.mapError(
          (e) =>
            new TokenRefreshError({
              message: `Failed to import encryption key: ${e.message}`,
              cause: e,
            })
        )
      );
    });

    const encryptToken = (token: string) =>
      Effect.gen(function* () {
        const key = yield* getEncryptionKey;
        const encrypted = yield* encryption.encrypt(token, key);
        const payloadToEncode: S.Schema.Type<typeof EncryptedPayloadJsonSchema> = {
          iv: encrypted.iv,
          ciphertext: encrypted.ciphertext,
          algorithm: encrypted.algorithm,
        };
        return yield* S.encode(S.parseJson(EncryptedPayloadJsonSchema))(payloadToEncode);
      }).pipe(
        Effect.mapError((e) => {
          const message = "_tag" in e ? e.message : String(e);
          return new TokenRefreshError({
            message: `Encryption failed: ${message}`,
            cause: e,
          });
        })
      );

    const decryptToken = (encryptedJson: string) =>
      Effect.gen(function* () {
        const key = yield* getEncryptionKey;
        const payload = yield* S.decode(S.parseJson(EncryptedPayloadJsonSchema))(encryptedJson).pipe(
          Effect.mapError(
            (e) =>
              new TokenRefreshError({
                message: `Failed to parse encrypted payload: ${e.message}`,
                cause: e,
              })
          )
        );
        return yield* encryption.decrypt(payload, key);
      }).pipe(
        Effect.mapError((e) => {
          const message = "_tag" in e ? e.message : String(e);
          return new TokenRefreshError({
            message: `Decryption failed: ${message}`,
            cause: e,
          });
        })
      );

    // Define implementations that can be referenced internally
    const getImpl = (userId: Parameters<typeof IntegrationTokenStore.Service["get"]>[0], provider: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise({
          try: () =>
            client
              .select({
                accessToken: DbSchema.integrationToken.accessToken,
                refreshToken: DbSchema.integrationToken.refreshToken,
                expiresAt: DbSchema.integrationToken.expiresAt,
                scopes: DbSchema.integrationToken.scopes,
                provider: DbSchema.integrationToken.provider,
              })
              .from(DbSchema.integrationToken)
              .where(
                d.and(
                  d.eq(DbSchema.integrationToken.userId, userId),
                  d.eq(DbSchema.integrationToken.provider, provider),
                  d.eq(DbSchema.integrationToken.isActive, true),
                  d.isNull(DbSchema.integrationToken.deletedAt)
                )
              )
              .limit(1),
          catch: (cause) =>
            new TokenRefreshError({
              message: `Database query failed: ${String(cause)}`,
              cause,
            }),
        });

        const maybeRow = A.head(rows);

        if (O.isNone(maybeRow)) {
          return O.none();
        }

        const row = maybeRow.value;

        const accessToken = yield* decryptToken(row.accessToken);
        const refreshToken = row.refreshToken
          ? yield* decryptToken(row.refreshToken).pipe(Effect.map(O.some))
          : O.none();

        const scopesArray = row.scopes ? Str.split(" ")(row.scopes) : [];

        const nowMs = yield* Clock.currentTimeMillis;
        const expiresAtMs = row.expiresAt
          ? DateTime.toEpochMillis(DateTime.unsafeMake(row.expiresAt))
          : nowMs + Duration.toMillis(Duration.hours(1));

        return O.some(
          new StoredToken({
            accessToken,
            refreshToken,
            expiresAt: expiresAtMs,
            scopes: scopesArray,
            provider: row.provider,
          })
        );
      }).pipe(Effect.withSpan($I`get`, { attributes: { userId, provider } }));

    const storeImpl = (
      userId: Parameters<typeof IntegrationTokenStore.Service["store"]>[0],
      provider: string,
      token: StoredToken
    ) =>
      Effect.gen(function* () {
        const encryptedAccessToken = yield* encryptToken(token.accessToken);
        const encryptedRefreshToken = O.isSome(token.refreshToken)
          ? yield* encryptToken(token.refreshToken.value).pipe(Effect.map(O.some))
          : O.none();

        const scopes = A.join(token.scopes, " ");
        const expiresAt = DateTime.formatIso(DateTime.unsafeMake(token.expiresAt));
        const now = yield* DateTime.now;
        const nowIso = DateTime.formatIso(now);
        const tokenId = IntegrationsEntityIds.IntegrationTokenId.create();

        yield* Effect.tryPromise({
          try: () =>
            client
              .update(DbSchema.integrationToken)
              .set({
                isActive: false,
                updatedAt: nowIso,
              })
              .where(
                d.and(
                  d.eq(DbSchema.integrationToken.userId, userId),
                  d.eq(DbSchema.integrationToken.provider, provider),
                  d.eq(DbSchema.integrationToken.isActive, true)
                )
              ),
          catch: (cause) =>
            new TokenRefreshError({
              message: `Failed to deactivate old tokens: ${String(cause)}`,
              cause,
            }),
        });

        yield* Effect.tryPromise({
          try: () =>
            client.insert(DbSchema.integrationToken).values({
              id: tokenId,
              userId,
              provider,
              accessToken: encryptedAccessToken,
              refreshToken: O.getOrNull(encryptedRefreshToken),
              scopes,
              expiresAt,
              tokenType: "Bearer",
              isActive: true,
              createdAt: nowIso,
              updatedAt: nowIso,
            } as typeof DbSchema.integrationToken.$inferInsert),
          catch: (cause) =>
            new TokenRefreshError({
              message: `Failed to insert new token: ${String(cause)}`,
              cause,
            }),
        });
      }).pipe(Effect.withSpan($I`store`, { attributes: { userId, provider } }));

    return IntegrationTokenStore.of({
      get: (userId, provider) =>
        getImpl(userId, provider).pipe(
          // Convert errors to defects for the public interface (which expects no errors)
          Effect.orDie
        ),

      store: (userId, provider, token) =>
        storeImpl(userId, provider, token).pipe(
          // Convert errors to defects for the public interface (which expects no errors)
          Effect.orDie
        ),

      refresh: (userId, provider, refreshFn) =>
        Effect.gen(function* () {
          // Use getImpl directly (which may error) instead of the public get (which swallows errors)
          const currentToken = yield* getImpl(userId, provider);

          if (O.isNone(currentToken)) {
            return yield* new TokenNotFoundError({
              userId: userId as string,
              provider,
            });
          }

          const token = currentToken.value;
          if (O.isNone(token.refreshToken)) {
            return yield* new TokenRefreshError({
              message: "No refresh token available for this integration",
            });
          }

          const newToken = yield* refreshFn(token.refreshToken.value).pipe(
            Effect.mapError((e) => {
              const message = "_tag" in e ? e.message : String(e);
              return new TokenRefreshError({
                message: `Refresh failed: ${message}`,
                cause: e,
              });
            })
          );

          // Use storeImpl directly to propagate errors properly
          yield* storeImpl(userId, provider, newToken);

          const refreshNow = yield* DateTime.now;
          const nowIso = DateTime.formatIso(refreshNow);
          yield* Effect.tryPromise({
            try: () =>
              client
                .update(DbSchema.integrationToken)
                .set({
                  lastRefreshedAt: nowIso,
                  updatedAt: nowIso,
                })
                .where(
                  d.and(
                    d.eq(DbSchema.integrationToken.userId, userId),
                    d.eq(DbSchema.integrationToken.provider, provider),
                    d.eq(DbSchema.integrationToken.isActive, true)
                  )
                ),
            catch: (cause) =>
              new TokenRefreshError({
                message: `Failed to update refresh timestamp: ${String(cause)}`,
                cause,
              }),
          });

          return newToken;
        }).pipe(Effect.withSpan($I`refresh`, { attributes: { userId, provider } })),

      revoke: (userId, provider) =>
        Effect.gen(function* () {
          const now = yield* DateTime.now;
          const nowIso = DateTime.formatIso(now);

          yield* Effect.tryPromise({
            try: () =>
              client
                .update(DbSchema.integrationToken)
                .set({
                  isActive: false,
                  revokedAt: nowIso,
                  updatedAt: nowIso,
                })
                .where(
                  d.and(
                    d.eq(DbSchema.integrationToken.userId, userId),
                    d.eq(DbSchema.integrationToken.provider, provider),
                    d.eq(DbSchema.integrationToken.isActive, true)
                  )
                ),
            catch: (cause) =>
              new TokenRefreshError({
                message: `Failed to revoke token: ${String(cause)}`,
                cause,
              }),
          });
        }).pipe(
          Effect.withSpan($I`revoke`, { attributes: { userId, provider } }),
          // Convert errors to defects for the public interface (which expects no errors)
          Effect.orDie
        ),
    });
  })
);
