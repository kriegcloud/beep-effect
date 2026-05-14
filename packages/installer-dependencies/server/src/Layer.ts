/**
 * installer dependencies server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { HostDependencyPlan, P1A_HOST_DEPENDENCY_VERB_INPUTS } from "@beep/installer-dependencies-use-cases/public";
import { InstallerDependenciesUseCases } from "@beep/installer-dependencies-use-cases/server";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const decodeHostDependencyPlan = S.decodeUnknownEffect(HostDependencyPlan);

const p1aHostDependencyPlanInput = {
  dependencies: [
    {
      detectedVersion: "1.2.8",
      id: "git",
      installHint: "Use the platform package manager if Git is absent.",
      kind: "cli-tool",
      name: "Git",
      requiredVersion: ">=2.40",
      status: "present",
    },
    {
      id: "one-password-cli",
      installHint: "Install 1Password CLI and sign in before live credential validation.",
      kind: "cli-tool",
      name: "1Password CLI",
      requiredVersion: ">=2.20",
      status: "unknown",
    },
    {
      id: "discord-desktop",
      installHint: "Discord desktop is optional for the dry-run, but v1 validates Discord routing.",
      kind: "desktop-app",
      name: "Discord",
      status: "unknown",
    },
  ],
  notes: ["P1A records dependency intent only; no package manager commands are executed."],
  verbs: P1A_HOST_DEPENDENCY_VERB_INPUTS,
} as const;

/**
 * Build the deterministic dependency dry-run service.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeInstallerDependenciesServer = Effect.fn("InstallerDependenciesServer.make")(function* () {
  const plan = yield* decodeHostDependencyPlan(p1aHostDependencyPlanInput);

  return {
    previewHostDependencies: () => Effect.succeed(plan),
  };
});

/**
 * Deterministic dependency server layer for P1A.
 *
 * @category layers
 * @since 0.0.0
 */
export const InstallerDependenciesServerLive = Layer.effect(
  InstallerDependenciesUseCases,
  makeInstallerDependenciesServer()
);
