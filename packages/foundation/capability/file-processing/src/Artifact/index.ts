/**
 * Artifact schemas for runtime-neutral file processing operations.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $FileProcessingId } from "@beep/identity";
import { LiteralKit, Sha256Hex } from "@beep/schema";
import { FileExtension } from "@beep/schema/FileExtension";
import { FileName } from "@beep/schema/FileName";
import { MimeType } from "@beep/schema/MimeType";
import { PosixPath } from "@beep/schema/PosixPath";
import * as S from "effect/Schema";

const $I = $FileProcessingId.create("Artifact");
const artifactExtensionPattern = /^[^./\\\u0000][^/\\\u0000]*$/u;
const artifactNamePattern = /^[^/\\\u0000]+$/u;

const ArtifactExtension = S.Union([
  FileExtension,
  S.NonEmptyString.check(
    S.makeFilter((value: string) => artifactExtensionPattern.test(value), {
      identifier: $I`ArtifactExtensionBareExtensionCheck`,
      title: "Artifact Extension",
      description:
        "A bare source extension. File processing accepts known MIME extensions plus local-corpus extensions such as pst.",
      message: "Expected a bare file extension without path separators, a leading dot, or NUL bytes.",
    })
  ),
]).pipe(
  $I.annoteSchema("ArtifactExtension", {
    description:
      "Bare source extension accepted by the file-processing boundary. Reuses FileExtension when possible while allowing local-corpus extensions absent from the shared MIME table.",
  })
);

const ArtifactName = S.Union([
  FileName,
  S.NonEmptyString.check(
    S.makeFilter((value: string) => artifactNamePattern.test(value), {
      identifier: $I`ArtifactNameNoPathSeparatorCheck`,
      title: "Artifact Name",
      description: "A source artifact name without path separators or embedded NUL bytes.",
      message: "Expected a file name without path separators or embedded NUL bytes.",
    })
  ),
]).pipe(
  $I.annoteSchema("ArtifactName", {
    description:
      "Portable source artifact name. Reuses FileName when the suffix is known while allowing extensionless or local-corpus file names.",
  })
);

/**
 * Stable artifact identifier derived from a content digest.
 *
 * @example
 * ```ts
 * import { ArtifactId } from "@beep/file-processing/Artifact"
 *
 * console.log(ArtifactId)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ArtifactId = S.TemplateLiteral(["artifact:", Sha256Hex]).pipe(
  S.brand("FileProcessingArtifactId"),
  $I.annoteSchema("ArtifactId", {
    description: "A stable file-processing artifact identifier derived from a SHA-256 content digest.",
  })
);

/**
 * Type for {@link ArtifactId}.
 *
 * @category models
 * @since 0.0.0
 */
export type ArtifactId = typeof ArtifactId.Type;

/**
 * Stable operation identifier derived from source, operation kind, and strategy.
 *
 * @example
 * ```ts
 * import { OperationId } from "@beep/file-processing/Artifact"
 *
 * console.log(OperationId)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const OperationId = S.TemplateLiteral(["operation:", Sha256Hex]).pipe(
  S.brand("FileProcessingOperationId"),
  $I.annoteSchema("OperationId", {
    description: "A stable file-processing operation identifier derived from operation inputs.",
  })
);

/**
 * Type for {@link OperationId}.
 *
 * @category models
 * @since 0.0.0
 */
export type OperationId = typeof OperationId.Type;

/**
 * SHA-256 content digest recorded with the source or emitted artifact.
 *
 * @example
 * ```ts
 * import { ContentDigest } from "@beep/file-processing/Artifact"
 *
 * console.log(ContentDigest)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ContentDigest = S.TemplateLiteral(["sha256:", Sha256Hex]).pipe(
  S.brand("FileProcessingContentDigest"),
  $I.annoteSchema("ContentDigest", {
    description: "A SHA-256 content digest using the sha256:<hex> representation.",
  })
);

/**
 * Type for {@link ContentDigest}.
 *
 * @category models
 * @since 0.0.0
 */
export type ContentDigest = typeof ContentDigest.Type;

/**
 * Origin kind for a source artifact locator.
 *
 * @example
 * ```ts
 * import { ArtifactLocatorKind } from "@beep/file-processing/Artifact"
 *
 * console.log(ArtifactLocatorKind)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const ArtifactLocatorKind = LiteralKit(["file", "synthetic", "memory"]).pipe(
  $I.annoteSchema("ArtifactLocatorKind", {
    description: "Runtime-neutral locator kinds accepted by file-processing operation inputs.",
  })
);

/**
 * Type for {@link ArtifactLocatorKind}.
 *
 * @category models
 * @since 0.0.0
 */
export type ArtifactLocatorKind = typeof ArtifactLocatorKind.Type;

/**
 * Runtime-neutral artifact locator.
 *
 * @example
 * ```ts
 * import { ArtifactLocator } from "@beep/file-processing/Artifact"
 * import { PosixPath } from "@beep/schema/PosixPath"
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const value = yield* S.decodeUnknownEffect(PosixPath)("fixtures/readme.md")
 *   return ArtifactLocator.make({ kind: "synthetic", value }).kind
 * })
 *
 * Effect.runPromise(program).then(console.log) // "synthetic"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ArtifactLocator extends S.Class<ArtifactLocator>($I`ArtifactLocator`)(
  {
    kind: ArtifactLocatorKind,
    value: PosixPath,
  },
  $I.annote("ArtifactLocator", {
    description: "Runtime-neutral locator for a source artifact.",
  })
) {}

/**
 * Source artifact supplied to a file-processing operation.
 *
 * @example
 * ```ts
 * import { SourceArtifact } from "@beep/file-processing/Artifact"
 *
 * console.log(SourceArtifact)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SourceArtifact extends S.Class<SourceArtifact>($I`SourceArtifact`)(
  {
    bytes: S.optionalKey(S.Uint8Array),
    digest: ContentDigest,
    extension: S.optionalKey(ArtifactExtension),
    id: ArtifactId,
    locator: ArtifactLocator,
    mediaType: S.optionalKey(MimeType),
    name: ArtifactName,
    relativePath: PosixPath,
    sizeBytes: S.Number,
    text: S.optionalKey(S.String),
  },
  $I.annote("SourceArtifact", {
    description: "Runtime-neutral source artifact metadata and optional in-memory bytes or text.",
  })
) {}

/**
 * Lightweight reference to a materialized artifact.
 *
 * @example
 * ```ts
 * import { ArtifactReference } from "@beep/file-processing/Artifact"
 *
 * console.log(ArtifactReference)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ArtifactReference extends S.Class<ArtifactReference>($I`ArtifactReference`)(
  {
    digest: S.optionalKey(ContentDigest),
    id: ArtifactId,
    mediaType: S.optionalKey(MimeType),
    relativePath: PosixPath,
    sizeBytes: S.optionalKey(S.Number),
  },
  $I.annote("ArtifactReference", {
    description: "Reference to an artifact materialized by an operation.",
  })
) {}
