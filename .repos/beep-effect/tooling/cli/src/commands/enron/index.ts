import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  type CuratedCacheSyncResult,
  DEFAULT_ENRON_CACHE_DIRECTORY,
  type EnronCacheOptions,
  type EnronCuratedInfo,
  EnronDataCache,
  EnronDataCacheLive,
  type LoadedCuratedDocuments,
} from "./cache.js";
import {
  type CurateMaildirOptions,
  type CuratorSelectionOptions,
  curateFromCsvFile,
  curateFromMaildir,
  writeCuratedArtifacts,
} from "./curator.js";
import { S3DataSourceLive } from "./s3-client.js";
import type { EnronDocument } from "./schemas.js";

const DEFAULT_CURATE_OUTPUT_DIRECTORY = ".data/enron/curated";

export class EnronCommandError extends S.TaggedError<EnronCommandError>()("EnronCommandError", {
  message: S.String,
  cause: S.optional(S.String),
}) {}

const cacheDirectoryOption = CliOptions.optional(CliOptions.text("cache-dir")).pipe(
  CliOptions.withDescription(`Local cache directory (default: ${DEFAULT_ENRON_CACHE_DIRECTORY})`)
);

const parseLimitOption = CliOptions.optional(CliOptions.integer("limit")).pipe(
  CliOptions.withDescription("Maximum number of curated documents to emit")
);

const csvPathOption = CliOptions.optional(CliOptions.text("csv")).pipe(
  CliOptions.withDescription("Path to Enron CSV source for curation")
);

const maildirPathOption = CliOptions.optional(CliOptions.text("maildir")).pipe(
  CliOptions.withDescription("Path to extracted Enron maildir root for curation")
);

const outputDirectoryOption = CliOptions.text("output-dir").pipe(
  CliOptions.withDefault(DEFAULT_CURATE_OUTPUT_DIRECTORY),
  CliOptions.withDescription("Directory where curated artifacts are written")
);

const maildirLimitOption = CliOptions.optional(CliOptions.integer("maildir-limit")).pipe(
  CliOptions.withDescription("Maximum number of maildir messages to parse during curation")
);

const sourceLabelOption = CliOptions.optional(CliOptions.text("source-label")).pipe(
  CliOptions.withDescription("Override source label written into curated manifest")
);

const normalizeOptionalPositiveInt = (
  value: number | undefined,
  optionName: string
): Effect.Effect<number | undefined, EnronCommandError> =>
  Effect.try({
    try: () => {
      if (value === undefined) {
        return undefined;
      }

      const rounded = Math.floor(value);
      if (rounded <= 0) {
        throw new Error(`--${optionName} must be a positive integer`);
      }

      return rounded;
    },
    catch: (cause) =>
      new EnronCommandError({
        message: `Invalid value for --${optionName}`,
        cause: cause instanceof Error ? cause.message : String(cause),
      }),
  });

const toCacheOptions = (cacheDirectory: O.Option<string>): EnronCacheOptions | undefined =>
  O.isSome(cacheDirectory)
    ? {
        cacheDirectory: cacheDirectory.value,
      }
    : undefined;

const toOptionalSelectionOptions = (sourceLabel: O.Option<string>): CuratorSelectionOptions =>
  O.isSome(sourceLabel)
    ? {
        sourceLabel: sourceLabel.value,
      }
    : {};

const toOptionalMaildirOptions = (
  maildirMessageLimit: number | undefined,
  sourceLabel: O.Option<string>
): CurateMaildirOptions => ({
  ...(maildirMessageLimit !== undefined ? { maildirMessageLimit } : {}),
  ...(O.isSome(sourceLabel) ? { sourceLabel: sourceLabel.value } : {}),
});

const mapCommandError = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  message: string
): Effect.Effect<A, EnronCommandError, R> =>
  effect.pipe(
    Effect.mapError(
      (cause) =>
        new EnronCommandError({
          message,
          cause: String(cause),
        })
    )
  );

export const formatDownloadOutput = (result: CuratedCacheSyncResult): string => {
  const lines = [
    "enron curated dataset downloaded",
    `cacheStatus: ${result.status}`,
    `cacheDirectory: ${result.cacheDirectory}`,
    `manifestPath: ${result.manifestPath}`,
    `selectedThreadCount: ${result.manifest.selectedThreadCount}`,
    `selectedMessageCount: ${result.manifest.selectedMessageCount}`,
    `datasetHash: ${result.manifest.datasetHash}`,
    `downloadedArtifacts: ${result.downloadedArtifacts.length === 0 ? "none" : result.downloadedArtifacts.join(",")}`,
  ];

  return `${lines.join("\n")}\n`;
};

export const formatEnronInfoOutput = (info: EnronCuratedInfo): string => {
  const lines = [
    "enron curated dataset info",
    `cacheStatus: ${info.cacheStatus}`,
    `cacheDirectory: ${info.cacheDirectory}`,
    `manifestPath: ${info.manifestPath}`,
    `manifestHash: ${info.manifestHash}`,
    `generatedAt: ${info.generatedAt}`,
    `source: ${info.source}`,
    `selectedThreadCount: ${info.selectedThreadCount}`,
    `selectedMessageCount: ${info.selectedMessageCount}`,
    `scoredThreadCount: ${info.scoredThreadCount}`,
    `datasetHash: ${info.datasetHash}`,
    `downloadedArtifacts: ${info.downloadedArtifacts.length === 0 ? "none" : info.downloadedArtifacts.join(",")}`,
  ];

  for (const artifact of [...info.artifacts].sort((left, right) => left.fileName.localeCompare(right.fileName))) {
    lines.push(`artifact:${artifact.fileName} bytes=${artifact.bytes} sha256=${artifact.sha256} path=${artifact.path}`);
  }

  return `${lines.join("\n")}\n`;
};

const compareDocuments = (left: EnronDocument, right: EnronDocument): number => {
  const byId = left.id.localeCompare(right.id);
  if (byId !== 0) {
    return byId;
  }

  return left.metadata.messageId.localeCompare(right.metadata.messageId);
};

export const serializeCuratedDocumentsNdjson = (documents: ReadonlyArray<EnronDocument>, limit?: number): string => {
  const sorted = [...documents].sort(compareDocuments);
  const selected = limit === undefined ? sorted : sorted.slice(0, limit);

  if (selected.length === 0) {
    return "";
  }

  return `${selected.map((document) => JSON.stringify(document)).join("\n")}\n`;
};

const handleDownloadCommand = (args: { readonly cacheDirectory: O.Option<string> }) =>
  Effect.gen(function* () {
    const cache = yield* EnronDataCache;
    const result = yield* mapCommandError(
      cache.syncCuratedCache(toCacheOptions(args.cacheDirectory)),
      "Failed to download curated dataset"
    );
    yield* Console.log(formatDownloadOutput(result).trimEnd());
  });

const handleInfoCommand = (args: { readonly cacheDirectory: O.Option<string> }) =>
  Effect.gen(function* () {
    const cache = yield* EnronDataCache;
    const info = yield* mapCommandError(
      cache.readCuratedInfo(toCacheOptions(args.cacheDirectory)),
      "Failed to read curated dataset info"
    );
    yield* Console.log(formatEnronInfoOutput(info).trimEnd());
  });

const handleParseCommand = (args: { readonly cacheDirectory: O.Option<string>; readonly limit: O.Option<number> }) =>
  Effect.gen(function* () {
    const cache = yield* EnronDataCache;
    const limit = yield* normalizeOptionalPositiveInt(O.getOrUndefined(args.limit), "limit");

    const loaded: LoadedCuratedDocuments = yield* mapCommandError(
      cache.loadCuratedDocuments(toCacheOptions(args.cacheDirectory)),
      "Failed to load curated documents from cache"
    );

    const ndjson = serializeCuratedDocumentsNdjson(loaded.documents, limit);
    yield* Effect.sync(() => {
      process.stdout.write(ndjson);
    });
  });

const handleCurateCommand = (args: {
  readonly csvPath: O.Option<string>;
  readonly maildirPath: O.Option<string>;
  readonly outputDirectory: string;
  readonly maildirLimit: O.Option<number>;
  readonly sourceLabel: O.Option<string>;
}) =>
  Effect.gen(function* () {
    const csvPath = O.getOrUndefined(args.csvPath);
    const maildirPath = O.getOrUndefined(args.maildirPath);
    const usingCsv = csvPath !== undefined;
    const usingMaildir = maildirPath !== undefined;

    if (usingCsv === usingMaildir) {
      return yield* Effect.fail(
        new EnronCommandError({
          message: "Provide exactly one source: either --csv or --maildir",
        })
      );
    }

    const maildirLimit = yield* normalizeOptionalPositiveInt(O.getOrUndefined(args.maildirLimit), "maildir-limit");
    const selectionOptions = toOptionalSelectionOptions(args.sourceLabel);
    const maildirOptions = toOptionalMaildirOptions(maildirLimit, args.sourceLabel);

    const curated = usingCsv
      ? yield* mapCommandError(
          curateFromCsvFile(csvPath ?? "", selectionOptions),
          "Failed to curate Enron dataset from CSV source"
        )
      : yield* mapCommandError(
          curateFromMaildir(maildirPath ?? "", maildirOptions),
          "Failed to curate Enron dataset from maildir source"
        );

    const written = yield* mapCommandError(
      writeCuratedArtifacts(curated.serializedArtifacts, args.outputDirectory),
      "Failed to write curated artifacts"
    );

    const lines = [
      "enron curated artifacts written",
      `outputDirectory: ${written.outputDirectory}`,
      `manifestPath: ${written.manifestPath}`,
      `selectedThreadCount: ${curated.selection.selectedThreadCount}`,
      `selectedMessageCount: ${curated.selection.selectedMessageCount}`,
      `datasetHash: ${curated.manifest.datasetHash}`,
    ];

    yield* Console.log(lines.join("\n"));
  });

const downloadCommand = CliCommand.make(
  "download",
  {
    cacheDirectory: cacheDirectoryOption,
  },
  handleDownloadCommand
).pipe(CliCommand.withDescription("Download Enron curated artifacts into local cache"));

const infoCommand = CliCommand.make(
  "info",
  {
    cacheDirectory: cacheDirectoryOption,
  },
  handleInfoCommand
).pipe(CliCommand.withDescription("Display curated dataset counts, hashes, and cache status"));

const parseCommand = CliCommand.make(
  "parse",
  {
    cacheDirectory: cacheDirectoryOption,
    limit: parseLimitOption,
  },
  handleParseCommand
).pipe(CliCommand.withDescription("Emit curated documents as NDJSON for downstream extraction"));

const curateCommand = CliCommand.make(
  "curate",
  {
    csvPath: csvPathOption,
    maildirPath: maildirPathOption,
    outputDirectory: outputDirectoryOption,
    maildirLimit: maildirLimitOption,
    sourceLabel: sourceLabelOption,
  },
  handleCurateCommand
).pipe(CliCommand.withDescription("Run Phase 2 curation pipeline from CSV or maildir input"));

const EnronCommandLayer: Layer.Layer<EnronDataCache, never> = EnronDataCacheLive.pipe(
  Layer.provideMerge(S3DataSourceLive)
);

export const enronCommand = CliCommand.make("enron").pipe(
  CliCommand.withDescription("Enron dataset loader and curation commands"),
  CliCommand.withSubcommands([downloadCommand, infoCommand, parseCommand, curateCommand]),
  CliCommand.provide(EnronCommandLayer)
);
