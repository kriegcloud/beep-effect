import type { SessionId } from "@template/domain/ids"
import { Effect, FileSystem, Layer, Path, ServiceMap } from "effect"
import { StorageLayout } from "./StorageLayout.js"

export interface SessionFileStoreService {
  readonly appendTranscript: (sessionId: SessionId, content: string) => Effect.Effect<void>
  readonly writeTranscript: (sessionId: SessionId, content: string) => Effect.Effect<void>
  readonly appendEventLine: (sessionId: SessionId, line: string) => Effect.Effect<void>
  readonly writeEventLines: (
    sessionId: SessionId,
    lines: ReadonlyArray<string>
  ) => Effect.Effect<void>
  readonly writeArtifactLink: (
    sessionId: SessionId,
    sessionArtifactId: string,
    payload: unknown
  ) => Effect.Effect<void>
}

const readFileOrEmpty = (
  fs: FileSystem.FileSystem,
  filePath: string
): Effect.Effect<string> =>
  fs.readFileString(filePath).pipe(
    Effect.catchTag("PlatformError", (error) =>
      error.reason._tag === "NotFound"
        ? Effect.succeed("")
        : Effect.fail(error)
    ),
    Effect.orDie
  )

const ensureDirForFile = (
  fs: FileSystem.FileSystem,
  pathService: Path.Path,
  filePath: string
): Effect.Effect<void> =>
  fs.makeDirectory(pathService.dirname(filePath), { recursive: true }).pipe(
    Effect.orDie
  )

const appendFile = (
  fs: FileSystem.FileSystem,
  pathService: Path.Path,
  filePath: string,
  content: string
): Effect.Effect<void> =>
  Effect.gen(function*() {
    yield* ensureDirForFile(fs, pathService, filePath)
    const existing = yield* readFileOrEmpty(fs, filePath)
    yield* fs.writeFileString(filePath, `${existing}${content}`)
  }).pipe(Effect.orDie)

const writeFile = (
  fs: FileSystem.FileSystem,
  pathService: Path.Path,
  filePath: string,
  content: string
): Effect.Effect<void> =>
  Effect.gen(function*() {
    yield* ensureDirForFile(fs, pathService, filePath)
    yield* fs.writeFileString(filePath, content)
  }).pipe(Effect.orDie)

export class SessionFileStore extends ServiceMap.Service<SessionFileStore>()(
  "server/storage/SessionFileStore",
  {
    make: Effect.gen(function*() {
      const fs = yield* FileSystem.FileSystem
      const pathService = yield* Path.Path
      const storageLayout = yield* StorageLayout

      const appendTranscript: SessionFileStoreService["appendTranscript"] = (
        sessionId,
        content
      ) => appendFile(fs, pathService, storageLayout.sessionTranscriptPath(sessionId), content)

      const writeTranscript: SessionFileStoreService["writeTranscript"] = (
        sessionId,
        content
      ) => writeFile(fs, pathService, storageLayout.sessionTranscriptPath(sessionId), content)

      const appendEventLine: SessionFileStoreService["appendEventLine"] = (
        sessionId,
        line
      ) =>
        appendFile(
          fs,
          pathService,
          storageLayout.sessionEventsPath(sessionId),
          line.endsWith("\n") ? line : `${line}\n`
        )

      const writeEventLines: SessionFileStoreService["writeEventLines"] = (
        sessionId,
        lines
      ) =>
        writeFile(
          fs,
          pathService,
          storageLayout.sessionEventsPath(sessionId),
          lines.map((line) => line.endsWith("\n") ? line : `${line}\n`).join("")
        )

      const writeArtifactLink: SessionFileStoreService["writeArtifactLink"] = (
        sessionId,
        sessionArtifactId,
        payload
      ) =>
        writeFile(
          fs,
          pathService,
          storageLayout.sessionArtifactLinkPath(sessionId, sessionArtifactId),
          JSON.stringify(payload, null, 2)
        )

      return {
        appendTranscript,
        writeTranscript,
        appendEventLine,
        writeEventLines,
        writeArtifactLink
      } satisfies SessionFileStoreService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
