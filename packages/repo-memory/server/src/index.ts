import { $RepoMemoryServerId } from "@beep/identity/packages";
import { type Citation, RepoId, RetrievalPacket, RunId } from "@beep/repo-memory-domain";
import { LocalRepoMemoryDriver, type LocalRepoMemoryDriverError } from "@beep/repo-memory-drivers-local";
import {
  IndexRun,
  QueryRun,
  type QueryRunInput,
  type RepoRegistration,
  type RepoRegistrationInput,
  type RepoRun,
} from "@beep/runtime-protocol";
import { NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, FileSystem, HashSet, Layer, Path, pipe, Random, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoMemoryServerId.create("index");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunId = S.decodeUnknownSync(RunId);
const ignoredDirectoryNames = HashSet.fromIterable([".git", ".turbo", "build", "coverage", "dist", "node_modules"]);
const repoIdEquivalence = S.toEquivalence(RepoId);

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

export interface RepoMemoryServerShape {
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, RepoMemoryServerError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryServerError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryServerError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, RepoMemoryServerError>;
  readonly startIndexRun: (repoId: RepoId) => Effect.Effect<IndexRun, RepoMemoryServerError>;
  readonly startQueryRun: (input: QueryRunInput) => Effect.Effect<QueryRun, RepoMemoryServerError>;
}

const makeRepoMemoryServer = Effect.fn("RepoMemoryServer.make")(function* () {
  const driver = yield* LocalRepoMemoryDriver;
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;

  const toServerError = (message: string, status: number, cause?: unknown): RepoMemoryServerError =>
    new RepoMemoryServerError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const annotateServerSpan = Effect.fn("RepoMemoryServer.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const withServerLogAnnotations = <A, E, R>(
    annotations: Record<string, unknown>,
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R> => effect.pipe(Effect.annotateLogs(annotations));

  const mapDriverError = <A>(effect: Effect.Effect<A, LocalRepoMemoryDriverError>) =>
    effect.pipe(Effect.mapError((error) => toServerError(error.message, error.status, error.cause)));

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

  const walkTypeScriptFiles = Effect.fn("RepoMemoryServer.walkTypeScriptFiles")(function* (
    currentPath: string
  ): Effect.fn.Return<number, RepoMemoryServerError> {
    yield* annotateServerSpan({ repo_path: currentPath });

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
    yield* annotateServerSpan({ repo_path: rootPath });
    return yield* withServerLogAnnotations({ repo_path: rootPath }, walkTypeScriptFiles(rootPath));
  });

  const findRepoById = Effect.fn("RepoMemoryServer.findRepoById")(function* (
    repoId: RepoId
  ): Effect.fn.Return<RepoRegistration, RepoMemoryServerError> {
    yield* annotateServerSpan({ repo_id: repoId });

    const repos = yield* withServerLogAnnotations({ repo_id: repoId }, mapDriverError(driver.listRepos));
    const repo = A.findFirst(repos, (candidate) => repoIdEquivalence(candidate.id, repoId));

    return yield* pipe(
      repo,
      O.match({
        onNone: () => Effect.fail(toServerError(`Repository not found: "${repoId}".`, 404)),
        onSome: Effect.succeed,
      })
    );
  });

  const completedAtOrStartedAt = (run: IndexRun): number =>
    pipe(
      run.completedAt,
      O.getOrElse(() => run.startedAt)
    );

  const latestCompletedIndexRun = Effect.fn("RepoMemoryServer.latestCompletedIndexRun")(function* (
    repoId: RepoId
  ): Effect.fn.Return<IndexRun, RepoMemoryServerError> {
    yield* annotateServerSpan({ repo_id: repoId });

    const runs = yield* withServerLogAnnotations({ repo_id: repoId }, mapDriverError(driver.listRunsForRepo(repoId)));
    const latest = A.reduce(runs, O.none<IndexRun>(), (current, run) => {
      if (run.kind !== "index" || run.status !== "completed") {
        return current;
      }

      return pipe(
        current,
        O.match({
          onNone: () => O.some(run),
          onSome: (existing) =>
            O.some(completedAtOrStartedAt(run) >= completedAtOrStartedAt(existing) ? run : existing),
        })
      );
    });

    return yield* pipe(
      latest,
      O.match({
        onNone: () => Effect.fail(toServerError(`Repo "${repoId}" does not have a completed index run yet.`, 400)),
        onSome: Effect.succeed,
      })
    );
  });

  const getRun: RepoMemoryServerShape["getRun"] = Effect.fn("RepoMemoryServer.getRun")(
    function* (runId): Effect.fn.Return<RepoRun, RepoMemoryServerError> {
      yield* annotateServerSpan({ run_id: runId });
      return yield* withServerLogAnnotations({ run_id: runId }, mapDriverError(driver.getRun(runId)));
    }
  );

  const listRepos: RepoMemoryServerShape["listRepos"] = mapDriverError(driver.listRepos).pipe(
    Effect.withSpan("RepoMemoryServer.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const listRuns: RepoMemoryServerShape["listRuns"] = mapDriverError(driver.listRuns).pipe(
    Effect.withSpan("RepoMemoryServer.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-server" })
  );

  const registerRepo: RepoMemoryServerShape["registerRepo"] = Effect.fn("RepoMemoryServer.registerRepo")(
    function* (input): Effect.fn.Return<RepoRegistration, RepoMemoryServerError> {
      yield* annotateServerSpan({ repo_path: input.repoPath });
      return yield* withServerLogAnnotations({ repo_path: input.repoPath }, mapDriverError(driver.registerRepo(input)));
    }
  );

  const makeRunId = Effect.fn("RepoMemoryServer.makeRunId")(function* (kind: "index" | "query") {
    const uuid = yield* Random.nextUUIDv4;
    return decodeRunId(`run:${kind}:${uuid}`);
  });

  const startIndexRun: RepoMemoryServerShape["startIndexRun"] = Effect.fn("RepoMemoryServer.startIndexRun")(
    function* (repoId): Effect.fn.Return<IndexRun, RepoMemoryServerError> {
      yield* annotateServerSpan({ repo_id: repoId, run_kind: "index" });

      const repo = yield* findRepoById(repoId);
      const startedAt = yield* Clock.currentTimeMillis;
      const indexedFileCount = decodeNonNegativeInt(yield* countTypeScriptFiles(repo.repoPath));
      const completedAt = yield* Clock.currentTimeMillis;
      const run = new IndexRun({
        kind: "index",
        id: yield* makeRunId("index"),
        repoId,
        status: "completed",
        startedAt,
        completedAt: O.some(completedAt),
        indexedFileCount,
        errorMessage: O.none(),
      });
      const savedRun = yield* withServerLogAnnotations(
        { repo_id: repoId, run_kind: "index" },
        mapDriverError(driver.saveIndexRun(run))
      );

      yield* Effect.logInfo({
        message: "repo-memory index run completed",
        repo_id: repoId,
        run_id: savedRun.id,
        indexed_file_count: savedRun.indexedFileCount,
      }).pipe(Effect.annotateLogs({ component: "repo-memory-server" }));

      return savedRun;
    }
  );

  const startQueryRun: RepoMemoryServerShape["startQueryRun"] = Effect.fn("RepoMemoryServer.startQueryRun")(
    function* (input): Effect.fn.Return<QueryRun, RepoMemoryServerError> {
      yield* annotateServerSpan({ repo_id: input.repoId, run_kind: "query" });

      const repo = yield* findRepoById(input.repoId);
      const latestIndexRun = yield* latestCompletedIndexRun(input.repoId);
      const startedAt = yield* Clock.currentTimeMillis;
      const completedAt = yield* Clock.currentTimeMillis;
      const retrievalPacket = new RetrievalPacket({
        repoId: repo.id,
        query: input.question,
        retrievedAt: completedAt,
        summary: `Deterministic summary for ${repo.displayName} derived from the latest completed index run.`,
        citations: A.empty<Citation>(),
        notes: A.make(
          `Latest completed index run ${latestIndexRun.id} counted ${latestIndexRun.indexedFileCount} TypeScript source files.`,
          "Natural-language source retrieval is not implemented yet; this response is derived from local run metadata only."
        ),
      });
      const answer = `Repo "${repo.displayName}" currently has ${latestIndexRun.indexedFileCount} indexed TypeScript source files. This v0 query path is deterministic and metadata-backed, so it does not yet synthesize source-level answers.`;
      const run = new QueryRun({
        kind: "query",
        id: yield* makeRunId("query"),
        repoId: input.repoId,
        question: input.question,
        status: "completed",
        answer: O.some(answer),
        startedAt,
        completedAt: O.some(completedAt),
        citations: A.empty<Citation>(),
        retrievalPacket: O.some(retrievalPacket),
        errorMessage: O.none(),
      });
      const savedRun = yield* withServerLogAnnotations(
        { repo_id: input.repoId, run_kind: "query" },
        mapDriverError(driver.saveQueryRun(run))
      );

      yield* Effect.logInfo({
        message: "repo-memory query run completed",
        repo_id: input.repoId,
        run_id: savedRun.id,
        question_length: input.question.length,
      }).pipe(Effect.annotateLogs({ component: "repo-memory-server" }));

      return savedRun;
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
