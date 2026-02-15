import { createHash } from "node:crypto";
import { basename, join } from "node:path";
import * as ProcessCommand from "@effect/platform/Command";
import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { threadToEnronDocuments } from "./document-bridge.js";
import type { PlatformError, BadArgument, SystemError } from "@effect/platform/Error";
import {
  EnronFileError,
  type EnronParseError,
  makeDeterministicEmailId,
  parseCsvContent,
  parseCsvFile,
  parseEmail,
} from "./parser.js";
import type { EnronDocument, EnronEmail, EnronThread } from "./schemas.js";
import {
  DEFAULT_THREAD_SCORE_WEIGHTS,
  THREAD_DIVERSITY_CATEGORIES,
  type ScoredEnronThread,
  type ThreadDiversityCategory,
  type ThreadScorerOptions,
  type ThreadScoreWeights,
  compareScoredThreads,
  scoreThreads,
} from "./thread-scorer.js";
import { reconstructThreads } from "./thread-reconstructor.js";

export const ENRON_RAW_DATASET_URI = "s3://static.vaultctx.com/todox/test-data/enron/raw/enron_mail_20150507.tar.gz";
export const ENRON_CURATED_PREFIX_URI = "s3://static.vaultctx.com/todox/test-data/enron/curated";

const DEFAULT_MIN_MESSAGE_COUNT = 1_000;
const DEFAULT_TARGET_MESSAGE_COUNT = 2_500;
const DEFAULT_MAX_MESSAGE_COUNT = 5_000;
const DEFAULT_MIN_THREADS_PER_CATEGORY = 1;
const DEFAULT_PARSE_CONCURRENCY = 64;

const THREADS_FILE = "threads.json";
const DOCUMENTS_FILE = "documents.json";
const MANIFEST_FILE = "manifest.json";

export class EnronCurationError extends S.TaggedError<EnronCurationError>()("EnronCurationError", {
  message: S.String,
  cause: S.optional(S.String),
  path: S.optional(S.String),
}) {}

export class EnronCurationUploadError extends S.TaggedError<EnronCurationUploadError>()("EnronCurationUploadError", {
  message: S.String,
  sourcePath: S.String,
  destination: S.String,
  cause: S.optional(S.String),
}) {}

export interface CuratorSelectionOptions {
  readonly minMessageCount?: number;
  readonly targetMessageCount?: number;
  readonly maxMessageCount?: number;
  readonly minimumThreadsPerCategory?: number;
  readonly scoring?: ThreadScorerOptions;
  readonly sourceLabel?: string;
}

export interface CurateMaildirOptions extends CuratorSelectionOptions {
  readonly maildirMessageLimit?: number;
  readonly parseConcurrency?: number;
}

export type ThreadCategoryCoverage = Record<ThreadDiversityCategory, number>;

export interface CuratedSelectionCriteriaSummary {
  readonly messageBounds: {
    readonly min: number;
    readonly target: number;
    readonly max: number;
  };
  readonly minimumThreadsPerCategory: number;
  readonly diversityCategories: ReadonlyArray<ThreadDiversityCategory>;
  readonly scoringWeights: ThreadScoreWeights;
  readonly deterministicTieBreakers: ReadonlyArray<string>;
}

export interface CuratedThreadSelection {
  readonly scoredThreadCount: number;
  readonly selectedThreads: ReadonlyArray<ScoredEnronThread>;
  readonly selectedThreadCount: number;
  readonly selectedMessageCount: number;
  readonly selectedCategoryCoverage: ThreadCategoryCoverage;
  readonly availableCategoryCoverage: ThreadCategoryCoverage;
  readonly criteria: CuratedSelectionCriteriaSummary;
}

export interface CuratedMessageRecord {
  readonly id: string;
  readonly messageId: string;
  readonly date: string;
  readonly subject: string;
  readonly from: string;
  readonly to: ReadonlyArray<string>;
  readonly cc: ReadonlyArray<string>;
  readonly bcc: ReadonlyArray<string>;
  readonly body: string;
  readonly folder: string;
  readonly user: string;
  readonly inReplyTo?: undefined | string;
  readonly references: ReadonlyArray<string>;
}

export interface CuratedThreadRecord {
  readonly threadId: string;
  readonly score: number;
  readonly categories: ReadonlyArray<ThreadDiversityCategory>;
  readonly breakdown: ScoredEnronThread["breakdown"];
  readonly participants: ReadonlyArray<string>;
  readonly depth: number;
  readonly messageCount: number;
  readonly dateRange: {
    readonly start: string;
    readonly end: string;
  };
  readonly messages: ReadonlyArray<CuratedMessageRecord>;
}

export interface CuratedManifestArtifact {
  readonly fileName: string;
  readonly bytes: number;
  readonly sha256: string;
}

export interface CuratedManifest {
  readonly version: number;
  readonly generatedAt: string;
  readonly source: string;
  readonly selectedThreadCount: number;
  readonly selectedMessageCount: number;
  readonly scoredThreadCount: number;
  readonly selectionCriteriaSummary: CuratedSelectionCriteriaSummary;
  readonly selectedCategoryCoverage: ThreadCategoryCoverage;
  readonly availableCategoryCoverage: ThreadCategoryCoverage;
  readonly topThreads: ReadonlyArray<{
    readonly threadId: string;
    readonly score: number;
    readonly messageCount: number;
    readonly categories: ReadonlyArray<ThreadDiversityCategory>;
  }>;
  readonly datasetHash: string;
  readonly artifacts: ReadonlyArray<CuratedManifestArtifact>;
}

export interface SerializedCuratedArtifacts {
  readonly threadsFileName: string;
  readonly threadsJson: string;
  readonly documentsFileName: string;
  readonly documentsJson: string;
  readonly manifestFileName: string;
  readonly manifestJson: string;
}

export interface CuratedDatasetResult {
  readonly selection: CuratedThreadSelection;
  readonly curatedThreads: ReadonlyArray<CuratedThreadRecord>;
  readonly curatedDocuments: ReadonlyArray<EnronDocument>;
  readonly manifest: CuratedManifest;
  readonly serializedArtifacts: SerializedCuratedArtifacts;
}

export interface WrittenCuratedArtifacts {
  readonly outputDirectory: string;
  readonly threadsPath: string;
  readonly documentsPath: string;
  readonly manifestPath: string;
}

export interface UploadedCuratedArtifacts {
  readonly destinationUri: string;
  readonly uploadedUris: ReadonlyArray<string>;
}

export interface UploadCuratedArtifactsOptions {
  readonly destinationUri?: string;
  readonly awsExecutable?: string;
}

const createCoverageRecord = (): ThreadCategoryCoverage => ({
  financial: 0,
  actionItems: 0,
  multiParty: 0,
  deepThread: 0,
  forwardedChain: 0,
  lengthDiversity: 0,
});

const toPositiveInt = (value: number | undefined, fallback: number): number => {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }

  const rounded = Math.floor(value);
  return rounded <= 0 ? fallback : rounded;
};

const normalizeBounds = (options?: CuratorSelectionOptions) => {
  const min = toPositiveInt(options?.minMessageCount, DEFAULT_MIN_MESSAGE_COUNT);
  const maxCandidate = toPositiveInt(options?.maxMessageCount, DEFAULT_MAX_MESSAGE_COUNT);
  const max = Math.max(maxCandidate, min);

  const targetCandidate = toPositiveInt(options?.targetMessageCount, DEFAULT_TARGET_MESSAGE_COUNT);
  const target = Math.min(max, Math.max(min, targetCandidate));

  return { min, target, max } as const;
};

const sha256Hex = (content: string): string => createHash("sha256").update(content, "utf8").digest("hex");

const byteLength = (content: string): number => Buffer.byteLength(content, "utf8");

const serializeJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const addCoverage = (coverage: ThreadCategoryCoverage, categories: ReadonlyArray<ThreadDiversityCategory>): void => {
  for (const category of categories) {
    coverage[category] += 1;
  }
};

const computeAvailableCoverage = (threads: ReadonlyArray<ScoredEnronThread>): ThreadCategoryCoverage => {
  const coverage = createCoverageRecord();

  for (const thread of threads) {
    addCoverage(coverage, thread.categories);
  }

  return coverage;
};

const selectPreferredCategory = (
  categories: ReadonlyArray<ThreadDiversityCategory>,
  currentCoverage: ThreadCategoryCoverage
): ThreadDiversityCategory | undefined => {
  if (categories.length === 0) {
    return undefined;
  }

  let selected = categories[0]!;
  for (const category of categories.slice(1)) {
    if (currentCoverage[category] < currentCoverage[selected]) {
      selected = category;
    }
  }

  return selected;
};

const toCuratedMessageRecord = (message: EnronEmail): CuratedMessageRecord => ({
  id: makeDeterministicEmailId(message.messageId),
  messageId: message.messageId,
  date: message.date.toISOString(),
  subject: message.subject,
  from: message.from,
  to: message.to,
  cc: message.cc,
  bcc: message.bcc,
  body: message.body,
  folder: message.folder,
  user: message.user,
  inReplyTo: message.inReplyTo,
  references: message.references,
});

const toCuratedThreadRecord = (scoredThread: ScoredEnronThread): CuratedThreadRecord => ({
  threadId: scoredThread.thread.threadId,
  score: scoredThread.score,
  categories: scoredThread.categories,
  breakdown: scoredThread.breakdown,
  participants: scoredThread.thread.participants,
  depth: scoredThread.thread.depth,
  messageCount: scoredThread.thread.messages.length,
  dateRange: {
    start: scoredThread.thread.dateRange.start.toISOString(),
    end: scoredThread.thread.dateRange.end.toISOString(),
  },
  messages: scoredThread.thread.messages.map(toCuratedMessageRecord),
});

const datasetSeed = (selectedThreads: ReadonlyArray<ScoredEnronThread>): string =>
  selectedThreads
    .map((thread) => {
      const messageSeed = thread.thread.messages.map((message) => message.messageId).join(",");
      return `${thread.thread.threadId}:${messageSeed}`;
    })
    .join("|");

const buildSerializedArtifacts = (
  selection: CuratedThreadSelection,
  curatedThreads: ReadonlyArray<CuratedThreadRecord>,
  curatedDocuments: ReadonlyArray<EnronDocument>,
  sourceLabel: string
): { readonly manifest: CuratedManifest; readonly serialized: SerializedCuratedArtifacts } => {
  const threadsJson = serializeJson(curatedThreads);
  const documentsJson = serializeJson(curatedDocuments);

  const threadsArtifact: CuratedManifestArtifact = {
    fileName: THREADS_FILE,
    bytes: byteLength(threadsJson),
    sha256: sha256Hex(threadsJson),
  };

  const documentsArtifact: CuratedManifestArtifact = {
    fileName: DOCUMENTS_FILE,
    bytes: byteLength(documentsJson),
    sha256: sha256Hex(documentsJson),
  };

  const manifest: CuratedManifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    source: sourceLabel,
    selectedThreadCount: selection.selectedThreadCount,
    selectedMessageCount: selection.selectedMessageCount,
    scoredThreadCount: selection.scoredThreadCount,
    selectionCriteriaSummary: selection.criteria,
    selectedCategoryCoverage: selection.selectedCategoryCoverage,
    availableCategoryCoverage: selection.availableCategoryCoverage,
    topThreads: selection.selectedThreads.slice(0, 25).map((thread) => ({
      threadId: thread.thread.threadId,
      score: thread.score,
      messageCount: thread.thread.messages.length,
      categories: thread.categories,
    })),
    datasetHash: sha256Hex(datasetSeed(selection.selectedThreads)),
    artifacts: [threadsArtifact, documentsArtifact],
  };

  return {
    manifest,
    serialized: {
      threadsFileName: THREADS_FILE,
      threadsJson,
      documentsFileName: DOCUMENTS_FILE,
      documentsJson,
      manifestFileName: MANIFEST_FILE,
      manifestJson: serializeJson(manifest),
    },
  };
};

const relativeMaildirMetadata = (relativePath: string): { readonly folder: string; readonly user: string } => {
  const parts = relativePath.split("/");
  const user = parts[0] === undefined || parts[0].length === 0 ? "unknown" : parts[0];
  const folder = parts.length <= 2 ? "unknown" : parts.slice(1, -1).join("/");
  return { folder, user };
};

const collectMaildirFiles = (
  fs: FileSystem.FileSystem,
  dirPath: string,
  limit: number | undefined
): Effect.Effect<ReadonlyArray<string>, EnronFileError | PlatformError> =>
  Effect.gen(function* () {
    const files: Array<string> = [];

    const walk = (directory: string): Effect.Effect<void, EnronFileError> =>
      Effect.gen(function* () {
        if (limit !== undefined && files.length >= limit) {
          return;
        }

        const entries = yield* fs.readDirectory(directory).pipe(
          Effect.mapError(
            (cause) =>
              new EnronFileError({
                path: directory,
                message: "Failed to read maildir directory",
                cause: String(cause),
              })
          )
        );

        const sortedEntries = [...entries].sort((left, right) => left.localeCompare(right));

        for (const entry of sortedEntries) {
          if (limit !== undefined && files.length >= limit) {
            break;
          }

          const fullPath = `${directory}/${entry}`;
          const stat = yield* fs.stat(fullPath).pipe(
            Effect.mapError(
              (cause) =>
                new EnronFileError({
                  path: fullPath,
                  message: "Failed to stat maildir path",
                  cause: String(cause),
                })
            )
          );

          if (stat.type === "Directory") {
            yield* walk(fullPath);
            continue;
          }

          if (stat.type === "File") {
            files.push(fullPath);
          }
        }
      });

    const exists = yield* fs.exists(dirPath);
    if (!exists) {
      return yield* Effect.fail(
        new EnronFileError({
          path: dirPath,
          message: `Maildir not found: ${dirPath}`,
        })
      );
    }

    yield* walk(dirPath);
    return files;
  });

const parseMaildirForCuration = (
  dirPath: string,
  options?: CurateMaildirOptions
): Effect.Effect<ReadonlyArray<EnronEmail>, EnronFileError | EnronParseError | BadArgument | SystemError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const limit = options?.maildirMessageLimit;
    const files = yield* collectMaildirFiles(fs, dirPath, limit);
    const parseConcurrency = toPositiveInt(options?.parseConcurrency, DEFAULT_PARSE_CONCURRENCY);

    return yield* Effect.forEach(
      files,
      (absolutePath) =>
        Effect.gen(function* () {
          const raw = yield* fs.readFileString(absolutePath).pipe(
            Effect.mapError(
              (cause) =>
                new EnronFileError({
                  path: absolutePath,
                  message: "Failed to read maildir email",
                  cause: String(cause),
                })
            )
          );

          const prefix = `${dirPath}/`;
          const relativePath = absolutePath.startsWith(prefix) ? absolutePath.slice(prefix.length) : absolutePath;
          const metadata = relativeMaildirMetadata(relativePath);

          return yield* parseEmail(raw, metadata);
        }),
      { concurrency: parseConcurrency }
    );
  });

export const selectCuratedThreads = (
  scoredThreads: ReadonlyArray<ScoredEnronThread>,
  options?: CuratorSelectionOptions
): CuratedThreadSelection => {
  const sorted = [...scoredThreads].sort(compareScoredThreads);
  const bounds = normalizeBounds(options);
  const minimumThreadsPerCategory = toPositiveInt(options?.minimumThreadsPerCategory, DEFAULT_MIN_THREADS_PER_CATEGORY);
  const scoringWeights = options?.scoring?.weights ?? DEFAULT_THREAD_SCORE_WEIGHTS;

  const selected: Array<ScoredEnronThread> = [];
  const selectedIds = new Set<string>();
  let selectedMessageCount = 0;

  const selectedCoverage = createCoverageRecord();
  const availableCoverage = computeAvailableCoverage(sorted);

  const canFit = (thread: ScoredEnronThread): boolean => selectedMessageCount + thread.thread.messages.length <= bounds.max;

  const trySelect = (thread: ScoredEnronThread): boolean => {
    if (selectedIds.has(thread.thread.threadId) || !canFit(thread)) {
      return false;
    }

    selected.push(thread);
    selectedIds.add(thread.thread.threadId);
    selectedMessageCount += thread.thread.messages.length;
    addCoverage(selectedCoverage, thread.categories);
    return true;
  };

  for (const category of THREAD_DIVERSITY_CATEGORIES) {
    let selectedForCategory = 0;

    for (const thread of sorted) {
      if (selectedForCategory >= minimumThreadsPerCategory) {
        break;
      }

      if (!thread.categories.includes(category)) {
        continue;
      }

      if (trySelect(thread)) {
        selectedForCategory += 1;
      }
    }
  }

  const availableCategories = THREAD_DIVERSITY_CATEGORIES.filter((category) => availableCoverage[category] > 0);

  const findCandidate = (preferredCategory?: ThreadDiversityCategory): ScoredEnronThread | undefined => {
    if (preferredCategory !== undefined) {
      const preferred = sorted.find(
        (thread) =>
          !selectedIds.has(thread.thread.threadId) &&
          thread.categories.includes(preferredCategory) &&
          selectedMessageCount + thread.thread.messages.length <= bounds.max
      );

      if (preferred !== undefined) {
        return preferred;
      }
    }

    return sorted.find(
      (thread) => !selectedIds.has(thread.thread.threadId) && selectedMessageCount + thread.thread.messages.length <= bounds.max
    );
  };

  while (selectedMessageCount < bounds.target) {
    const preferredCategory = selectPreferredCategory(availableCategories, selectedCoverage);
    const candidate = findCandidate(preferredCategory);

    if (candidate === undefined || !trySelect(candidate)) {
      break;
    }
  }

  while (selectedMessageCount < bounds.min) {
    const candidate = findCandidate();
    if (candidate === undefined || !trySelect(candidate)) {
      break;
    }
  }

  const orderedSelected = [...selected].sort(compareScoredThreads);

  return {
    scoredThreadCount: sorted.length,
    selectedThreads: orderedSelected,
    selectedThreadCount: orderedSelected.length,
    selectedMessageCount,
    selectedCategoryCoverage: selectedCoverage,
    availableCategoryCoverage: availableCoverage,
    criteria: {
      messageBounds: bounds,
      minimumThreadsPerCategory,
      diversityCategories: THREAD_DIVERSITY_CATEGORIES,
      scoringWeights,
      deterministicTieBreakers: ["score(desc)", "messageCount(desc)", "participantCount(desc)", "dateRange.start(asc)", "threadId(asc)"],
    },
  };
};

export const curateFromThreads = (
  threads: ReadonlyArray<EnronThread>,
  options?: CuratorSelectionOptions
): Effect.Effect<CuratedDatasetResult, EnronCurationError> =>
  Effect.gen(function* () {
    const scoredThreads = scoreThreads(threads, options?.scoring);
    const selection = selectCuratedThreads(scoredThreads, options);
    const curatedThreads = selection.selectedThreads.map(toCuratedThreadRecord);

    const nestedDocuments = yield* Effect.forEach(selection.selectedThreads, (thread) => threadToEnronDocuments(thread.thread), {
      concurrency: "unbounded",
    }).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationError({
            message: "Failed to map selected threads into curated Enron documents",
            cause: String(cause),
          })
      )
    );

    const curatedDocuments = A.flatten(nestedDocuments);

    const sourceLabel = options?.sourceLabel ?? ENRON_RAW_DATASET_URI;
    const { manifest, serialized } = buildSerializedArtifacts(selection, curatedThreads, curatedDocuments, sourceLabel);

    return {
      selection,
      curatedThreads,
      curatedDocuments,
      manifest,
      serializedArtifacts: serialized,
    };
  });

export const curateFromEmails = (
  emails: ReadonlyArray<EnronEmail>,
  options?: CuratorSelectionOptions
): Effect.Effect<CuratedDatasetResult, EnronCurationError> => {
  const threads = reconstructThreads(emails);
  return curateFromThreads(threads, options);
};

export const curateFromCsvContent = (
  csvContent: string,
  options?: CuratorSelectionOptions
): Effect.Effect<CuratedDatasetResult, EnronFileError | EnronParseError | EnronCurationError> =>
  Effect.gen(function* () {
    const emails = yield* parseCsvContent(csvContent);
    return yield* curateFromEmails(emails, options);
  });

export const curateFromCsvFile = (
  csvPath: string,
  options?: CuratorSelectionOptions
): Effect.Effect<CuratedDatasetResult, EnronFileError | EnronParseError | EnronCurationError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const emails = yield* parseCsvFile(csvPath);
    return yield* curateFromEmails(emails, options);
  });

export const curateFromMaildir = (
  dirPath: string,
  options?: CurateMaildirOptions
): Effect.Effect<CuratedDatasetResult, EnronFileError | EnronParseError | EnronCurationError | BadArgument | SystemError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const emails = yield* parseMaildirForCuration(dirPath, options);
    return yield* curateFromEmails(emails, options);
  });

export const writeCuratedArtifacts = (
  artifacts: SerializedCuratedArtifacts,
  outputDirectory: string
): Effect.Effect<WrittenCuratedArtifacts, EnronCurationError, FileSystem.FileSystem> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    yield* fs.makeDirectory(outputDirectory, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationError({
            message: "Failed to create curated artifact output directory",
            path: outputDirectory,
            cause: String(cause),
          })
      )
    );

    const threadsPath = join(outputDirectory, artifacts.threadsFileName);
    const documentsPath = join(outputDirectory, artifacts.documentsFileName);
    const manifestPath = join(outputDirectory, artifacts.manifestFileName);

    yield* fs.writeFileString(threadsPath, artifacts.threadsJson).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationError({
            message: "Failed to write curated thread artifact",
            path: threadsPath,
            cause: String(cause),
          })
      )
    );

    yield* fs.writeFileString(documentsPath, artifacts.documentsJson).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationError({
            message: "Failed to write curated document artifact",
            path: documentsPath,
            cause: String(cause),
          })
      )
    );

    yield* fs.writeFileString(manifestPath, artifacts.manifestJson).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationError({
            message: "Failed to write curated manifest artifact",
            path: manifestPath,
            cause: String(cause),
          })
      )
    );

    return {
      outputDirectory,
      threadsPath,
      documentsPath,
      manifestPath,
    };
  });

const normalizeDestinationUri = (destinationUri: string): string => destinationUri.replace(/\/+$/, "");

const uploadSingleArtifact = (
  sourcePath: string,
  destinationUri: string,
  awsExecutable: string
): Effect.Effect<string, EnronCurationUploadError, CommandExecutor.CommandExecutor> =>
  Effect.gen(function* () {
    const targetUri = `${normalizeDestinationUri(destinationUri)}/${basename(sourcePath)}`;

    const command = ProcessCommand.make(awsExecutable, "s3", "cp", sourcePath, targetUri).pipe(
      ProcessCommand.stdout("inherit"),
      ProcessCommand.stderr("inherit")
    );

    const exitCode = yield* ProcessCommand.exitCode(command).pipe(
      Effect.mapError(
        (cause) =>
          new EnronCurationUploadError({
            message: "Failed to execute aws s3 cp for curated artifact upload",
            sourcePath,
            destination: targetUri,
            cause: String(cause),
          })
      )
    );

    if (Number(exitCode) !== 0) {
      return yield* Effect.fail(
        new EnronCurationUploadError({
          message: "aws s3 cp returned a non-zero exit code",
          sourcePath,
          destination: targetUri,
        })
      );
    }

    return targetUri;
  });

export const uploadCuratedArtifacts = (
  writtenArtifacts: WrittenCuratedArtifacts,
  options?: UploadCuratedArtifactsOptions
): Effect.Effect<UploadedCuratedArtifacts, EnronCurationUploadError, CommandExecutor.CommandExecutor> =>
  Effect.gen(function* () {
    const destinationUri = options?.destinationUri ?? ENRON_CURATED_PREFIX_URI;
    const awsExecutable = options?.awsExecutable ?? "aws";

    const paths = [writtenArtifacts.threadsPath, writtenArtifacts.documentsPath, writtenArtifacts.manifestPath] as const;
    const uploadedUris = yield* Effect.forEach(paths, (path) => uploadSingleArtifact(path, destinationUri, awsExecutable), {
      concurrency: 1,
    });

    return {
      destinationUri,
      uploadedUris,
    };
  });
