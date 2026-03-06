import { $RepoMemoryServerId } from "@beep/identity/packages";
import {
  IndexRepoRunInput,
  QueryRepoRunInput,
  type RepoId,
  RetrievalPacket,
  RunEventSequence,
  RunId,
  RunStreamFailure,
} from "@beep/repo-memory-domain";
import {
  LocalRepoMemoryDriver,
  type LocalRepoMemoryDriverError,
  RepoIndexArtifact,
} from "@beep/repo-memory-drivers-local";
import {
  IndexRun,
  QueryRun,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
} from "@beep/runtime-protocol";
import { NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import {
  DateTime,
  Effect,
  FileSystem,
  HashSet,
  Layer,
  Path,
  pipe,
  Random,
  Ref,
  ServiceMap,
  String as Str,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Workflow from "effect/unstable/workflow/Workflow";

const $I = $RepoMemoryServerId.create("index");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunId = S.decodeUnknownSync(RunId);
const ignoredDirectoryNames = HashSet.fromIterable([".git", ".turbo", "build", "coverage", "dist", "node_modules"]);
const runIdEquivalence = S.toEquivalence(RunId);
const workflowVersion = "cluster-first-v0";

/**
 * Typed orchestration error emitted by the repo-memory server.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RepoMemoryServerError extends TaggedErrorClass<RepoMemoryServerError>($I`RepoMemoryServerError`)(
  "RepoMemoryServerError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("RepoMemoryServerError", {
    description: "Typed error for repo-memory orchestration boundaries.",
  })
) {}

/**
 * Service contract for repo-memory orchestration and workflow entrypoints.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RepoMemoryServerShape {
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, RepoMemoryServerError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryServerError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryServerError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoMemoryServerError>;
  readonly startIndexRun: (repoId: RepoId) => Effect.Effect<IndexRun, RepoMemoryServerError>;
  readonly startQueryRun: (input: QueryRepoRunInput) => Effect.Effect<QueryRun, RepoMemoryServerError>;
}

/**
 * Workflow contract for deterministic repository indexing runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const IndexRepoRunWorkflow = Workflow.make({
  name: "IndexRepoRun",
  payload: IndexRepoRunInput,
  success: IndexRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.sourceFingerprint,
      O.getOrElse(() => payload.repoId),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Workflow contract for deterministic repository query runs.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const QueryRepoRunWorkflow = Workflow.make({
  name: "QueryRepoRun",
  payload: QueryRepoRunInput,
  success: QueryRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.questionFingerprint,
      O.getOrElse(() => Str.toLowerCase(Str.trim(payload.question))),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Tuple of workflow contracts exposed by the repo-memory server.
 *
 * @since 0.0.0
 * @category PortContract
 */
export const RepoRunWorkflows = [IndexRepoRunWorkflow, QueryRepoRunWorkflow] as const;

const isTypeScriptSourceFile = (entry: string): boolean => {
  if (Str.endsWith(".d.ts")(entry)) {
    return false;
  }

  return (
    Str.endsWith(".cts")(entry) ||
    Str.endsWith(".mts")(entry) ||
    Str.endsWith(".ts")(entry) ||
    Str.endsWith(".tsx")(entry)
  );
};

const makeRepoMemoryServer = Effect.fn("RepoMemoryServer.make")(function* () {
  const driver = yield* LocalRepoMemoryDriver;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const runsRef = yield* Ref.make<ReadonlyArray<RepoRun>>(A.empty());

  const toServerError = (message: string, status: number, cause?: unknown): RepoMemoryServerError =>
    new RepoMemoryServerError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const mapDriverError = <A>(effect: Effect.Effect<A, LocalRepoMemoryDriverError>) =>
    effect.pipe(Effect.mapError((error) => toServerError(error.message, error.status, error.cause)));

  const makeRunId = Effect.fn("RepoMemoryServer.makeRunId")(function* (kind: "index" | "query") {
    const uuid = yield* Random.nextUUIDv4;
    return decodeRunId(`run:${kind}:${uuid}`);
  });

  const walkTypeScriptFiles = Effect.fn("RepoMemoryServer.walkTypeScriptFiles")(function* (
    currentPath: string
  ): Effect.fn.Return<number, RepoMemoryServerError> {
    const entries = yield* fs
      .readDirectory(currentPath)
      .pipe(
        Effect.mapError((cause) => toServerError(`Failed to read repository directory "${currentPath}".`, 500, cause))
      );

    const counts = yield* Effect.forEach(
      entries,
      Effect.fn("RepoMemoryServer.walkEntry")(function* (entry): Effect.fn.Return<number, RepoMemoryServerError> {
        const absolutePath = path.join(currentPath, entry);
        const stat = yield* fs
          .stat(absolutePath)
          .pipe(
            Effect.mapError((cause) => toServerError(`Failed to stat repository entry "${absolutePath}".`, 500, cause))
          );

        if (stat.type === "Directory") {
          if (HashSet.has(ignoredDirectoryNames, entry)) {
            return 0;
          }

          return yield* walkTypeScriptFiles(absolutePath);
        }

        return isTypeScriptSourceFile(entry) ? 1 : 0;
      }),
      { concurrency: 16 }
    );

    return A.reduce(counts, 0, (total, count) => total + count);
  });

  const countTypeScriptFiles = Effect.fn("RepoMemoryServer.countTypeScriptFiles")(function* (
    rootPath: string
  ): Effect.fn.Return<number, RepoMemoryServerError> {
    return yield* walkTypeScriptFiles(rootPath);
  });

  const upsertRun = (run: RepoRun) =>
    Ref.update(runsRef, (runs) => {
      const index = runs.findIndex((candidate) => runIdEquivalence(candidate.id, run.id));

      return index === -1
        ? A.append(runs, run)
        : A.map(runs, (candidate, currentIndex) => (currentIndex === index ? run : candidate));
    });

  const getRun: RepoMemoryServerShape["getRun"] = Effect.fn("RepoMemoryServer.getRun")(function* (runId) {
    const runs = yield* Ref.get(runsRef);
    const run = A.findFirst(runs, (candidate) => runIdEquivalence(candidate.id, runId));

    return yield* O.match(run, {
      onNone: () => toServerError(`Run not found: "${runId}".`, 404),
      onSome: Effect.succeed,
    });
  });

  const listRepos: RepoMemoryServerShape["listRepos"] = mapDriverError(driver.listRepos).pipe(
    Effect.withSpan("RepoMemoryServer.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const listRuns: RepoMemoryServerShape["listRuns"] = Ref.get(runsRef).pipe(
    Effect.withSpan("RepoMemoryServer.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const registerRepo: RepoMemoryServerShape["registerRepo"] = Effect.fn("RepoMemoryServer.registerRepo")(
    function* (input) {
      return yield* mapDriverError(driver.registerRepo(input));
    }
  );

  const startIndexRun: RepoMemoryServerShape["startIndexRun"] = Effect.fn("RepoMemoryServer.startIndexRun")(
    function* (repoId) {
      const repo = yield* mapDriverError(driver.getRepo(repoId));
      const runId = yield* makeRunId("index");
      const acceptedAt = yield* DateTime.now;
      const startedAt = yield* DateTime.now;
      const indexedFileCount = decodeNonNegativeInt(yield* countTypeScriptFiles(repo.repoPath));
      const completedAt = yield* DateTime.now;
      const run = new IndexRun({
        id: runId,
        repoId,
        status: "completed",
        acceptedAt,
        startedAt: O.some(startedAt),
        completedAt: O.some(completedAt),
        lastEventSequence: decodeRunEventSequence(4),
        indexedFileCount: O.some(indexedFileCount),
        errorMessage: O.none(),
      });

      yield* mapDriverError(
        driver.saveIndexArtifact(
          new RepoIndexArtifact({
            runId,
            repoId,
            sourceSnapshotId: `snapshot:${DateTime.toEpochMillis(completedAt)}`,
            indexedFileCount,
            completedAt,
          })
        )
      );
      yield* upsertRun(run);

      return run;
    }
  );

  const startQueryRun: RepoMemoryServerShape["startQueryRun"] = Effect.fn("RepoMemoryServer.startQueryRun")(
    function* (input) {
      const repo = yield* mapDriverError(driver.getRepo(input.repoId));
      const latestArtifact = yield* mapDriverError(driver.latestIndexArtifact(input.repoId));
      const artifact = yield* O.match(latestArtifact, {
        onNone: () => toServerError(`Repo "${input.repoId}" does not have a completed index artifact yet.`, 400),
        onSome: Effect.succeed,
      });

      const runId = yield* makeRunId("query");
      const acceptedAt = yield* DateTime.now;
      const startedAt = yield* DateTime.now;
      const completedAt = yield* DateTime.now;
      const retrievalPacket = new RetrievalPacket({
        repoId: repo.id,
        query: input.question,
        retrievedAt: completedAt,
        summary: `Deterministic summary for ${repo.displayName} derived from the latest completed index artifact.`,
        citations: A.empty(),
        notes: A.make(
          `Latest completed index artifact ${artifact.runId} counted ${artifact.indexedFileCount} TypeScript source files.`,
          "Natural-language source retrieval is not implemented yet; this response is derived from local run metadata only."
        ),
      });
      const answer = `Repo "${repo.displayName}" currently has ${artifact.indexedFileCount} indexed TypeScript source files. This compile-stable interim query path is metadata-backed and does not yet synthesize source-level answers.`;
      const run = new QueryRun({
        id: runId,
        repoId: input.repoId,
        question: input.question,
        status: "completed",
        acceptedAt,
        startedAt: O.some(startedAt),
        completedAt: O.some(completedAt),
        lastEventSequence: decodeRunEventSequence(6),
        answer: O.some(answer),
        citations: A.empty(),
        retrievalPacket: O.some(retrievalPacket),
        errorMessage: O.none(),
      });

      yield* mapDriverError(driver.saveRetrievalPacket(runId, retrievalPacket));
      yield* upsertRun(run);

      return run;
    }
  );

  return {
    getRun,
    listRepos,
    listRuns,
    registerRepo,
    startIndexRun,
    startQueryRun,
  } satisfies RepoMemoryServerShape;
});

/**
 * Service tag for repo-memory orchestration.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoMemoryServer extends ServiceMap.Service<RepoMemoryServer, RepoMemoryServerShape>()(
  $I`RepoMemoryServer`
) {
  static readonly layer: Layer.Layer<
    RepoMemoryServer,
    never,
    LocalRepoMemoryDriver | FileSystem.FileSystem | Path.Path
  > = Layer.effect(
    RepoMemoryServer,
    makeRepoMemoryServer().pipe(
      Effect.withSpan("RepoMemoryServer.make"),
      Effect.annotateLogs({ component: "repo-memory-server" })
    )
  );
}

const toRunStreamFailure = (error: RepoMemoryServerError): RunStreamFailure =>
  new RunStreamFailure({
    message: error.message,
    status: error.status,
  });

/**
 * Live workflow layers for repository index and query runs.
 *
 * @since 0.0.0
 * @category Layers
 */
export const RepoRunWorkflowsLayer = Layer.mergeAll(
  IndexRepoRunWorkflow.toLayer(
    Effect.fn("RepoMemoryServer.IndexRepoRunWorkflow")(function* (payload) {
      const repoMemoryServer = yield* RepoMemoryServer;
      return yield* repoMemoryServer.startIndexRun(payload.repoId).pipe(Effect.mapError(toRunStreamFailure));
    })
  ),
  QueryRepoRunWorkflow.toLayer(
    Effect.fn("RepoMemoryServer.QueryRepoRunWorkflow")(function* (payload) {
      const repoMemoryServer = yield* RepoMemoryServer;
      return yield* repoMemoryServer.startQueryRun(payload).pipe(Effect.mapError(toRunStreamFailure));
    })
  )
);
