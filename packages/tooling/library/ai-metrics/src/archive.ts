/**
 * Encrypted raw archive helpers for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, Encoding, FileSystem, Path, Result } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AiMetricsTranscriptSource } from "./models.ts";
import { hashPrivateIdentifier, hashPublicTextSha256 } from "./privacy.ts";

const $I = $RepoAiMetricsId.create("archive");
const AES_GCM_KEY_BYTES = 32;
const AES_GCM_NONCE_BYTES = 12;

/**
 * Error raised by AI metrics encrypted archive helpers.
 *
 * @example
 * ```ts
 * import { AiMetricsArchiveError } from "@beep/repo-ai-metrics"
 * const error = new AiMetricsArchiveError({
 *   cause: "boom",
 *   message: "Archive failed."
 * })
 * void error
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsArchiveError extends TaggedErrorClass<AiMetricsArchiveError>($I`AiMetricsArchiveError`)(
  "AiMetricsArchiveError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsArchiveError", {
    description: "Typed failure raised while encrypting or reading AI metrics raw archive objects.",
  })
) {}

/**
 * Encrypted raw transcript archive envelope stored on disk.
 *
 * @example
 * ```ts
 * import { AiMetricsEncryptedRawArchiveEnvelope } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsEncryptedRawArchiveEnvelope)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsEncryptedRawArchiveEnvelope extends S.Class<AiMetricsEncryptedRawArchiveEnvelope>(
  $I`AiMetricsEncryptedRawArchiveEnvelope`
)(
  {
    algorithm: S.Literal("AES-256-GCM"),
    archiveObjectId: S.String,
    ciphertextBase64: S.String,
    encryptedAtEpochMillis: S.Number,
    nonceBase64: S.String,
    plaintextContentHash: S.String,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
  },
  $I.annote("AiMetricsEncryptedRawArchiveEnvelope", {
    description: "Encrypted raw transcript archive envelope with private source paths represented by salted hashes.",
  })
) {}

/**
 * Safe archive object metadata returned after an encrypted write or lookup.
 *
 * @example
 * ```ts
 * import { AiMetricsRawArchiveObject } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsRawArchiveObject)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsRawArchiveObject extends S.Class<AiMetricsRawArchiveObject>($I`AiMetricsRawArchiveObject`)(
  {
    algorithm: S.Literal("AES-256-GCM"),
    archiveObjectId: S.String,
    archivePath: S.String,
    encryptedAtEpochMillis: S.Number,
    plaintextContentHash: S.String,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
  },
  $I.annote("AiMetricsRawArchiveObject", {
    description: "Safe metadata for one encrypted raw transcript archive object.",
  })
) {}

const encodeArchiveEnvelope = S.encodeUnknownEffect(S.fromJsonString(AiMetricsEncryptedRawArchiveEnvelope));
const decodeArchiveEnvelope = S.decodeUnknownEffect(S.fromJsonString(AiMetricsEncryptedRawArchiveEnvelope));

const archiveFailure = (message: string, cause: unknown): AiMetricsArchiveError =>
  new AiMetricsArchiveError({ cause, message });

const decodeRawArchiveKey = (rawArchiveKeyBase64: string): Effect.Effect<Uint8Array, AiMetricsArchiveError> =>
  Result.match(Encoding.decodeBase64(Str.trim(rawArchiveKeyBase64)), {
    onFailure: (cause) => Effect.fail(archiveFailure("Raw archive key must be valid base64.", cause)),
    onSuccess: (bytes) =>
      bytes.length === AES_GCM_KEY_BYTES
        ? Effect.succeed(bytes)
        : Effect.fail(
            archiveFailure("Raw archive key must decode to exactly 32 bytes for AES-256-GCM.", {
              actualBytes: bytes.length,
            })
          ),
  });

const importRawArchiveKey = (rawArchiveKeyBase64: string): Effect.Effect<CryptoKey, AiMetricsArchiveError> =>
  Effect.flatMap(decodeRawArchiveKey(rawArchiveKeyBase64), (bytes) =>
    Effect.tryPromise({
      try: () =>
        globalThis.crypto.subtle.importKey("raw", cryptoBytes(bytes), "AES-GCM", false, ["encrypt", "decrypt"]),
      catch: (cause) => archiveFailure("Failed to import raw archive encryption key.", cause),
    })
  );

const cryptoBytes = (bytes: Uint8Array): Uint8Array<ArrayBuffer> => {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
};

const randomNonce = (): Uint8Array => {
  const nonce = new Uint8Array(AES_GCM_NONCE_BYTES);
  globalThis.crypto.getRandomValues(nonce);
  return nonce;
};

const archiveObjectIdFor = Effect.fn("AiMetrics.archiveObjectIdFor")(function* (
  sourceKind: AiMetricsTranscriptSource,
  sourcePathHash: string,
  plaintextContentHash: string
) {
  const digest = yield* hashPublicTextSha256(
    `ai-metrics-raw-archive-v1\u0000${sourceKind}\u0000${sourcePathHash}\u0000${plaintextContentHash}`
  ).pipe(Effect.mapError((cause) => archiveFailure("Failed to compute raw archive object id.", cause)));

  return `raw-${digest}`;
});

const archiveObjectPath = (
  pathApi: Path.Path,
  rawArchiveDir: string,
  sourceKind: AiMetricsTranscriptSource,
  archiveObjectId: string
): string => pathApi.join(rawArchiveDir, sourceKind, `${archiveObjectId}.json`);

const envelopeToObject = (
  archivePath: string,
  envelope: AiMetricsEncryptedRawArchiveEnvelope
): AiMetricsRawArchiveObject =>
  new AiMetricsRawArchiveObject({
    algorithm: envelope.algorithm,
    archiveObjectId: envelope.archiveObjectId,
    archivePath,
    encryptedAtEpochMillis: envelope.encryptedAtEpochMillis,
    plaintextContentHash: envelope.plaintextContentHash,
    sourceKind: envelope.sourceKind,
    sourcePathHash: envelope.sourcePathHash,
  });

const readExistingArchiveObject = Effect.fn("AiMetrics.readExistingArchiveObject")(function* (archivePath: string) {
  const fs = yield* FileSystem.FileSystem;
  const envelopeText = yield* fs
    .readFileString(archivePath)
    .pipe(
      Effect.mapError((cause) => archiveFailure(`Failed to read existing archive object "${archivePath}".`, cause))
    );
  const envelope = yield* decodeArchiveEnvelope(envelopeText).pipe(
    Effect.mapError((cause) => archiveFailure(`Failed to decode existing archive object "${archivePath}".`, cause))
  );

  return envelopeToObject(archivePath, envelope);
});

/**
 * Write one raw transcript file into the encrypted content-addressed archive.
 *
 * @category services
 * @since 0.0.0
 */
export const writeEncryptedRawArchiveObject = Effect.fn("AiMetrics.writeEncryptedRawArchiveObject")(function* ({
  content,
  hashSalt,
  rawArchiveDir,
  rawArchiveKeyBase64,
  sourceKind,
  sourcePath,
}: {
  readonly content: string;
  readonly hashSalt?: string;
  readonly rawArchiveDir: string;
  readonly rawArchiveKeyBase64: string;
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePath: string;
}) {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const sourcePathHash = yield* hashPrivateIdentifier(sourcePath, hashSalt).pipe(
    Effect.mapError((cause) => archiveFailure("Failed to hash raw archive source path.", cause))
  );
  const plaintextContentHash = yield* hashPublicTextSha256(content).pipe(
    Effect.mapError((cause) => archiveFailure("Failed to hash raw archive plaintext.", cause))
  );
  const archiveObjectId = yield* archiveObjectIdFor(sourceKind, sourcePathHash, plaintextContentHash);
  const archivePath = archiveObjectPath(pathApi, rawArchiveDir, sourceKind, archiveObjectId);
  const alreadyArchived = yield* fs.exists(archivePath);
  if (alreadyArchived) {
    return yield* readExistingArchiveObject(archivePath);
  }

  const key = yield* importRawArchiveKey(rawArchiveKeyBase64);
  const nonce = randomNonce();
  const ciphertext = yield* Effect.tryPromise({
    try: () =>
      globalThis.crypto.subtle.encrypt(
        { iv: cryptoBytes(nonce), name: "AES-GCM" },
        key,
        new TextEncoder().encode(content)
      ),
    catch: (cause) => archiveFailure("Failed to encrypt raw archive object.", cause),
  });
  const encryptedAtEpochMillis = yield* Clock.currentTimeMillis;
  const envelope = new AiMetricsEncryptedRawArchiveEnvelope({
    algorithm: "AES-256-GCM",
    archiveObjectId,
    ciphertextBase64: Encoding.encodeBase64(new Uint8Array(ciphertext)),
    encryptedAtEpochMillis,
    nonceBase64: Encoding.encodeBase64(nonce),
    plaintextContentHash,
    sourceKind,
    sourcePathHash,
  });
  const envelopeText = yield* encodeArchiveEnvelope(envelope).pipe(
    Effect.mapError((cause) => archiveFailure("Failed to encode raw archive envelope.", cause))
  );

  yield* fs
    .makeDirectory(pathApi.dirname(archivePath), { recursive: true })
    .pipe(
      Effect.mapError((cause) => archiveFailure(`Failed to create raw archive directory for "${archivePath}".`, cause))
    );
  yield* fs
    .writeFileString(archivePath, envelopeText)
    .pipe(Effect.mapError((cause) => archiveFailure(`Failed to write raw archive object "${archivePath}".`, cause)));

  return envelopeToObject(archivePath, envelope);
});

/**
 * Decrypt an archive envelope for package-level verification.
 *
 * P2 intentionally does not expose this as a CLI command.
 *
 * @category services
 * @since 0.0.0
 */
export const decryptEncryptedRawArchiveEnvelope = Effect.fn("AiMetrics.decryptEncryptedRawArchiveEnvelope")(function* ({
  envelope,
  rawArchiveKeyBase64,
}: {
  readonly envelope: AiMetricsEncryptedRawArchiveEnvelope;
  readonly rawArchiveKeyBase64: string;
}) {
  const key = yield* importRawArchiveKey(rawArchiveKeyBase64);
  const nonce = yield* Result.match(Encoding.decodeBase64(envelope.nonceBase64), {
    onFailure: (cause) => Effect.fail(archiveFailure("Archive envelope nonce is not valid base64.", cause)),
    onSuccess: Effect.succeed,
  });
  const ciphertext = yield* Result.match(Encoding.decodeBase64(envelope.ciphertextBase64), {
    onFailure: (cause) => Effect.fail(archiveFailure("Archive envelope ciphertext is not valid base64.", cause)),
    onSuccess: Effect.succeed,
  });
  const plaintext = yield* Effect.tryPromise({
    try: () =>
      globalThis.crypto.subtle.decrypt({ iv: cryptoBytes(nonce), name: "AES-GCM" }, key, cryptoBytes(ciphertext)),
    catch: (cause) => archiveFailure("Failed to decrypt raw archive envelope.", cause),
  });

  return new TextDecoder().decode(plaintext);
});

/**
 * Read and decode an encrypted raw archive envelope from disk.
 *
 * @category services
 * @since 0.0.0
 */
export const readEncryptedRawArchiveEnvelope = Effect.fn("AiMetrics.readEncryptedRawArchiveEnvelope")(function* (
  archivePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const envelopeText = yield* fs
    .readFileString(archivePath)
    .pipe(Effect.mapError((cause) => archiveFailure(`Failed to read archive envelope "${archivePath}".`, cause)));

  return yield* decodeArchiveEnvelope(envelopeText).pipe(
    Effect.mapError((cause) => archiveFailure(`Failed to decode archive envelope "${archivePath}".`, cause))
  );
});
