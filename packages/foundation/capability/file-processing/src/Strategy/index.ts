/**
 * Strategy schemas for file-processing engine selection and V1 support.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FileProcessingId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $FileProcessingId.create("Strategy");

/**
 * Operation kinds supported by the capability contract.
 *
 * @example
 * ```ts
 * import { FileProcessingOperationKind } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingOperationKind)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileProcessingOperationKind = LiteralKit(["detect", "extract", "export-archive", "process"]).pipe(
  $I.annoteSchema("FileProcessingOperationKind", {
    description: "Operation kinds modeled by the file-processing capability.",
  })
);

/**
 * Type for {@link FileProcessingOperationKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileProcessingOperationKind = typeof FileProcessingOperationKind.Type;

/**
 * Concrete engine families known to P1.
 *
 * @example
 * ```ts
 * import { FileProcessingEngineFamily } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingEngineFamily)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileProcessingEngineFamily = LiteralKit(["auto", "tika", "libpff", "test"]).pipe(
  $I.annoteSchema("FileProcessingEngineFamily", {
    description: "Engine families selectable by file-processing strategies.",
  })
);

/**
 * Type for {@link FileProcessingEngineFamily}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileProcessingEngineFamily = typeof FileProcessingEngineFamily.Type;

/**
 * V1 file format families recognized by the capability.
 *
 * @example
 * ```ts
 * import { FileFormatFamily } from "@beep/file-processing/Strategy"
 *
 * console.log(FileFormatFamily)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileFormatFamily = LiteralKit([
  "doc",
  "docx",
  "docm",
  "rtf",
  "html",
  "xhtml",
  "pdf-text-layer",
  "pst",
  "plain-text",
  "markdown",
  "image-metadata",
  "xls",
  "xlsx",
  "unknown",
]).pipe(
  $I.annoteSchema("FileFormatFamily", {
    description: "Deterministic file format families recognized by V1 file processing.",
  })
);

/**
 * Type for {@link FileFormatFamily}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileFormatFamily = typeof FileFormatFamily.Type;

/**
 * Processing capability advertised by an engine.
 *
 * @example
 * ```ts
 * import { FileProcessingCapability } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingCapability)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileProcessingCapability = LiteralKit([
  "detect",
  "extract-text",
  "extract-metadata",
  "export-children",
]).pipe(
  $I.annoteSchema("FileProcessingCapability", {
    description: "Capability advertised by a file-processing engine.",
  })
);

/**
 * Type for {@link FileProcessingCapability}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileProcessingCapability = typeof FileProcessingCapability.Type;

/**
 * Support disposition selected for a source artifact.
 *
 * @example
 * ```ts
 * import { FileProcessingSupportDisposition } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingSupportDisposition)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileProcessingSupportDisposition = LiteralKit(["supported", "deferred", "unsupported"]).pipe(
  $I.annoteSchema("FileProcessingSupportDisposition", {
    description: "Whether an engine can process the source format in the current run.",
  })
);

/**
 * Type for {@link FileProcessingSupportDisposition}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileProcessingSupportDisposition = typeof FileProcessingSupportDisposition.Type;

/**
 * Reason a source was skipped or deferred.
 *
 * @example
 * ```ts
 * import { FileProcessingSkipReason } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingSkipReason)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const FileProcessingSkipReason = LiteralKit([
  "engine-unavailable",
  "fixture-unavailable",
  "format-out-of-scope",
  "unsupported-format",
  "operation-not-required",
]).pipe(
  $I.annoteSchema("FileProcessingSkipReason", {
    description: "Machine-readable reason for a deterministic skipped source.",
  })
);

/**
 * Type for {@link FileProcessingSkipReason}.
 *
 * @category models
 * @since 0.0.0
 */
export type FileProcessingSkipReason = typeof FileProcessingSkipReason.Type;

/**
 * Redacted technical failure raised inside a concrete driver boundary.
 *
 * @example
 * ```ts
 * import { FileProcessingDriverError } from "@beep/file-processing/Strategy"
 *
 * const error = FileProcessingDriverError.fromReason("tika", "engine-unavailable")
 * console.log(error.driver)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class FileProcessingDriverError extends TaggedErrorClass<FileProcessingDriverError>(
  $I`FileProcessingDriverError`
)(
  "FileProcessingDriverError",
  {
    cause: S.optionalKey(S.String),
    driver: FileProcessingEngineFamily,
    reason: S.NonEmptyString,
  },
  $I.annote("FileProcessingDriverError", {
    description: "Redacted technical failure raised inside a file-processing driver boundary.",
  })
) {
  /**
   * Create a redacted driver technical error.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    driver: FileProcessingEngineFamily,
    reason: string,
    options: { readonly cause?: string } = {}
  ): FileProcessingDriverError =>
    FileProcessingDriverError.make({
      driver,
      reason,
      ...O.getSomesStruct({
        cause: O.fromUndefinedOr(options.cause),
      }),
    });
}

/**
 * Bind a concrete engine family to a typed driver error factory.
 *
 * @example
 * ```ts
 * import { makeFileProcessingDriverErrorFactory } from "@beep/file-processing/Strategy"
 *
 * const makeTikaError = makeFileProcessingDriverErrorFactory("tika")
 * console.log(makeTikaError("engine-unavailable").reason)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeFileProcessingDriverErrorFactory =
  <Reason extends string>(driver: FileProcessingEngineFamily) =>
  (reason: Reason, options: { readonly cause?: string } = {}): FileProcessingDriverError =>
    FileProcessingDriverError.fromReason(driver, reason, options);

/**
 * Preferred engine selection for an operation.
 *
 * @example
 * ```ts
 * import { StrategyPreference } from "@beep/file-processing/Strategy"
 *
 * const preference = StrategyPreference.make({ engine: "auto" })
 * console.log(preference.engine)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class StrategyPreference extends S.Class<StrategyPreference>($I`StrategyPreference`)(
  {
    engine: FileProcessingEngineFamily,
  },
  $I.annote("StrategyPreference", {
    description: "Engine preference requested for a file-processing operation.",
  })
) {}

/**
 * Strategy selected for a concrete operation.
 *
 * @example
 * ```ts
 * import { SelectedStrategy } from "@beep/file-processing/Strategy"
 *
 * console.log(SelectedStrategy)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SelectedStrategy extends S.Class<SelectedStrategy>($I`SelectedStrategy`)(
  {
    disposition: FileProcessingSupportDisposition,
    engine: FileProcessingEngineFamily,
    format: FileFormatFamily,
    operationKind: FileProcessingOperationKind,
    skipReason: S.optionalKey(FileProcessingSkipReason),
  },
  $I.annote("SelectedStrategy", {
    description: "Resolved engine and support strategy for a source artifact operation.",
  })
) {}

/**
 * Runtime-neutral engine descriptor.
 *
 * @example
 * ```ts
 * import { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy"
 *
 * console.log(FileProcessingEngineDescriptor)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class FileProcessingEngineDescriptor extends S.Class<FileProcessingEngineDescriptor>(
  $I`FileProcessingEngineDescriptor`
)(
  {
    capabilities: S.Array(FileProcessingCapability),
    engine: FileProcessingEngineFamily,
    name: S.String,
    supportedFormats: S.Array(FileFormatFamily),
    version: S.optionalKey(S.String),
  },
  $I.annote("FileProcessingEngineDescriptor", {
    description: "Runtime-neutral descriptor for a file-processing engine implementation.",
  })
) {}
