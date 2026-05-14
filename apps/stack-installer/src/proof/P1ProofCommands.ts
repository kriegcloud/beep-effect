/**
 * P1 Manual Mode operator command transcript helpers.
 *
 * @packageDocumentation
 * @category proof
 * @since 0.0.0
 */

import type { P1ManualProofRequest } from "@beep/installer-workspace-use-cases";
import * as A from "effect/Array";
import * as Str from "effect/String";

const shellQuote = (value: string): string => `'${Str.replaceAll("'", "'\"'\"'")(value)}'`;

const powerShellQuote = (value: string): string => `'${Str.replaceAll("'", "''")(value)}'`;

const buildBashP1ProofCommandsText = (request: P1ManualProofRequest, requestJson: string, outputDir: string): string =>
  A.join("\n")([
    "# Stack Installer P1 Manual Mode proof commands",
    "# This transcript records the commands required for the fresh-machine proof.",
    "# Inputs must contain only 1Password references, never plaintext secrets.",
    `targetPlatform=${request.targetPlatform}`,
    `operatorLabel=${request.operatorLabel}`,
    `outputDir=${outputDir}`,
    "",
    "git status --short --branch",
    "bun install",
    "bun run config-sync:check",
    "(cd apps/stack-installer && bun run build)",
    "(cd apps/stack-installer/src-tauri && cargo check)",
    "command -v op",
    "command -v claude",
    "command -v codex",
    "op whoami",
    "claude auth status",
    "codex login status",
    `(cd apps/stack-installer && bun run p1:proof:capture -- --request-json ${shellQuote(requestJson)} --output-dir ${shellQuote(outputDir)})`,
    "",
    "# After recording screencast.*, refresh checksums without re-sending the Discord proof message:",
    `(cd apps/stack-installer && bun run p1:proof:checksums -- --output-dir ${shellQuote(outputDir)})`,
    `(cd apps/stack-installer && bun run p1:proof:audit -- --output-dir ${shellQuote(outputDir)})`,
    "",
  ]);

const buildPowerShellP1ProofCommandsText = (
  request: P1ManualProofRequest,
  requestJson: string,
  outputDir: string
): string =>
  A.join("\n")([
    "# Stack Installer P1 Manual Mode proof commands",
    "# This transcript records the commands required for the fresh-machine proof.",
    "# Inputs must contain only 1Password references, never plaintext secrets.",
    `$env:STACK_INSTALLER_PLATFORM = ${powerShellQuote(request.targetPlatform)}`,
    `$env:STACK_INSTALLER_OPERATOR_LABEL = ${powerShellQuote(request.operatorLabel)}`,
    `$stackInstallerRequestJson = ${powerShellQuote(requestJson)}`,
    `$stackInstallerOutputDir = ${powerShellQuote(outputDir)}`,
    "",
    "git status --short --branch",
    "bun install",
    "bun run config-sync:check",
    "Push-Location apps/stack-installer",
    "bun run build",
    "Pop-Location",
    "Push-Location apps/stack-installer/src-tauri",
    "cargo check",
    "Pop-Location",
    "Get-Command op",
    "Get-Command claude",
    "Get-Command codex",
    "op whoami",
    "claude auth status",
    "codex login status",
    "Push-Location apps/stack-installer",
    'bun run p1:proof:capture -- --request-json "$stackInstallerRequestJson" --output-dir "$stackInstallerOutputDir"',
    "Pop-Location",
    "",
    "# After recording screencast.*, refresh checksums without re-sending the Discord proof message:",
    "Push-Location apps/stack-installer",
    'bun run p1:proof:checksums -- --output-dir "$stackInstallerOutputDir"',
    'bun run p1:proof:audit -- --output-dir "$stackInstallerOutputDir"',
    "Pop-Location",
    "",
  ]);

/**
 * Build the operator command transcript stored as `commands.txt`.
 *
 * @category proof
 * @since 0.0.0
 */
export const buildP1ProofCommandsText = (
  request: P1ManualProofRequest,
  requestJson: string,
  outputDir: string
): string =>
  request.targetPlatform === "windows"
    ? buildPowerShellP1ProofCommandsText(request, requestJson, outputDir)
    : buildBashP1ProofCommandsText(request, requestJson, outputDir);
