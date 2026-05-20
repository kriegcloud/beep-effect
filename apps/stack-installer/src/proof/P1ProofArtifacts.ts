/**
 * P1 Manual Mode proof artifact naming and status helpers.
 *
 * @packageDocumentation
 * @category utilities
 * @since 0.0.0
 */

import * as A from "effect/Array";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";

/**
 * Proof JSON artifact file name.
 *
 * @category constants
 * @since 0.0.0
 */
export const PROOF_FILE_NAME = "proof.json";

/**
 * Operator command transcript artifact file name.
 *
 * @category constants
 * @since 0.0.0
 */
export const COMMANDS_FILE_NAME = "commands.txt";

/**
 * SHA-256 checksum artifact file name.
 *
 * @category constants
 * @since 0.0.0
 */
export const CHECKSUMS_FILE_NAME = "sha256sums.txt";

/**
 * Required P1 fresh-machine proof platforms.
 *
 * @category constants
 * @since 0.0.0
 */
export const P1_REQUIRED_PLATFORMS = ["macos", "windows"] as const;

/**
 * Required P1 fresh-machine proof platform.
 *
 * @category type-level
 * @since 0.0.0
 */
export type P1RequiredPlatform = (typeof P1_REQUIRED_PLATFORMS)[number];

const MACOS_BUNDLE_FILE_NAME = "stack-installer-p1-macos.tgz";
const WINDOWS_BUNDLE_FILE_NAME = "stack-installer-p1-windows.zip";

/**
 * Native extraction process for a returned proof bundle.
 *
 * @category models
 * @since 0.0.0
 */
type P1ProofBundleExtractionProcess = {
  readonly command: string;
  readonly args: ReadonlyArray<string>;
};

/**
 * Paths used to extract a returned proof bundle.
 *
 * @category models
 * @since 0.0.0
 */
type P1ProofBundleExtractionOptions = {
  readonly bundlePath: string;
  readonly outputRoot: string;
};

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
 * @category predicates
 * @since 0.0.0
 */
export const isP1ProofEvidenceFileName = (name: string): boolean =>
  name === PROOF_FILE_NAME || name === COMMANDS_FILE_NAME || Str.startsWith("screencast.")(name);

/**
 * Check whether an artifact name should appear in status output.
 *
 * @category predicates
 * @since 0.0.0
 */
export const isP1ProofArtifactStatusFileName = (name: string): boolean =>
  isP1ProofEvidenceFileName(name) || name === CHECKSUMS_FILE_NAME;

/**
 * Return the required files missing from a platform proof directory.
 *
 * @category utilities
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
 * @category getters
 * @since 0.0.0
 */
export const p1ProofBundleFileNameForPlatform = (platform: P1RequiredPlatform): string =>
  platform === "macos" ? MACOS_BUNDLE_FILE_NAME : WINDOWS_BUNDLE_FILE_NAME;

/**
 * Build the coordinator extraction command for a returned proof bundle.
 *
 * @category formatting
 * @since 0.0.0
 */
export const p1ProofBundleExtractionCommand: {
  (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): string;
  (options: P1ProofBundleExtractionOptions): (platform: P1RequiredPlatform) => string;
} = dual(2, (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): string =>
  platform === "macos"
    ? `tar -xzf ${shellQuote(options.bundlePath)} -C ${shellQuote(options.outputRoot)}`
    : `unzip -o ${shellQuote(options.bundlePath)} -d ${shellQuote(options.outputRoot)}`
);

/**
 * Build the native extraction process for a returned proof bundle.
 *
 * @category factories
 * @since 0.0.0
 */
export const p1ProofBundleExtractionProcess: {
  (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): P1ProofBundleExtractionProcess;
  (options: P1ProofBundleExtractionOptions): (platform: P1RequiredPlatform) => P1ProofBundleExtractionProcess;
} = dual(
  2,
  (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): P1ProofBundleExtractionProcess =>
    platform === "macos"
      ? { args: ["-xzf", options.bundlePath, "-C", options.outputRoot], command: "tar" }
      : { args: ["-o", options.bundlePath, "-d", options.outputRoot], command: "unzip" }
);

/**
 * Build the native listing process for a returned proof bundle.
 *
 * @category factories
 * @since 0.0.0
 */
export const p1ProofBundleListingProcess: {
  (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): P1ProofBundleExtractionProcess;
  (options: P1ProofBundleExtractionOptions): (platform: P1RequiredPlatform) => P1ProofBundleExtractionProcess;
} = dual(
  2,
  (platform: P1RequiredPlatform, options: P1ProofBundleExtractionOptions): P1ProofBundleExtractionProcess =>
    platform === "macos"
      ? { args: ["-tzf", options.bundlePath], command: "tar" }
      : { args: ["-Z1", options.bundlePath], command: "unzip" }
);
