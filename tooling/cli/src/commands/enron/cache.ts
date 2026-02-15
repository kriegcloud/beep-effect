import { createHash } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { EnronDocument } from "./schemas.js";
import {

  ENRON_CURATED_MANIFEST_URI,
  ENRON_CURATED_S3_PREFIX_URI,
  type EnronS3DataSourceError,
  S3DataSource,
  type S3DataSource as S3DataSourceService,
} from "./s3-client.js";

const MANIFEST_FILE_NAME = "manifest.json";
const DOCUMENTS_FILE_NAME = "documents.json";

export const DEFAULT_ENRON_CACHE_DIRECTORY = join(homedir(), ".cache", "todox-test-data", "enron", "curated");

export class EnronCacheError extends S.TaggedError<EnronCacheError>()("EnronCacheError", {
  message: S.String,
  path: S.optional(S.String),
  cause: S.optional(S.String),
}) {}

export class EnronCacheIntegrityError extends S.TaggedError<EnronCacheIntegrityError>()("EnronCacheIntegrityError", {
  fileName: S.String,
  expectedSha256: S.String,
  actualSha256: S.String,
  expectedBytes: S.NonNegativeInt,
  actualBytes: S.NonNegativeInt,
}) {}

export class CuratedManifestArtifact extends S.Class<CuratedManifestArtifact>("CuratedManifestArtifact")({
  fileName: S.String,
  bytes: S.NonNegativeInt,
  sha256: S.String,
}) {}

export class CuratedManifestSummary extends S.Class<CuratedManifestSummary>("CuratedManifestSummary")({
  version: S.NonNegativeInt,
  generatedAt: S.String,
  source: S.String,
  selectedThreadCount: S.NonNegativeInt,
  selectedMessageCount: S.NonNegativeInt,
  scoredThreadCount: S.NonNegativeInt,
  datasetHash: S.String,
  artifacts: S.Array(CuratedManifestArtifact),
}) {}

export type EnronCacheDataError = EnronCacheError | EnronCacheIntegrityError | EnronS3DataSourceError;

export type CacheSyncStatus = "miss" | "hit" | "manifest-changed" | "artifact-mismatch";

export interface EnronCacheOptions {
  readonly cacheDirectory?: undefined | string;
}

export interface CuratedCacheSyncResult {
  readonly status: CacheSyncStatus;
  readonly cacheDirectory: string;
  readonly manifestPath: string;
  readonly manifestHash: string;
  readonly manifest: CuratedManifestSummary;
  readonly downloadedArtifacts: ReadonlyArray<string>;
}

export interface CuratedArtifactInfo {
  readonly fileName: string;
  readonly path: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface EnronCuratedInfo {
  readonly cacheStatus: CacheSyncStatus;
  readonly cacheDirectory: string;
  readonly manifestPath: string;
  readonly manifestHash: string;
  readonly generatedAt: string;
  readonly source: string;
  readonly selectedThreadCount: number;
  readonly selectedMessageCount: number;
  readonly scoredThreadCount: number;
  readonly datasetHash: string;
  readonly artifacts: ReadonlyArray<CuratedArtifactInfo>;
  readonly downloadedArtifacts: ReadonlyArray<string>;
}

export interface LoadedCuratedDocuments {
  readonly cache: CuratedCacheSyncResult;
  readonly documentsPath: string;
  readonly documentsJson: string;
  readonly documents: ReadonlyArray<EnronDocument>;
}

export interface EnronDataCache {
  readonly syncCuratedCache: (
    options?: undefined | EnronCacheOptions
  ) => Effect.Effect<CuratedCacheSyncResult, EnronCacheDataError>;
  readonly readCuratedInfo: (
    options?: undefined | EnronCacheOptions
  ) => Effect.Effect<EnronCuratedInfo, EnronCacheDataError>;
  readonly loadCuratedDocuments: (
    options?: undefined | EnronCacheOptions
  ) => Effect.Effect<LoadedCuratedDocuments, EnronCacheDataError>;
}

export const EnronDataCache = Context.GenericTag<EnronDataCache>("@beep/repo-cli/enron/DataCache");

const sha256Hex = (value: string): string => createHash("sha256").update(value, "utf8").digest("hex");

const utf8Bytes = (value: string): number => Buffer.byteLength(value, "utf8");

const resolveCacheDirectory = (options?: EnronCacheOptions): string => options?.cacheDirectory ?? DEFAULT_ENRON_CACHE_DIRECTORY;

const manifestPath = (cacheDirectory: string): string => join(cacheDirectory, MANIFEST_FILE_NAME);

const artifactPath = (cacheDirectory: string, fileName: string): string => join(cacheDirectory, fileName);

const errorMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause));

const hasCode = (cause: unknown): cause is { readonly code: string } =>
  typeof cause === "object" && cause !== null && "code" in cause && typeof cause.code === "string";

const decodeJson = <A, I, R>(
  schema: S.Schema<A, I, R>,
  jsonText: string,
  message: string,
  path?: string
): Effect.Effect<A, EnronCacheError, R> =>
  S.decodeUnknown(S.parseJson(schema))(jsonText).pipe(
    Effect.mapError(
      (cause) =>
        new EnronCacheError({
          message,
          path,
          cause: String(cause),
        })
    )
  );

const makeDirectory = (path: string): Effect.Effect<void, EnronCacheError> =>
  Effect.tryPromise({
    try: () => mkdir(path, { recursive: true }),
    catch: (cause) =>
      new EnronCacheError({
        message: "Failed to create cache directory",
        path,
        cause: errorMessage(cause),
      }),
  });

const removeDirectory = (path: string): Effect.Effect<void, never> =>
  Effect.tryPromise({
    try: () => rm(path, { recursive: true, force: true }),
    catch: () => undefined,
  }).pipe(Effect.asVoid, Effect.catchAll(() => Effect.void));

const readFileString = (path: string, message: string): Effect.Effect<string, EnronCacheError> =>
  Effect.tryPromise({
    try: () => readFile(path, "utf8"),
    catch: (cause) =>
      new EnronCacheError({
        message,
        path,
        cause: errorMessage(cause),
      }),
  });

const writeFileString = (path: string, content: string, message: string): Effect.Effect<void, EnronCacheError> =>
  Effect.tryPromise({
    try: () => writeFile(path, content, "utf8"),
    catch: (cause) =>
      new EnronCacheError({
        message,
        path,
        cause: errorMessage(cause),
      }),
  }).pipe(Effect.asVoid);

const readFileIfExists = (path: string, message: string): Effect.Effect<O.Option<string>, EnronCacheError> =>
  Effect.tryPromise({
    try: async () => {
      try {
        const content = await readFile(path, "utf8");
        return O.some(content);
      } catch (cause) {
        if (hasCode(cause) && cause.code === "ENOENT") {
          return O.none<string>();
        }
        throw cause;
      }
    },
    catch: (cause) =>
      new EnronCacheError({
        message,
        path,
        cause: errorMessage(cause),
      }),
  });

const pathExists = (path: string): Effect.Effect<boolean, never> =>
  Effect.promise(() =>
    stat(path)
      .then(() => true)
      .catch(() => false)
  ).pipe(Effect.catchAll(() => Effect.succeed(false)));

interface LoadedManifest {
  readonly manifest: CuratedManifestSummary;
  readonly manifestJson: string;
  readonly manifestHash: string;
}

const loadRemoteManifest = (s3DataSource: S3DataSourceService): Effect.Effect<LoadedManifest, EnronCacheDataError> =>
  Effect.gen(function* () {
    const manifestJson = yield* s3DataSource.downloadText(ENRON_CURATED_MANIFEST_URI);
    const manifest = yield* decodeJson(
      CuratedManifestSummary,
      manifestJson,
      "Failed to decode remote curated manifest",
      ENRON_CURATED_MANIFEST_URI
    );

    return {
      manifest,
      manifestJson,
      manifestHash: sha256Hex(manifestJson),
    };
  });

const readLocalManifest = (cacheDirectory: string): Effect.Effect<O.Option<LoadedManifest>, EnronCacheError> =>
  Effect.gen(function* () {
    const path = manifestPath(cacheDirectory);
    const maybeManifestJson = yield* readFileIfExists(path, "Failed to read cached manifest");

    if (O.isNone(maybeManifestJson)) {
      return O.none<LoadedManifest>();
    }

    const manifestJson = maybeManifestJson.value;
    const manifest = yield* decodeJson(CuratedManifestSummary, manifestJson, "Failed to decode cached manifest", path);

    return O.some({
      manifest,
      manifestJson,
      manifestHash: sha256Hex(manifestJson),
    });
  });

const validateCachedArtifacts = (
  cacheDirectory: string,
  manifest: CuratedManifestSummary
): Effect.Effect<ReadonlyArray<string>, EnronCacheError> =>
  Effect.gen(function* () {
    const invalidArtifacts: Array<string> = [];

    for (const artifact of [...manifest.artifacts].sort((left, right) => left.fileName.localeCompare(right.fileName))) {
      const path = artifactPath(cacheDirectory, artifact.fileName);
      const maybeContent = yield* readFileIfExists(path, "Failed to read cached artifact");

      if (O.isNone(maybeContent)) {
        invalidArtifacts.push(artifact.fileName);
        continue;
      }

      const content = maybeContent.value;
      const actualHash = sha256Hex(content);
      const actualBytes = utf8Bytes(content);

      if (actualHash !== artifact.sha256 || actualBytes !== artifact.bytes) {
        invalidArtifacts.push(artifact.fileName);
      }
    }

    return invalidArtifacts;
  });

const resetCacheDirectory = (cacheDirectory: string): Effect.Effect<void, EnronCacheError> =>
  Effect.gen(function* () {
    const exists = yield* pathExists(cacheDirectory);
    if (exists) {
      yield* removeDirectory(cacheDirectory);
    }
    yield* makeDirectory(cacheDirectory);
  });

const downloadCuratedArtifacts = (
  s3DataSource: S3DataSourceService,
  cacheDirectory: string,
  remoteManifest: LoadedManifest
): Effect.Effect<ReadonlyArray<string>, EnronCacheDataError> =>
  Effect.gen(function* () {
    const downloadedArtifacts: Array<string> = [];

    for (const artifact of [...remoteManifest.manifest.artifacts].sort((left, right) => left.fileName.localeCompare(right.fileName))) {
      const artifactUri = `${ENRON_CURATED_S3_PREFIX_URI}/${artifact.fileName}`;
      const artifactContent = yield* s3DataSource.downloadText(artifactUri);

      const actualHash = sha256Hex(artifactContent);
      const actualBytes = utf8Bytes(artifactContent);

      if (actualHash !== artifact.sha256 || actualBytes !== artifact.bytes) {
        return yield* Effect.fail(
          new EnronCacheIntegrityError({
            fileName: artifact.fileName,
            expectedSha256: artifact.sha256,
            actualSha256: actualHash,
            expectedBytes: artifact.bytes,
            actualBytes,
          })
        );
      }

      yield* writeFileString(
        artifactPath(cacheDirectory, artifact.fileName),
        artifactContent,
        "Failed to write curated artifact into cache"
      );

      downloadedArtifacts.push(artifact.fileName);
    }

    yield* writeFileString(manifestPath(cacheDirectory), remoteManifest.manifestJson, "Failed to write curated manifest into cache");

    return downloadedArtifacts;
  });

const syncWithStatus = (
  status: Exclude<CacheSyncStatus, "hit">,
  s3DataSource: S3DataSourceService,
  cacheDirectory: string,
  remoteManifest: LoadedManifest
): Effect.Effect<CuratedCacheSyncResult, EnronCacheDataError> =>
  Effect.gen(function* () {
    yield* resetCacheDirectory(cacheDirectory);
    const downloadedArtifacts = yield* downloadCuratedArtifacts(s3DataSource, cacheDirectory, remoteManifest);

    return {
      status,
      cacheDirectory,
      manifestPath: manifestPath(cacheDirectory),
      manifestHash: remoteManifest.manifestHash,
      manifest: remoteManifest.manifest,
      downloadedArtifacts,
    };
  });

const syncCuratedCacheFromSource = (
  s3DataSource: S3DataSourceService,
  options?: EnronCacheOptions
): Effect.Effect<CuratedCacheSyncResult, EnronCacheDataError> =>
  Effect.gen(function* () {
    const cacheDirectory = resolveCacheDirectory(options);

    const remoteManifest = yield* loadRemoteManifest(s3DataSource);
    const maybeLocalManifest = yield* readLocalManifest(cacheDirectory).pipe(
      Effect.catchTag("EnronCacheError", () => Effect.succeed(O.none<LoadedManifest>()))
    );

    if (O.isNone(maybeLocalManifest)) {
      return yield* syncWithStatus("miss", s3DataSource, cacheDirectory, remoteManifest);
    }

    const localManifest = maybeLocalManifest.value;
    const invalidArtifacts = yield* validateCachedArtifacts(cacheDirectory, localManifest.manifest);

    if (invalidArtifacts.length > 0) {
      return yield* syncWithStatus("artifact-mismatch", s3DataSource, cacheDirectory, remoteManifest);
    }

    if (localManifest.manifestHash !== remoteManifest.manifestHash) {
      return yield* syncWithStatus("manifest-changed", s3DataSource, cacheDirectory, remoteManifest);
    }

    return {
      status: "hit",
      cacheDirectory,
      manifestPath: manifestPath(cacheDirectory),
      manifestHash: remoteManifest.manifestHash,
      manifest: remoteManifest.manifest,
      downloadedArtifacts: [],
    };
  });

export const syncCuratedCache = (
  options?: EnronCacheOptions
): Effect.Effect<CuratedCacheSyncResult, EnronCacheDataError, S3DataSource> =>
  Effect.flatMap(S3DataSource, (s3DataSource) => syncCuratedCacheFromSource(s3DataSource, options));

const readCuratedInfoFromSource = (
  s3DataSource: S3DataSourceService,
  options?: EnronCacheOptions
): Effect.Effect<EnronCuratedInfo, EnronCacheDataError> =>
  Effect.gen(function* () {
    const syncResult = yield* syncCuratedCacheFromSource(s3DataSource, options);

    return {
      cacheStatus: syncResult.status,
      cacheDirectory: syncResult.cacheDirectory,
      manifestPath: syncResult.manifestPath,
      manifestHash: syncResult.manifestHash,
      generatedAt: syncResult.manifest.generatedAt,
      source: syncResult.manifest.source,
      selectedThreadCount: syncResult.manifest.selectedThreadCount,
      selectedMessageCount: syncResult.manifest.selectedMessageCount,
      scoredThreadCount: syncResult.manifest.scoredThreadCount,
      datasetHash: syncResult.manifest.datasetHash,
      artifacts: [...syncResult.manifest.artifacts]
        .sort((left, right) => left.fileName.localeCompare(right.fileName))
        .map((artifact) => ({
          fileName: artifact.fileName,
          path: artifactPath(syncResult.cacheDirectory, artifact.fileName),
          bytes: artifact.bytes,
          sha256: artifact.sha256,
        })),
      downloadedArtifacts: syncResult.downloadedArtifacts,
    };
  });

export const readCuratedInfo = (
  options?: EnronCacheOptions
): Effect.Effect<EnronCuratedInfo, EnronCacheDataError, S3DataSource> =>
  Effect.flatMap(S3DataSource, (s3DataSource) => readCuratedInfoFromSource(s3DataSource, options));

const loadCuratedDocumentsFromSource = (
  s3DataSource: S3DataSourceService,
  options?: EnronCacheOptions
): Effect.Effect<LoadedCuratedDocuments, EnronCacheDataError> =>
  Effect.gen(function* () {
    const syncResult = yield* syncCuratedCacheFromSource(s3DataSource, options);

    const documentsPath = artifactPath(syncResult.cacheDirectory, DOCUMENTS_FILE_NAME);
    const documentsJson = yield* readFileString(documentsPath, "Failed to read cached curated documents");

    const documents = yield* decodeJson(
      S.Array(EnronDocument),
      documentsJson,
      "Failed to decode cached curated documents",
      documentsPath
    );

    return {
      cache: syncResult,
      documentsPath,
      documentsJson,
      documents,
    };
  });

export const loadCuratedDocuments = (
  options?: EnronCacheOptions
): Effect.Effect<LoadedCuratedDocuments, EnronCacheDataError, S3DataSource> =>
  Effect.flatMap(S3DataSource, (s3DataSource) => loadCuratedDocumentsFromSource(s3DataSource, options));

const dataCacheServiceEffect: Effect.Effect<EnronDataCache, never, S3DataSource> = Effect.gen(function* () {
  const s3DataSource = yield* S3DataSource;

  return {
    syncCuratedCache: (options) => syncCuratedCacheFromSource(s3DataSource, options),
    readCuratedInfo: (options) => readCuratedInfoFromSource(s3DataSource, options),
    loadCuratedDocuments: (options) => loadCuratedDocumentsFromSource(s3DataSource, options),
  };
});

export const EnronDataCacheLive: Layer.Layer<EnronDataCache, never, S3DataSource> = Layer.effect(
  EnronDataCache,
  dataCacheServiceEffect
);
