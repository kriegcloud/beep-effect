import { $RepoMemoryClientId } from "@beep/identity/packages";
import type { RepoRegistration, RepoRun, SidecarBootstrap } from "@beep/runtime-protocol";
import { TaggedErrorClass } from "@beep/schema";
import { type Effect, ServiceMap } from "effect";
import * as S from "effect/Schema";

const $I = $RepoMemoryClientId.create("index");

export class RepoMemoryClientConfig extends S.Class<RepoMemoryClientConfig>($I`RepoMemoryClientConfig`)(
  {
    baseUrl: S.String,
    sessionId: S.String,
  },
  $I.annote("RepoMemoryClientConfig", {
    description: "Client configuration for calling the local repo-memory sidecar.",
  })
) {}

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

export interface RepoMemoryClientShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, RepoMemoryClientError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, RepoMemoryClientError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, RepoMemoryClientError>;
}

export class RepoMemoryClient extends ServiceMap.Service<RepoMemoryClient, RepoMemoryClientShape>()(
  $I`RepoMemoryClient`
) {}
