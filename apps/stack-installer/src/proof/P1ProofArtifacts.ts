/**
 * P1 Manual Mode proof artifact naming and status helpers.
 *
 * @packageDocumentation
 * @category proof
 * @since 0.0.0
 */

import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * Proof JSON artifact file name.
 *
 * @category proof
 * @since 0.0.0
 */
export const PROOF_FILE_NAME = "proof.json";

/**
 * Operator command transcript artifact file name.
 *
 * @category proof
 * @since 0.0.0
 */
export const COMMANDS_FILE_NAME = "commands.txt";

/**
 * SHA-256 checksum artifact file name.
 *
 * @category proof
 * @since 0.0.0
 */
export const CHECKSUMS_FILE_NAME = "sha256sums.txt";

/**
 * Required P1 fresh-machine proof platforms.
 *
 * @category proof
 * @since 0.0.0
 */
export const P1_REQUIRED_PLATFORMS = ["macos", "windows"] as const;

/**
 * Required P1 fresh-machine proof platform.
 *
 * @category proof
 * @since 0.0.0
 */
export type P1RequiredPlatform = (typeof P1_REQUIRED_PLATFORMS)[number];

const MACOS_BUNDLE_FILE_NAME = "stack-installer-p1-macos.tgz";
const WINDOWS_BUNDLE_FILE_NAME = "stack-installer-p1-windows.zip";

const shellQuote = (value: string): string => `'${Str.replaceAll("'", "'\"'\"'")(value)}'`;

const hasFileName = (fileNames: ReadonlyArray<string>, fileName: string): boolean =>
  pipe(
    fileNames,
    A.findFirst((name) => name === fileName),
    O.isSome
  );

/**
 * Check whether an artifact name is included in proof checksums.
 *
 * @category proof
 * @since 0.0.0
 */
export const isP1ProofEvidenceFileName = (name: string): boolean =>
  name === PROOF_FILE_NAME || name === COMMANDS_FILE_NAME || Str.startsWith("screencast.")(name);

/**
 * Check whether an artifact name should appear in status output.
 *
 * @category proof
 * @since 0.0.0
 */
export const isP1ProofArtifactStatusFileName = (name: string): boolean =>
  isP1ProofEvidenceFileName(name) || name === CHECKSUMS_FILE_NAME;

/**
 * Return the required files missing from a platform proof directory.
 *
 * @category proof
 * @since 0.0.0
 */
export const p1ProofMissingRequiredArtifactFiles = (fileNames: ReadonlyArray<string>): ReadonlyArray<string> =>
  A.getSomes([
    hasFileName(fileNames, PROOF_FILE_NAME) ? O.none() : O.some(PROOF_FILE_NAME),
    hasFileName(fileNames, COMMANDS_FILE_NAME) ? O.none() : O.some(COMMANDS_FILE_NAME),
    hasFileName(fileNames, CHECKSUMS_FILE_NAME) ? O.none() : O.some(CHECKSUMS_FILE_NAME),
    pipe(fileNames, A.some(Str.startsWith("screencast."))) ? O.none() : O.some("screencast.*"),
  ]);

/**
 * Return the coordinator bundle file name for a required platform.
 *
 * @category proof
 * @since 0.0.0
 */
export const p1ProofBundleFileNameForPlatform = (platform: P1RequiredPlatform): string =>
  platform === "macos" ? MACOS_BUNDLE_FILE_NAME : WINDOWS_BUNDLE_FILE_NAME;

/**
 * Build the coordinator extraction command for a returned proof bundle.
 *
 * @category proof
 * @since 0.0.0
 */
export const p1ProofBundleExtractionCommand = (
  platform: P1RequiredPlatform,
  bundlePath: string,
  outputRoot: string
): string =>
  platform === "macos"
    ? `tar -xzf ${shellQuote(bundlePath)} -C ${shellQuote(outputRoot)}`
    : `unzip -o ${shellQuote(bundlePath)} -d ${shellQuote(outputRoot)}`;
