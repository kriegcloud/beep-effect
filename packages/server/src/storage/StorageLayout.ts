import type { SessionId } from "@template/domain/ids"
import { Effect, Layer, Path, ServiceMap } from "effect"
import { AgentConfig } from "../ai/AgentConfig.js"

export interface StorageLayoutService {
  readonly rootDir: string
  readonly artifactBlobPath: (sha256: string) => string
  readonly sessionRootDir: (sessionId: SessionId) => string
  readonly sessionTranscriptPath: (sessionId: SessionId) => string
  readonly sessionEventsPath: (sessionId: SessionId) => string
  readonly sessionArtifactsDir: (sessionId: SessionId) => string
  readonly sessionArtifactLinkPath: (
    sessionId: SessionId,
    sessionArtifactId: string
  ) => string
}

const normalizeSha256 = (sha256: string): string => sha256.trim().toLowerCase()

export class StorageLayout extends ServiceMap.Service<StorageLayout>()(
  "server/storage/StorageLayout",
  {
    make: Effect.gen(function*() {
      const agentConfig = yield* AgentConfig
      const pathService = yield* Path.Path
      const configPath = process.env.PA_CONFIG_PATH ?? "agent.yaml"
      const configDir = pathService.dirname(pathService.resolve(configPath))
      const rootDir = pathService.resolve(configDir, agentConfig.server.storage.rootDir)

      const artifactBlobPath = (sha256: string): string => {
        const normalized = normalizeSha256(sha256)
        const shardA = normalized.slice(0, 2)
        const shardB = normalized.slice(2, 4)
        return pathService.join(
          rootDir,
          "artifacts",
          "sha256",
          shardA,
          shardB,
          `${normalized}.blob`
        )
      }

      const sessionRootDir = (sessionId: SessionId): string =>
        pathService.join(rootDir, "sessions", String(sessionId))

      const sessionTranscriptPath = (sessionId: SessionId): string =>
        pathService.join(sessionRootDir(sessionId), "transcript.md")

      const sessionEventsPath = (sessionId: SessionId): string =>
        pathService.join(sessionRootDir(sessionId), "events", "events.jsonl")

      const sessionArtifactsDir = (sessionId: SessionId): string =>
        pathService.join(sessionRootDir(sessionId), "artifacts")

      const sessionArtifactLinkPath = (
        sessionId: SessionId,
        sessionArtifactId: string
      ): string =>
        pathService.join(
          sessionArtifactsDir(sessionId),
          `${sessionArtifactId}.link.json`
        )

      return {
        rootDir,
        artifactBlobPath,
        sessionRootDir,
        sessionTranscriptPath,
        sessionEventsPath,
        sessionArtifactsDir,
        sessionArtifactLinkPath
      } satisfies StorageLayoutService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
