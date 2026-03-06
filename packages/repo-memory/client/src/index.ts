import { $RepoMemoryClientId } from "@beep/identity/packages";
import type { RepoRegistration, RepoRun, SidecarBootstrap } from "@beep/runtime-protocol";
import { TaggedErrorClass } from "@beep/schema";
import { type Effect, ServiceMap } from "effect";
import * as S from "effect/Schema";

const $I = $RepoMemoryClientId.create("index");

/**
 * Configuration for connecting to the local repo-memory sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RepoMemoryClientConfig extends S.Class<RepoMemoryClientConfig>($I`RepoMemoryClientConfig`)(
  {
    baseUrl: S.String,
    sessionId: S.String,
  },
  $I.annote("RepoMemoryClientConfig", {
    description: "Client configuration for calling the local repo-memory sidecar.",
  })
) {}

/**
 * Typed client error for repo-memory sidecar communication failures.
 *
 * @since 0.0.0
 * @category Errors
 */
export class RepoMemoryClientError extends TaggedErrorClass<RepoMemoryClientError>($I`RepoMemoryClientError`)(
  "RepoMemoryClientError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("RepoMemoryClientError", {
    description: "Typed client error for local sidecar communication failures.",
  })
) {}

/**
 * Service contract for interacting with the local repo-memory sidecar.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface RepoMemoryClientShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, RepoMemoryClientError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryClientError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryClientError>;
}

/**
 * Service tag for the repo-memory sidecar client.
 *
 * @since 0.0.0
 * @category PortContract
 */
export class RepoMemoryClient extends ServiceMap.Service<RepoMemoryClient, RepoMemoryClientShape>()(
  $I`RepoMemoryClient`
) {}
