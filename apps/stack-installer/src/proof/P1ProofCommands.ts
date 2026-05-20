/**
 * P1 Manual Mode operator command transcript helpers.
 *
 * @packageDocumentation
 * @category formatting
 * @since 0.0.0
 */

import type { P1ManualProofRequest } from "@beep/installer-use-cases";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as Str from "effect/String";

/**
 * Inputs used to build a proof command transcript.
 *
 * @category models
 * @since 0.0.0
 */
type P1ProofCommandsTextOptions = {
  readonly requestJson: string;
  readonly outputDir: string;
};

const shellQuote = (value: string): string => `'${Str.replaceAll("'", "'\"'\"'")(value)}'`;

const powerShellQuote = (value: string): string => `'${Str.replaceAll("'", "''")(value)}'`;

const redactedRequestJsonPlaceholder = "<redacted P1 request JSON; use the coordinator-approved local request>";

const hasBashProofCommandMarkers = (commandsText: string): boolean =>
  Str.includes("command -v op")(commandsText) &&
  Str.includes("(cd apps/stack-installer && bun run p1:proof:capture")(commandsText);

const hasPowerShellProofCommandMarkers = (commandsText: string): boolean =>
  Str.includes("Get-Command op")(commandsText) &&
  Str.includes(
    'bun run p1:proof:capture -- --request-json "$stackInstallerRequestJson" --output-dir "$stackInstallerOutputDir"'
  )(commandsText);

const buildBashP1ProofCommandsText = (request: P1ManualProofRequest, _requestJson: string, outputDir: string): string =>
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
    `# Set STACK_INSTALLER_P1_REQUEST_JSON to the coordinator-approved local request JSON before running capture.`,
    `# STACK_INSTALLER_P1_REQUEST_JSON=${shellQuote(redactedRequestJsonPlaceholder)}`,
    `# (cd apps/stack-installer && bun run p1:proof:capture -- --request-json "$STACK_INSTALLER_P1_REQUEST_JSON" --output-dir ${shellQuote(outputDir)})`,
    "",
    "# After recording screencast.*, refresh checksums without re-sending the Discord proof message:",
    `(cd apps/stack-installer && bun run p1:proof:checksums -- --output-dir ${shellQuote(outputDir)})`,
    `(cd apps/stack-installer && bun run p1:proof:audit -- --output-dir ${shellQuote(outputDir)})`,
    "",
  ]);

const buildPowerShellP1ProofCommandsText = (
  request: P1ManualProofRequest,
  _requestJson: string,
  outputDir: string
): string =>
  A.join("\n")([
    "# Stack Installer P1 Manual Mode proof commands",
    "# This transcript records the commands required for the fresh-machine proof.",
    "# Inputs must contain only 1Password references, never plaintext secrets.",
    `$env:STACK_INSTALLER_PLATFORM = ${powerShellQuote(request.targetPlatform)}`,
    `$env:STACK_INSTALLER_OPERATOR_LABEL = ${powerShellQuote(request.operatorLabel)}`,
    "# Set $stackInstallerRequestJson to the coordinator-approved local request JSON before running capture.",
    `# $stackInstallerRequestJson = ${powerShellQuote(redactedRequestJsonPlaceholder)}`,
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
    '# bun run p1:proof:capture -- --request-json "$stackInstallerRequestJson" --output-dir "$stackInstallerOutputDir"',
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
 * @category formatting
 * @since 0.0.0
 */
export const buildP1ProofCommandsText: {
  (request: P1ManualProofRequest, options: P1ProofCommandsTextOptions): string;
  (options: P1ProofCommandsTextOptions): (request: P1ManualProofRequest) => string;
} = dual(2, (request: P1ManualProofRequest, options: P1ProofCommandsTextOptions): string =>
  request.targetPlatform === "windows"
    ? buildPowerShellP1ProofCommandsText(request, options.requestJson, options.outputDir)
    : buildBashP1ProofCommandsText(request, options.requestJson, options.outputDir)
);

/**
 * Check whether `commands.txt` contains the expected platform transcript.
 *
 * @category predicates
 * @since 0.0.0
 */
export const p1ProofCommandsTextMatchesPlatform: {
  (commandsText: string, platform: P1ManualProofRequest["targetPlatform"]): boolean;
  (platform: P1ManualProofRequest["targetPlatform"]): (commandsText: string) => boolean;
} = dual(2, (commandsText: string, platform: P1ManualProofRequest["targetPlatform"]): boolean =>
  platform === "windows"
    ? hasPowerShellProofCommandMarkers(commandsText) && !hasBashProofCommandMarkers(commandsText)
    : hasBashProofCommandMarkers(commandsText) && !hasPowerShellProofCommandMarkers(commandsText)
);
