/**
 * installer workspace server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import {
  P1A_DRY_RUN_SNAPSHOT_INPUT,
  P1A_WORKSPACE_VERB_INPUTS,
  WorkspaceDryRunPlan,
} from "@beep/installer-workspace-use-cases/public";
import { InstallerWorkspaceUseCases } from "@beep/installer-workspace-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeWorkspaceDryRunPlan = S.decodeUnknownEffect(WorkspaceDryRunPlan);

const p1aWorkspaceDryRunPlanInput = {
  notes: ["Workspace composition emits deterministic snapshots only; no OS files are written in P1A."],
  snapshot: P1A_DRY_RUN_SNAPSHOT_INPUT,
  verbs: P1A_WORKSPACE_VERB_INPUTS,
} as const;

/**
 * Build the deterministic workspace dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerWorkspaceServer = Effect.fn("InstallerWorkspaceServer.make")(function* () {
  const plan = yield* decodeWorkspaceDryRunPlan(p1aWorkspaceDryRunPlanInput);

  return {
    previewWorkspace: () => Effect.succeed(plan),
  };
});

/**
 * Deterministic workspace server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerWorkspaceServerLive = Layer.effect(InstallerWorkspaceUseCases, makeInstallerWorkspaceServer());
