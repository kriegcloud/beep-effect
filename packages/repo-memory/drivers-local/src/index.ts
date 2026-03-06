import { $RepoMemoryDriversLocalId } from "@beep/identity/packages";
import { RepoId, RunId } from "@beep/repo-memory-domain";
import {
  type IndexRun,
  type QueryRun,
  RepoRegistration,
  type RepoRegistrationInput,
  RepoRun,
} from "@beep/runtime-protocol";
import { FilePath, Sha256HexFromBytes, TaggedErrorClass } from "@beep/schema";
import { Clock, Effect, FileSystem, Layer, Path, pipe, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $RepoMemoryDriversLocalId.create("index");
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeSha256Hex = S.decodeUnknownEffect(Sha256HexFromBytes);
const repoIdEquivalence = S.toEquivalence(RepoId);
const runIdEquivalence = S.toEquivalence(RunId);
const stateFileName = "state.json";

export class LocalRepoMemoryDriverConfig extends S.Class<LocalRepoMemoryDriverConfig>($I`LocalRepoMemoryDriverConfig`)(
  {
    appDataDir: FilePath,
  },
  $I.annote("LocalRepoMemoryDriverConfig", {
    description: "Configuration for the local repo-memory persistence driver.",
  })
) {}

class RepoMemoryState extends S.Class<RepoMemoryState>($I`RepoMemoryState`)(
  {
    repos: S.Array(RepoRegistration),
    runs: S.Array(RepoRun),
  },
  $I.annote("RepoMemoryState", {
    description: "Persisted state for the local repo-memory prototype.",
  })
) {}

const decodeRepoMemoryState = S.decodeUnknownEffect(S.fromJsonString(RepoMemoryState));
const encodeRepoMemoryState = S.encodeUnknownEffect(S.fromJsonString(RepoMemoryState));

export class LocalRepoMemoryDriverError extends TaggedErrorClass<LocalRepoMemoryDriverError>(
  $I`LocalRepoMemoryDriverError`
)(
  "LocalRepoMemoryDriverError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("LocalRepoMemoryDriverError", {
    description: "Typed persistence error for the local repo-memory driver boundary.",
  })
) {}

export interface LocalRepoMemoryDriverShape {
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, LocalRepoMemoryDriverError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, LocalRepoMemoryDriverError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, LocalRepoMemoryDriverError>;
  readonly listRunsForRepo: (repoId: RepoId) => Effect.Effect<ReadonlyArray<RepoRun>, LocalRepoMemoryDriverError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, LocalRepoMemoryDriverError>;
  readonly saveIndexRun: (run: IndexRun) => Effect.Effect<IndexRun, LocalRepoMemoryDriverError>;
  readonly saveQueryRun: (run: QueryRun) => Effect.Effect<QueryRun, LocalRepoMemoryDriverError>;
}

export class LocalRepoMemoryDriver extends ServiceMap.Service<LocalRepoMemoryDriver, LocalRepoMemoryDriverShape>()(
  $I`LocalRepoMemoryDriver`
) {
  static readonly layer = (
    config: LocalRepoMemoryDriverConfig
  ): Layer.Layer<LocalRepoMemoryDriver, never, FileSystem.FileSystem | Path.Path> =>
    Layer.effect(
      LocalRepoMemoryDriver,
      makeLocalRepoMemoryDriver(config).pipe(
        Effect.withSpan("LocalRepoMemoryDriver.make"),
        Effect.annotateLogs({ component: "repo-memory-driver" })
      )
    );
}

const makeLocalRepoMemoryDriver = Effect.fn("LocalRepoMemoryDriver.make")(function* (
  config: LocalRepoMemoryDriverConfig
) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const stateFilePath = path.join(config.appDataDir, stateFileName);

  const toDriverError = (message: string, status: number, cause?: unknown): LocalRepoMemoryDriverError =>
    new LocalRepoMemoryDriverError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const annotateDriverSpan = Effect.fn("LocalRepoMemoryDriver.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(annotations);
  });

  const withDriverLogAnnotations = <A, E, R>(
    annotations: Record<string, unknown>,
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R> => effect.pipe(Effect.annotateLogs(annotations));

  const emptyState = (): RepoMemoryState => new RepoMemoryState({ repos: A.empty(), runs: A.empty() });

  const ensureStateFile = Effect.fn("LocalRepoMemoryDriver.ensureStateFile")(function* (): Effect.fn.Return<
    void,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ state_file: stateFilePath });

    yield* fs
      .makeDirectory(config.appDataDir, { recursive: true })
      .pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to create repo-memory app data directory at "${config.appDataDir}".`, 500, cause)
        )
      );

    const exists = yield* fs
      .exists(stateFilePath)
      .pipe(Effect.mapError((cause) => toDriverError(`Failed to check state file at "${stateFilePath}".`, 500, cause)));

    if (exists) {
      return;
    }

    const encoded = yield* encodeRepoMemoryState(emptyState()).pipe(
      Effect.mapError((cause) => toDriverError("Failed to encode empty repo-memory state.", 500, cause))
    );

    yield* fs
      .writeFileString(stateFilePath, `${encoded}\n`)
      .pipe(
        Effect.mapError((cause) => toDriverError(`Failed to initialize state file at "${stateFilePath}".`, 500, cause))
      );

    yield* Effect.logInfo({
      message: "repo-memory state file initialized",
      state_file: stateFilePath,
    }).pipe(Effect.annotateLogs({ component: "repo-memory-driver" }));
  });

  const readState = Effect.fn("LocalRepoMemoryDriver.readState")(function* (): Effect.fn.Return<
    RepoMemoryState,
    LocalRepoMemoryDriverError
  > {
    yield* annotateDriverSpan({ state_file: stateFilePath });
    yield* ensureStateFile();

    const content = yield* fs
      .readFileString(stateFilePath)
      .pipe(Effect.mapError((cause) => toDriverError(`Failed to read state file at "${stateFilePath}".`, 500, cause)));

    return yield* decodeRepoMemoryState(content).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to decode state file at "${stateFilePath}".`, 500, cause))
    );
  });

  const writeState = Effect.fn("LocalRepoMemoryDriver.writeState")(function* (
    state: RepoMemoryState
  ): Effect.fn.Return<void, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({
      state_file: stateFilePath,
      repo_count: A.length(state.repos),
      run_count: A.length(state.runs),
    });

    const content = yield* encodeRepoMemoryState(state).pipe(
      Effect.mapError((cause) => toDriverError("Failed to encode repo-memory state.", 500, cause))
    );

    yield* fs
      .writeFileString(stateFilePath, `${content}\n`)
      .pipe(Effect.mapError((cause) => toDriverError(`Failed to write state file at "${stateFilePath}".`, 500, cause)));

    yield* Effect.logDebug({
      message: "repo-memory state persisted",
      state_file: stateFilePath,
      repo_count: A.length(state.repos),
      run_count: A.length(state.runs),
    }).pipe(Effect.annotateLogs({ component: "repo-memory-driver" }));
  });

  const repoIdFromPath = Effect.fn("LocalRepoMemoryDriver.repoIdFromPath")(function* (
    normalizedRepoPath: string
  ): Effect.fn.Return<RepoId, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

    return yield* decodeSha256Hex(new TextEncoder().encode(normalizedRepoPath)).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to hash repository path "${normalizedRepoPath}".`, 500, cause)),
      Effect.map((digest) => decodeRepoId(`repo:${digest}`))
    );
  });

  const upsertRun = (runs: ReadonlyArray<RepoRun>, run: RepoRun): ReadonlyArray<RepoRun> =>
    pipe(
      O.fromUndefinedOr(A.findFirstIndex(runs, (candidate) => runIdEquivalence(candidate.id, run.id))),
      O.match({
        onNone: () => A.append(runs, run),
        onSome: (index) =>
          pipe(
            O.fromUndefinedOr(A.replace(runs, index, run)),
            O.getOrElse(() => A.append(runs, run))
          ),
      })
    );

  const registerRepo: LocalRepoMemoryDriverShape["registerRepo"] = Effect.fn("LocalRepoMemoryDriver.registerRepo")(
    function* (input): Effect.fn.Return<RepoRegistration, LocalRepoMemoryDriverError> {
      const normalizedRepoPath = path.resolve(input.repoPath);
      yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

      const exists = yield* fs
        .exists(normalizedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to check repository path "${normalizedRepoPath}".`, 500, cause)
          )
        );

      if (!exists) {
        return yield* toDriverError(`Repository path does not exist: "${normalizedRepoPath}".`, 404);
      }

      const stat = yield* fs
        .stat(normalizedRepoPath)
        .pipe(
          Effect.mapError((cause) =>
            toDriverError(`Failed to stat repository path "${normalizedRepoPath}".`, 500, cause)
          )
        );

      if (stat.type !== "Directory") {
        return yield* toDriverError(`Repository path must be a directory: "${normalizedRepoPath}".`, 400);
      }

      const state = yield* withDriverLogAnnotations({ repo_path: normalizedRepoPath }, readState());
      const existing = A.findFirst(state.repos, (repo) => repo.repoPath === normalizedRepoPath);
      if (O.isSome(existing)) {
        yield* Effect.logDebug({
          message: "repo already registered",
          repo_id: existing.value.id,
          repo_path: existing.value.repoPath,
        }).pipe(Effect.annotateLogs({ component: "repo-memory-driver" }));

        return existing.value;
      }

      const displayName = pipe(
        input.displayName,
        O.filter(Str.isNonEmpty),
        O.getOrElse(() => path.basename(normalizedRepoPath))
      );
      const registration = new RepoRegistration({
        id: yield* repoIdFromPath(normalizedRepoPath),
        repoPath: decodeFilePath(normalizedRepoPath),
        displayName,
        language: "typescript",
        registeredAt: yield* Clock.currentTimeMillis,
      });

      yield* withDriverLogAnnotations(
        { repo_id: registration.id, repo_path: normalizedRepoPath },
        writeState(
          new RepoMemoryState({
            repos: A.append(state.repos, registration),
            runs: state.runs,
          })
        )
      );

      yield* Effect.logInfo({
        message: "repo registered",
        repo_id: registration.id,
        repo_path: registration.repoPath,
      }).pipe(Effect.annotateLogs({ component: "repo-memory-driver" }));

      return registration;
    }
  );

  const getRun: LocalRepoMemoryDriverShape["getRun"] = Effect.fn("LocalRepoMemoryDriver.getRun")(
    function* (runId): Effect.fn.Return<RepoRun, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ run_id: runId });

      const state = yield* withDriverLogAnnotations({ run_id: runId }, readState());
      const run = A.findFirst(state.runs, (candidate) => runIdEquivalence(candidate.id, runId));

      return yield* pipe(
        run,
        O.match({
          onNone: () => toDriverError(`Run not found: "${runId}".`, 404),
          onSome: Effect.succeed,
        })
      );
    }
  );

  const listRepos: LocalRepoMemoryDriverShape["listRepos"] = readState().pipe(
    Effect.map((state) => state.repos),
    Effect.withSpan("LocalRepoMemoryDriver.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const listRuns: LocalRepoMemoryDriverShape["listRuns"] = readState().pipe(
    Effect.map((state) => state.runs),
    Effect.withSpan("LocalRepoMemoryDriver.listRuns"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const listRunsForRepo: LocalRepoMemoryDriverShape["listRunsForRepo"] = Effect.fn(
    "LocalRepoMemoryDriver.listRunsForRepo"
  )(function* (repoId): Effect.fn.Return<ReadonlyArray<RepoRun>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId });
    const state = yield* withDriverLogAnnotations({ repo_id: repoId }, readState());
    return A.filter(state.runs, (run) => repoIdEquivalence(run.repoId, repoId));
  });

  const saveIndexRun: LocalRepoMemoryDriverShape["saveIndexRun"] = Effect.fn("LocalRepoMemoryDriver.saveIndexRun")(
    function* (run): Effect.fn.Return<IndexRun, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ run_id: run.id, repo_id: run.repoId, run_kind: "index" });
      const state = yield* withDriverLogAnnotations({ run_id: run.id }, readState());

      yield* writeState(
        new RepoMemoryState({
          repos: state.repos,
          runs: upsertRun(state.runs, run),
        })
      );

      return run;
    }
  );

  const saveQueryRun: LocalRepoMemoryDriverShape["saveQueryRun"] = Effect.fn("LocalRepoMemoryDriver.saveQueryRun")(
    function* (run): Effect.fn.Return<QueryRun, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ run_id: run.id, repo_id: run.repoId, run_kind: "query" });
      const state = yield* withDriverLogAnnotations({ run_id: run.id }, readState());

      yield* writeState(
        new RepoMemoryState({
          repos: state.repos,
          runs: upsertRun(state.runs, run),
        })
      );

      return run;
    }
  );

  return {
    getRun,
    listRepos,
    listRuns,
    listRunsForRepo,
    registerRepo,
    saveIndexRun,
    saveQueryRun,
  } satisfies LocalRepoMemoryDriverShape;
});
