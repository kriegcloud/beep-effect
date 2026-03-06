import { $RepoMemoryDriversLocalId } from "@beep/identity/packages";
import { RepoId, RetrievalPacket, RunId } from "@beep/repo-memory-domain";
import { RepoRegistration, type RepoRegistrationInput } from "@beep/runtime-protocol";
import { FilePath, NonNegativeInt, Sha256HexFromBytes, TaggedErrorClass } from "@beep/schema";
import { DateTime, Effect, FileSystem, Layer, Path, pipe, ServiceMap, String as Str } from "effect";
import * as A from "effect/Array";

import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const $I = $RepoMemoryDriversLocalId.create("index");
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeRepoId = S.decodeUnknownSync(RepoId);
const decodeSha256Hex = S.decodeUnknownEffect(Sha256HexFromBytes);
const encodePacketJson = S.encodeUnknownEffect(S.fromJsonString(RetrievalPacket));
const decodePacketJson = S.decodeUnknownEffect(S.fromJsonString(RetrievalPacket));

/**
 * Configuration for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LocalRepoMemoryDriverConfig extends S.Class<LocalRepoMemoryDriverConfig>($I`LocalRepoMemoryDriverConfig`)(
  {
    appDataDir: FilePath,
  },
  $I.annote("LocalRepoMemoryDriverConfig", {
    description: "Configuration for the local repo-memory persistence driver.",
  })
) {}

/**
 * Typed persistence error emitted by the local repo-memory driver.
 *
 * @since 0.0.0
 * @category Errors
 */
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

/**
 * Persisted artifact for a completed repository index run.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoIndexArtifact extends S.Class<RepoIndexArtifact>($I`RepoIndexArtifact`)(
  {
    runId: RunId,
    repoId: RepoId,
    sourceSnapshotId: S.String,
    indexedFileCount: S.Number,
    completedAt: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoIndexArtifact", {
    description: "Deterministic index artifact persisted for a completed repository index run.",
  })
) {}

class RepoRow extends S.Class<RepoRow>($I`RepoRow`)(
  {
    id: RepoId,
    repo_path: FilePath,
    display_name: S.String,
    language: S.Literal("typescript"),
    registered_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("RepoRow", {
    description: "SQLite row shape for persisted repo registrations.",
  })
) {}

class IndexArtifactRow extends S.Class<IndexArtifactRow>($I`IndexArtifactRow`)(
  {
    run_id: RunId,
    repo_id: RepoId,
    source_snapshot_id: S.String,
    indexed_file_count: NonNegativeInt,
    completed_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("IndexArtifactRow", {
    description: "SQLite row shape for persisted repo index artifacts.",
  })
) {}

class PacketRow extends S.Class<PacketRow>($I`PacketRow`)(
  {
    run_id: RunId,
    packet_json: S.String,
  },
  $I.annote("PacketRow", {
    description: "SQLite row shape for persisted retrieval packets.",
  })
) {}

const decodeRepoRow = S.decodeUnknownEffect(RepoRow);
const decodeIndexArtifactRow = S.decodeUnknownEffect(IndexArtifactRow);
const decodePacketRow = S.decodeUnknownEffect(PacketRow);

/**
 * Service contract for the local repo-memory persistence boundary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface LocalRepoMemoryDriverShape {
  readonly getRepo: (repoId: RepoId) => Effect.Effect<RepoRegistration, LocalRepoMemoryDriverError>;
  readonly getRetrievalPacket: (runId: RunId) => Effect.Effect<O.Option<RetrievalPacket>, LocalRepoMemoryDriverError>;
  readonly latestIndexArtifact: (
    repoId: RepoId
  ) => Effect.Effect<O.Option<RepoIndexArtifact>, LocalRepoMemoryDriverError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, LocalRepoMemoryDriverError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, LocalRepoMemoryDriverError>;
  readonly saveIndexArtifact: (
    artifact: RepoIndexArtifact
  ) => Effect.Effect<RepoIndexArtifact, LocalRepoMemoryDriverError>;
  readonly saveRetrievalPacket: (
    runId: RunId,
    packet: RetrievalPacket
  ) => Effect.Effect<RetrievalPacket, LocalRepoMemoryDriverError>;
}

/**
 * Service tag for the local repo-memory persistence driver.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class LocalRepoMemoryDriver extends ServiceMap.Service<LocalRepoMemoryDriver, LocalRepoMemoryDriverShape>()(
  $I`LocalRepoMemoryDriver`
) {
  static readonly layer = (
    config: LocalRepoMemoryDriverConfig
  ): Layer.Layer<
    LocalRepoMemoryDriver,
    LocalRepoMemoryDriverError,
    FileSystem.FileSystem | Path.Path | SqlClient.SqlClient
  > =>
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
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const reposTable = sql("repo_memory_repos");
  const indexArtifactsTable = sql("repo_memory_index_artifacts");
  const retrievalPacketsTable = sql("repo_memory_retrieval_packets");
  const citationsTable = sql("repo_memory_citations");

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

  const initializeTables = Effect.fn("LocalRepoMemoryDriver.initializeTables")(function* (): Effect.fn.Return<
    void,
    LocalRepoMemoryDriverError
  > {
    yield* sql`
      CREATE TABLE IF NOT EXISTS ${reposTable} (
        id TEXT PRIMARY KEY,
        repo_path TEXT NOT NULL UNIQUE,
        display_name TEXT NOT NULL,
        language TEXT NOT NULL,
        registered_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create repo registration table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${indexArtifactsTable} (
        run_id TEXT PRIMARY KEY,
        repo_id TEXT NOT NULL,
        source_snapshot_id TEXT NOT NULL,
        indexed_file_count INTEGER NOT NULL,
        completed_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create index artifact table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${retrievalPacketsTable} (
        run_id TEXT PRIMARY KEY,
        packet_json TEXT NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create retrieval packet table.", 500, cause)));

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${citationsTable} (
        citation_id TEXT PRIMARY KEY,
        run_id TEXT NOT NULL,
        repo_id TEXT NOT NULL,
        label TEXT NOT NULL,
        rationale TEXT NOT NULL,
        file_path TEXT NOT NULL,
        start_line INTEGER NOT NULL,
        end_line INTEGER NOT NULL,
        start_column INTEGER,
        end_column INTEGER,
        symbol_name TEXT
      )
    `.pipe(Effect.mapError((cause) => toDriverError("Failed to create citation backing table.", 500, cause)));
  });

  const repoRowToRegistration = (row: RepoRow): RepoRegistration =>
    new RepoRegistration({
      id: row.id,
      repoPath: row.repo_path,
      displayName: row.display_name,
      language: "typescript",
      registeredAt: row.registered_at,
    });

  const indexArtifactRowToModel = (row: IndexArtifactRow): RepoIndexArtifact =>
    new RepoIndexArtifact({
      runId: row.run_id,
      repoId: row.repo_id,
      sourceSnapshotId: row.source_snapshot_id,
      indexedFileCount: row.indexed_file_count,
      completedAt: row.completed_at,
    });

  const packetRowToModel = (row: PacketRow) =>
    decodePacketJson(row.packet_json).pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to decode retrieval packet for run "${row.run_id}".`, 500, cause)
      )
    );

  const repoIdFromPath = Effect.fn("LocalRepoMemoryDriver.repoIdFromPath")(function* (
    normalizedRepoPath: string
  ): Effect.fn.Return<RepoId, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_path: normalizedRepoPath });

    return yield* decodeSha256Hex(new TextEncoder().encode(normalizedRepoPath)).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to hash repository path "${normalizedRepoPath}".`, 500, cause)),
      Effect.map((digest) => decodeRepoId(`repo:${digest}`))
    );
  });

  const insertCitationRows = Effect.fn("LocalRepoMemoryDriver.insertCitationRows")(function* (
    runId: RunId,
    packet: RetrievalPacket
  ): Effect.fn.Return<void, LocalRepoMemoryDriverError> {
    yield* sql`DELETE FROM ${citationsTable} WHERE run_id = ${runId}`.pipe(
      Effect.mapError((cause) => toDriverError(`Failed to clear citations for run "${runId}".`, 500, cause))
    );

    if (A.isReadonlyArrayEmpty(packet.citations)) {
      return;
    }

    for (const citation of packet.citations) {
      yield* sql`
        INSERT INTO ${citationsTable} (
          citation_id,
          run_id,
          repo_id,
          label,
          rationale,
          file_path,
          start_line,
          end_line,
          start_column,
          end_column,
          symbol_name
        ) VALUES (
          ${citation.id},
          ${runId},
          ${citation.repoId},
          ${citation.label},
          ${citation.rationale},
          ${citation.span.filePath},
          ${citation.span.startLine},
          ${citation.span.endLine},
          ${pipe(citation.span.startColumn, O.getOrNull)},
          ${pipe(citation.span.endColumn, O.getOrNull)},
          ${pipe(citation.span.symbolName, O.getOrNull)}
        )
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to persist citation backing record "${citation.id}" for run "${runId}".`, 500, cause)
        )
      );
    }
  });

  yield* fs
    .makeDirectory(config.appDataDir, { recursive: true })
    .pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to create repo-memory app data directory at "${config.appDataDir}".`, 500, cause)
      )
    );
  yield* initializeTables();

  const listRepos: LocalRepoMemoryDriverShape["listRepos"] = sql<RepoRow>`
    SELECT id, repo_path, display_name, language, registered_at
    FROM ${reposTable}
    ORDER BY registered_at ASC
  `.pipe(
    Effect.flatMap((rows) => Effect.forEach(rows, (row) => decodeRepoRow(row).pipe(Effect.map(repoRowToRegistration)))),
    Effect.mapError((cause) => toDriverError("Failed to list registered repositories.", 500, cause)),
    Effect.withSpan("LocalRepoMemoryDriver.listRepos"),
    Effect.annotateLogs({ component: "repo-memory-driver" })
  );

  const getRepo: LocalRepoMemoryDriverShape["getRepo"] = Effect.fn("LocalRepoMemoryDriver.getRepo")(
    function* (repoId): Effect.fn.Return<RepoRegistration, LocalRepoMemoryDriverError> {
      yield* annotateDriverSpan({ repo_id: repoId });

      const rows = yield* sql<RepoRow>`
        SELECT id, repo_path, display_name, language, registered_at
        FROM ${reposTable}
        WHERE id = ${repoId}
        LIMIT 1
      `.pipe(Effect.mapError((cause) => toDriverError(`Failed to load repository "${repoId}".`, 500, cause)));

      const row = rows[0];
      if (!row) {
        return yield* toDriverError(`Repository not found: "${repoId}".`, 404);
      }

      return repoRowToRegistration(
        yield* decodeRepoRow(row).pipe(
          Effect.mapError((cause) => toDriverError(`Failed to decode repository "${repoId}".`, 500, cause))
        )
      );
    }
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

      const existingRows = yield* sql<RepoRow>`
        SELECT id, repo_path, display_name, language, registered_at
        FROM ${reposTable}
        WHERE repo_path = ${normalizedRepoPath}
        LIMIT 1
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(
            `Failed to check for an existing repository registration at "${normalizedRepoPath}".`,
            500,
            cause
          )
        )
      );

      const existing = existingRows[0];
      if (existing) {
        return repoRowToRegistration(
          yield* decodeRepoRow(existing).pipe(
            Effect.mapError((cause) =>
              toDriverError(`Failed to decode existing repository registration at "${normalizedRepoPath}".`, 500, cause)
            )
          )
        );
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
        registeredAt: yield* DateTime.now,
      });

      yield* sql`
        INSERT INTO ${reposTable} (id, repo_path, display_name, language, registered_at)
        VALUES (
          ${registration.id},
          ${registration.repoPath},
          ${registration.displayName},
          ${registration.language},
          ${DateTime.toEpochMillis(registration.registeredAt)}
        )
      `.pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to persist repository registration for "${registration.repoPath}".`, 500, cause)
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

  const latestIndexArtifact: LocalRepoMemoryDriverShape["latestIndexArtifact"] = Effect.fn(
    "LocalRepoMemoryDriver.latestIndexArtifact"
  )(function* (repoId): Effect.fn.Return<O.Option<RepoIndexArtifact>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: repoId });

    const rows = yield* sql<IndexArtifactRow>`
      SELECT run_id, repo_id, source_snapshot_id, indexed_file_count, completed_at
      FROM ${indexArtifactsTable}
      WHERE repo_id = ${repoId}
      ORDER BY completed_at DESC
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to load latest index artifact for repo "${repoId}".`, 500, cause)
      )
    );

    const row = rows[0];
    if (!row) {
      return O.none();
    }

    return O.some(
      indexArtifactRowToModel(
        yield* decodeIndexArtifactRow(row).pipe(
          Effect.mapError((cause) => toDriverError(`Failed to decode index artifact for repo "${repoId}".`, 500, cause))
        )
      )
    );
  });

  const saveIndexArtifact: LocalRepoMemoryDriverShape["saveIndexArtifact"] = Effect.fn(
    "LocalRepoMemoryDriver.saveIndexArtifact"
  )(function* (artifact): Effect.fn.Return<RepoIndexArtifact, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: artifact.repoId, run_id: artifact.runId });

    yield* sql`
      INSERT INTO ${indexArtifactsTable} (
        run_id,
        repo_id,
        source_snapshot_id,
        indexed_file_count,
        completed_at
      ) VALUES (
        ${artifact.runId},
        ${artifact.repoId},
        ${artifact.sourceSnapshotId},
        ${artifact.indexedFileCount},
        ${DateTime.toEpochMillis(artifact.completedAt)}
      )
      ON CONFLICT(run_id) DO UPDATE SET
        repo_id = excluded.repo_id,
        source_snapshot_id = excluded.source_snapshot_id,
        indexed_file_count = excluded.indexed_file_count,
        completed_at = excluded.completed_at
    `.pipe(
      Effect.mapError((cause) =>
        toDriverError(`Failed to persist index artifact for run "${artifact.runId}".`, 500, cause)
      )
    );

    return artifact;
  });

  const saveRetrievalPacket: LocalRepoMemoryDriverShape["saveRetrievalPacket"] = Effect.fn(
    "LocalRepoMemoryDriver.saveRetrievalPacket"
  )(function* (runId, packet): Effect.fn.Return<RetrievalPacket, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ repo_id: packet.repoId, run_id: runId });

    const packetJson = yield* encodePacketJson(packet).pipe(
      Effect.mapError((cause) => toDriverError(`Failed to encode retrieval packet for run "${runId}".`, 500, cause))
    );

    yield* sql
      .withTransaction(
        Effect.gen(function* () {
          yield* sql`
          INSERT INTO ${retrievalPacketsTable} (run_id, packet_json)
          VALUES (${runId}, ${packetJson})
          ON CONFLICT(run_id) DO UPDATE SET packet_json = excluded.packet_json
        `;
          yield* insertCitationRows(runId, packet);
        })
      )
      .pipe(
        Effect.mapError((cause) => toDriverError(`Failed to persist retrieval packet for run "${runId}".`, 500, cause))
      );

    return packet;
  });

  const getRetrievalPacket: LocalRepoMemoryDriverShape["getRetrievalPacket"] = Effect.fn(
    "LocalRepoMemoryDriver.getRetrievalPacket"
  )(function* (runId): Effect.fn.Return<O.Option<RetrievalPacket>, LocalRepoMemoryDriverError> {
    yield* annotateDriverSpan({ run_id: runId });

    const rows = yield* sql<PacketRow>`
      SELECT run_id, packet_json
      FROM ${retrievalPacketsTable}
      WHERE run_id = ${runId}
      LIMIT 1
    `.pipe(
      Effect.mapError((cause) => toDriverError(`Failed to load retrieval packet for run "${runId}".`, 500, cause))
    );

    const row = rows[0];
    if (!row) {
      return O.none();
    }

    return O.some(
      yield* decodePacketRow(row).pipe(
        Effect.mapError((cause) =>
          toDriverError(`Failed to decode retrieval packet row for run "${runId}".`, 500, cause)
        ),
        Effect.flatMap(packetRowToModel)
      )
    );
  });

  return {
    getRepo,
    getRetrievalPacket,
    latestIndexArtifact,
    listRepos,
    registerRepo,
    saveIndexArtifact,
    saveRetrievalPacket,
  } satisfies LocalRepoMemoryDriverShape;
});
