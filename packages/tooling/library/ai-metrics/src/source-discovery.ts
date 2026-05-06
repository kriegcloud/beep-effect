/**
 * Source discovery for repo AI metrics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoAiMetricsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, FileSystem, Order, Path, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { AiMetricsDeployTarget, AiMetricsTranscriptSource } from "./models.ts";
import { AiMetricsHashSaltStatus, hashPrivateIdentifier, resolveAiMetricsHashSaltStatus } from "./privacy.ts";

const $I = $RepoAiMetricsId.create("source-discovery");

const DEFAULT_MAX_FILES = 200;

/**
 * P1 source discovery availability status.
 *
 * @example
 * ```ts
 * import { AiMetricsSourceStatus } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSourceStatus.Enum.available)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsSourceStatus = LiteralKit(["available", "missing", "unavailable"] as const).annotate(
  $I.annote("AiMetricsSourceStatus", {
    description: "Availability status for a discovered AI metrics source root.",
  })
);

/**
 * Runtime type for {@link AiMetricsSourceStatus}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsSourceStatus = typeof AiMetricsSourceStatus.Type;

/**
 * Role of a discovered source file within the source's local storage.
 *
 * @example
 * ```ts
 * import { AiMetricsSourceRole } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSourceRole.Enum.primary)
 * ```
 * @category models
 * @since 0.0.0
 */
export const AiMetricsSourceRole = LiteralKit(["primary", "subagent", "gateway_metadata"] as const).annotate(
  $I.annote("AiMetricsSourceRole", {
    description: "Role of a discovered source file or metadata record.",
  })
);

/**
 * Runtime type for {@link AiMetricsSourceRole}.
 *
 * @category models
 * @since 0.0.0
 */
export type AiMetricsSourceRole = typeof AiMetricsSourceRole.Type;

/**
 * Input for local AI metrics source discovery.
 *
 * @example
 * ```ts
 * import { AiMetricsSourceDiscoveryInput } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSourceDiscoveryInput)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsSourceDiscoveryInput extends S.Class<AiMetricsSourceDiscoveryInput>(
  $I`AiMetricsSourceDiscoveryInput`
)(
  {
    claudeProjectsRoot: S.optionalKey(S.String),
    codexSessionsRoot: S.optionalKey(S.String),
    hashSalt: S.optionalKey(S.String),
    homeDir: S.String,
    includeAll: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    maxFiles: S.Number.pipe(
      S.withConstructorDefault(Effect.succeed(DEFAULT_MAX_FILES)),
      S.withDecodingDefaultKey(Effect.succeed(DEFAULT_MAX_FILES))
    ),
    openClawUnitPath: S.optionalKey(S.String),
    repoRoot: S.String,
    sinceEpochMillis: S.optionalKey(S.Number),
    target: AiMetricsDeployTarget.pipe(
      S.withConstructorDefault(Effect.succeed(AiMetricsDeployTarget.Enum.local)),
      S.withDecodingDefaultKey(Effect.succeed(AiMetricsDeployTarget.Enum.local))
    ),
  },
  $I.annote("AiMetricsSourceDiscoveryInput", {
    description: "Configurable roots and scan bounds for local AI metrics source discovery.",
  })
) {}

/**
 * One transcript or source metadata file discovered for AI metrics.
 *
 * @example
 * ```ts
 * import { AiMetricsDiscoveredTranscriptFile } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDiscoveredTranscriptFile)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsDiscoveredTranscriptFile extends S.Class<AiMetricsDiscoveredTranscriptFile>(
  $I`AiMetricsDiscoveredTranscriptFile`
)(
  {
    modifiedAtMillis: S.Number,
    sessionIdHash: S.optionalKey(S.String),
    sizeBytes: S.Number,
    sourceKind: AiMetricsTranscriptSource,
    sourcePathHash: S.String,
    sourceRole: AiMetricsSourceRole,
  },
  $I.annote("AiMetricsDiscoveredTranscriptFile", {
    description: "Discovered local source file with private identifiers represented by salted hashes.",
  })
) {}

/**
 * Source-level discovery summary.
 *
 * @example
 * ```ts
 * import { AiMetricsDiscoveredSource } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsDiscoveredSource)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsDiscoveredSource extends S.Class<AiMetricsDiscoveredSource>($I`AiMetricsDiscoveredSource`)(
  {
    fileCount: S.Number,
    files: S.Array(AiMetricsDiscoveredTranscriptFile),
    message: S.optionalKey(S.String),
    newestModifiedAtMillis: S.optionalKey(S.Number),
    rootPathHash: S.String,
    sourceKind: AiMetricsTranscriptSource,
    status: AiMetricsSourceStatus,
  },
  $I.annote("AiMetricsDiscoveredSource", {
    description: "Discovery summary for one local AI-agent transcript source.",
  })
) {}

/**
 * Complete P1 source discovery result.
 *
 * @example
 * ```ts
 * import { AiMetricsSourceDiscoveryResult } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSourceDiscoveryResult)
 * ```
 * @category models
 * @since 0.0.0
 */
export class AiMetricsSourceDiscoveryResult extends S.Class<AiMetricsSourceDiscoveryResult>(
  $I`AiMetricsSourceDiscoveryResult`
)(
  {
    discoveredFileCount: S.Number,
    generatedAtEpochMillis: S.Number,
    hashSaltStatus: AiMetricsHashSaltStatus,
    homeDirHash: S.String,
    includeAll: S.Boolean,
    maxFiles: S.Number,
    repoRootHash: S.String,
    sinceEpochMillis: S.optionalKey(S.Number),
    sources: S.Array(AiMetricsDiscoveredSource),
    target: AiMetricsDeployTarget,
  },
  $I.annote("AiMetricsSourceDiscoveryResult", {
    description: "Machine-readable source discovery output for the AI metrics local smoke target.",
  })
) {}

/**
 * Error raised by source discovery.
 *
 * @example
 * ```ts
 * import { AiMetricsSourceDiscoveryError } from "@beep/repo-ai-metrics"
 * console.log(AiMetricsSourceDiscoveryError)
 * ```
 * @category errors
 * @since 0.0.0
 */
export class AiMetricsSourceDiscoveryError extends TaggedErrorClass<AiMetricsSourceDiscoveryError>(
  $I`AiMetricsSourceDiscoveryError`
)(
  "AiMetricsSourceDiscoveryError",
  {
    cause: S.Unknown,
    message: S.String,
  },
  $I.annote("AiMetricsSourceDiscoveryError", {
    description: "Typed failure raised by AI metrics source discovery.",
  })
) {}

const encodeSourceDiscoveryJson = S.encodeUnknownEffect(S.fromJsonString(AiMetricsSourceDiscoveryResult));

const byPathHashAscending: Order.Order<AiMetricsDiscoveredTranscriptFile> = Order.mapInput(
  Order.String,
  (file) => file.sourcePathHash
);
const byModifiedDescending: Order.Order<AiMetricsDiscoveredTranscriptFile> = Order.mapInput(
  Order.Number,
  (file) => -file.modifiedAtMillis
);

const fileSystemFailure = (message: string, cause: unknown): AiMetricsSourceDiscoveryError =>
  new AiMetricsSourceDiscoveryError({ cause, message });

const normalizedRelativePath = (pathApi: Path.Path, root: string, filePath: string): string =>
  pipe(pathApi.relative(root, filePath), Str.replace(/\\/gu, "/"));

const repoPathToClaudeProjectName: (repoRoot: string) => string = Str.replace(/[/\\]/gu, "-");

const optionalModifiedAtMillis = (info: FileSystem.File.Info): O.Option<number> =>
  pipe(
    info.mtime,
    O.map((mtime) => mtime.getTime())
  );

const modifiedAtMillis = (info: FileSystem.File.Info): number =>
  pipe(
    optionalModifiedAtMillis(info),
    O.getOrElse(() => 0)
  );

const shouldIncludeModifiedAt =
  (input: AiMetricsSourceDiscoveryInput) =>
  (info: FileSystem.File.Info): boolean =>
    input.includeAll || input.sinceEpochMillis === undefined || modifiedAtMillis(info) >= input.sinceEpochMillis;

const sourceRoleFor = (relativePath: string): AiMetricsSourceRole =>
  Str.includes("/subagents/")(relativePath) ? AiMetricsSourceRole.Enum.subagent : AiMetricsSourceRole.Enum.primary;

const sessionIdFromPath = (pathApi: Path.Path, sourcePath: string): string =>
  pipe(pathApi.basename(sourcePath), Str.replace(/\.jsonl$/u, ""));

const statOption = Effect.fn("AiMetrics.statOption")(function* (pathName: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs.stat(pathName).pipe(Effect.option);
});

const collectJsonlFiles = Effect.fn("AiMetrics.collectJsonlFiles")(function* (
  root: string
): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const info = yield* statOption(root);

  if (O.isNone(info) || info.value.type !== "Directory") {
    return A.empty<string>();
  }

  const walk = Effect.fnUntraced(function* (
    currentPath: string
  ): Effect.fn.Return<ReadonlyArray<string>, never, FileSystem.FileSystem | Path.Path> {
    const currentInfo = yield* statOption(currentPath);
    if (O.isNone(currentInfo)) {
      return A.empty<string>();
    }

    if (currentInfo.value.type === "File") {
      return Str.endsWith(".jsonl")(currentPath) ? A.of(currentPath) : A.empty<string>();
    }

    if (currentInfo.value.type !== "Directory") {
      return A.empty<string>();
    }

    const entries = yield* fs.readDirectory(currentPath).pipe(Effect.orElseSucceed(A.empty<string>));
    let files = A.empty<string>();
    for (const entry of entries) {
      files = A.appendAll(files, yield* walk(pathApi.join(currentPath, entry)));
    }

    return files;
  });

  return yield* walk(root);
});

const makeDiscoveredTranscriptFile = Effect.fn("AiMetrics.makeDiscoveredTranscriptFile")(function* ({
  hashSalt,
  root,
  sourceKind,
  sourcePath,
}: {
  readonly hashSalt?: string;
  readonly root: string;
  readonly sourceKind: AiMetricsTranscriptSource;
  readonly sourcePath: string;
}) {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const info = yield* fs
    .stat(sourcePath)
    .pipe(
      Effect.mapError((cause) => fileSystemFailure(`Failed to stat AI metrics source file "${sourcePath}".`, cause))
    );
  const relativePath = normalizedRelativePath(pathApi, root, sourcePath);

  return new AiMetricsDiscoveredTranscriptFile({
    modifiedAtMillis: modifiedAtMillis(info),
    sessionIdHash: yield* hashPrivateIdentifier(sessionIdFromPath(pathApi, sourcePath), hashSalt),
    sizeBytes: globalThis.Number(info.size),
    sourceKind,
    sourcePathHash: yield* hashPrivateIdentifier(sourcePath, hashSalt),
    sourceRole: sourceRoleFor(relativePath),
  });
});

const newestModifiedAtFields = (
  files: ReadonlyArray<AiMetricsDiscoveredTranscriptFile>
): { readonly newestModifiedAtMillis?: number } => {
  const newest = pipe(
    files,
    A.map((file) => file.modifiedAtMillis),
    A.sort(Order.mapInput(Order.Number, (value: number) => -value)),
    A.head
  );

  return O.isSome(newest) ? { newestModifiedAtMillis: newest.value } : {};
};

const discoverJsonlSource = Effect.fn("AiMetrics.discoverJsonlSource")(function* ({
  input,
  root,
  sourceKind,
}: {
  readonly input: AiMetricsSourceDiscoveryInput;
  readonly root: string;
  readonly sourceKind: AiMetricsTranscriptSource;
}) {
  const rootInfo = yield* statOption(root);
  const rootPathHash = yield* hashPrivateIdentifier(root, input.hashSalt);

  if (O.isNone(rootInfo)) {
    return new AiMetricsDiscoveredSource({
      fileCount: 0,
      files: [],
      message: "source root does not exist",
      rootPathHash,
      sourceKind,
      status: AiMetricsSourceStatus.Enum.missing,
    });
  }

  if (rootInfo.value.type !== "Directory") {
    return new AiMetricsDiscoveredSource({
      fileCount: 0,
      files: [],
      message: "source root is not a directory",
      rootPathHash,
      sourceKind,
      status: AiMetricsSourceStatus.Enum.unavailable,
    });
  }

  const fs = yield* FileSystem.FileSystem;
  const allFiles = yield* collectJsonlFiles(root);
  const filtered = yield* Effect.forEach(
    allFiles,
    Effect.fnUntraced(function* (sourcePath) {
      const info = yield* fs.stat(sourcePath).pipe(Effect.option);
      if (O.isNone(info) || info.value.type !== "File" || !shouldIncludeModifiedAt(input)(info.value)) {
        return O.none<AiMetricsDiscoveredTranscriptFile>();
      }

      return O.some(
        yield* makeDiscoveredTranscriptFile({
          root,
          sourceKind,
          sourcePath,
          ...(input.hashSalt === undefined ? {} : { hashSalt: input.hashSalt }),
        })
      );
    }),
    { concurrency: 16 }
  );
  const files = pipe(
    A.getSomes(filtered),
    A.sort(byPathHashAscending),
    A.sort(byModifiedDescending),
    A.take(input.maxFiles)
  );

  return new AiMetricsDiscoveredSource({
    fileCount: A.length(files),
    files,
    rootPathHash,
    sourceKind,
    status: AiMetricsSourceStatus.Enum.available,
    ...newestModifiedAtFields(files),
  });
});

const discoverOpenClawSource = Effect.fn("AiMetrics.discoverOpenClawSource")(function* (
  input: AiMetricsSourceDiscoveryInput
) {
  const pathApi = yield* Path.Path;
  const unitPath =
    input.openClawUnitPath ?? pathApi.join(input.homeDir, ".config/systemd/user/openclaw-gateway.service");
  const unitInfo = yield* statOption(unitPath);
  const rootPathHash = yield* hashPrivateIdentifier(unitPath, input.hashSalt);

  if (O.isNone(unitInfo)) {
    return new AiMetricsDiscoveredSource({
      fileCount: 0,
      files: [],
      message: "OpenClaw user systemd gateway unit was not found",
      rootPathHash,
      sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
      status: AiMetricsSourceStatus.Enum.missing,
    });
  }

  if (unitInfo.value.type !== "File") {
    return new AiMetricsDiscoveredSource({
      fileCount: 0,
      files: [],
      message: "OpenClaw user systemd gateway path is not a file",
      rootPathHash,
      sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
      status: AiMetricsSourceStatus.Enum.unavailable,
    });
  }

  const file = new AiMetricsDiscoveredTranscriptFile({
    modifiedAtMillis: modifiedAtMillis(unitInfo.value),
    sessionIdHash: yield* hashPrivateIdentifier("openclaw-gateway.service", input.hashSalt),
    sizeBytes: globalThis.Number(unitInfo.value.size),
    sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
    sourcePathHash: yield* hashPrivateIdentifier(unitPath, input.hashSalt),
    sourceRole: AiMetricsSourceRole.Enum.gateway_metadata,
  });

  return new AiMetricsDiscoveredSource({
    fileCount: 1,
    files: [file],
    message: "OpenClaw discovery is limited to safe gateway metadata in P1",
    newestModifiedAtMillis: file.modifiedAtMillis,
    rootPathHash,
    sourceKind: AiMetricsTranscriptSource.Enum.openclaw,
    status: AiMetricsSourceStatus.Enum.available,
  });
});

/**
 * Discover local AI metrics transcript sources for the smoke target.
 *
 * @category services
 * @since 0.0.0
 */
export const discoverAiMetricsSources = Effect.fn("AiMetrics.discoverAiMetricsSources")(function* (
  input: AiMetricsSourceDiscoveryInput
) {
  const pathApi = yield* Path.Path;
  const repoRoot = pathApi.resolve(input.repoRoot);
  const homeDir = pathApi.resolve(input.homeDir);
  const codexRoot = input.codexSessionsRoot ?? pathApi.join(homeDir, ".codex/sessions");
  const claudeRoot =
    input.claudeProjectsRoot ?? pathApi.join(homeDir, ".claude/projects", repoPathToClaudeProjectName(repoRoot));
  const generatedAtEpochMillis = yield* Clock.currentTimeMillis;
  const sources = yield* Effect.all(
    [
      discoverJsonlSource({
        input,
        root: codexRoot,
        sourceKind: AiMetricsTranscriptSource.Enum.codex,
      }),
      discoverJsonlSource({
        input,
        root: claudeRoot,
        sourceKind: AiMetricsTranscriptSource.Enum.claude,
      }),
      discoverOpenClawSource(input),
    ],
    { concurrency: 3 }
  );

  return new AiMetricsSourceDiscoveryResult({
    discoveredFileCount: pipe(
      sources,
      A.map((source) => source.fileCount),
      A.reduce(0, (left, right) => left + right)
    ),
    generatedAtEpochMillis,
    hashSaltStatus: resolveAiMetricsHashSaltStatus(input.hashSalt),
    homeDirHash: yield* hashPrivateIdentifier(homeDir, input.hashSalt),
    includeAll: input.includeAll,
    maxFiles: input.maxFiles,
    repoRootHash: yield* hashPrivateIdentifier(repoRoot, input.hashSalt),
    sources,
    target: input.target,
    ...(input.sinceEpochMillis === undefined ? {} : { sinceEpochMillis: input.sinceEpochMillis }),
  });
});

/**
 * Render a source discovery result as JSON.
 *
 * @category utilities
 * @since 0.0.0
 */
export const sourceDiscoveryToJson: (
  result: AiMetricsSourceDiscoveryResult
) => Effect.Effect<string, AiMetricsSourceDiscoveryError> = Effect.fn("AiMetrics.sourceDiscoveryToJson")(
  function* (result) {
    return yield* encodeSourceDiscoveryJson(result).pipe(
      Effect.mapError(
        (cause) =>
          new AiMetricsSourceDiscoveryError({
            cause,
            message: "Failed to encode AI metrics source discovery result as JSON.",
          })
      )
    );
  }
);
