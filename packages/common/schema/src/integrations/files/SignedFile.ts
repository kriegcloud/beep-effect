/**
 * @fileoverview File Signature Schemas for Content Integrity Verification
 * @module @beep/schema/integrations/files/SignedFile
 * @since 1.0.0
 *
 * ## Overview
 * Provides schemas and utilities for attaching cryptographic signatures to file
 * metadata, enabling content integrity verification during upload workflows.
 * This module integrates with the existing `NormalizedFile` schema to add
 * MD5 content hash verification.
 *
 * ## Design Pattern
 * The `FileSignature` class encapsulates:
 * - `contentHash`: MD5 hex digest of file contents (32 lowercase hex chars)
 * - `signedAt`: UTC timestamp when the signature was created
 * - `uploadToken`: Optional token for linking to upload sessions
 *
 * The `withFileSignature` factory function uses schema composition to attach
 * a `signature` field to any schema containing a `file: File` property.
 *
 * ## Implementation Notes
 * The implementation agent should:
 * 1. Use `@beep/utils/md5` (ParallelHasher) for MD5 computation
 * 2. Use `DateTime.unsafeNow()` or `DateTime.now` for timestamps
 * 3. Handle hash computation failures gracefully with ParseResult errors
 * 4. Consider file size limits for hash computation performance
 *
 * ## Dependencies
 * - `@beep/utils/md5` - ParallelHasher service for streaming MD5 computation
 * - `@beep/identity/packages` - Schema ID generation
 * - `effect/DateTime` - Immutable timestamp handling
 * - `effect/Schema` - Effect Schema definitions
 *
 * ## Usage Example
 * The following shows how to attach signatures to file metadata:
 *
 * // Attach signature to NormalizedFile
 * const SignedNormalizedFile = F.pipe(NormalizedFile, withFileSignature);
 *
 * // Decode with signature generation
 * const signed = yield* S.decode(SignedNormalizedFile)(file);
 * // signed.signature.contentHash contains MD5 hex digest
 *
 * // Verify signature in upload completion
 * if (signed.signature.contentHash !== expectedHash) {
 *   return yield* Effect.fail(new FileIntegrityError({
 *     message: "Content hash mismatch",
 *     expected: expectedHash,
 *     actual: signed.signature.contentHash,
 *   }));
 * }
 *
 * @see {@link NormalizedFile} for the base file schema
 * @see {@link https://en.wikipedia.org/wiki/MD5} for MD5 hash format
 */

import { $SchemaId } from "@beep/identity/packages";
import { hashBlob } from "@beep/utils/md5";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";

const $I = $SchemaId.create("integrations/files/SignedFile");

// ============================================================================
// Constants
// ============================================================================

/**
 * MD5 hash pattern for validation.
 *
 * @since 1.0.0
 * @category Constants
 *
 * @remarks
 * Matches exactly 32 lowercase hexadecimal characters, which is the
 * standard format for MD5 hash digests.
 */
export const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/;

// ============================================================================
// Schemas
// ============================================================================

/**
 * Schema for MD5 content hash strings.
 *
 * @since 1.0.0
 * @category Schemas
 *
 * @remarks
 * Validates that a string is a valid MD5 hash: exactly 32 lowercase
 * hexadecimal characters. This is used for file content integrity
 * verification during upload workflows.
 *
 * @example
 * const hash = "d41d8cd98f00b204e9800998ecf8427e"; // MD5 of empty string
 * const validated = yield* S.decode(Md5ContentHash)(hash);
 */
export const Md5ContentHash = S.String.pipe(
  S.pattern(MD5_HASH_PATTERN),
  S.annotations({
    identifier: "Md5ContentHash",
    description: "MD5 hex digest of file contents (32 lowercase hex characters)",
    examples: ["d41d8cd98f00b204e9800998ecf8427e", "098f6bcd4621d373cade4e832627b4f6"],
  })
);
export type Md5ContentHash = typeof Md5ContentHash.Type;

/**
 * Upload file signature containing content hash for integrity verification.
 *
 * @since 1.0.0
 * @category Schemas
 *
 * @remarks
 * Encapsulates the cryptographic signature metadata for a file upload:
 * - `contentHash`: MD5 hex digest computed from file contents
 * - `signedAt`: UTC timestamp when the hash was computed
 * - `uploadToken`: Optional reference to an upload session
 *
 * This class is used as a schema for the `signature` field attached
 * to file metadata by the `withFileSignature` factory.
 *
 * Note: This is named `UploadFileSignature` to distinguish from the
 * `FileSignature` class in file-types which represents magic byte signatures.
 *
 * ## Implementation Guidance for Implementer
 * When constructing instances:
 * 1. Use ParallelHasher.hashBlob() to compute MD5 from File/Blob
 * 2. Use DateTime.unsafeNow() for synchronous timestamp
 * 3. Use O.none() for uploadToken unless linking to a session
 *
 * @example
 * const signature = UploadFileSignature.make({
 *   contentHash: "d41d8cd98f00b204e9800998ecf8427e",
 *   signedAt: DateTime.unsafeNow(),
 *   uploadToken: O.none(),
 * });
 *
 * @see withFileSignature for automatic signature attachment
 */
export class UploadFileSignature extends S.Class<UploadFileSignature>($I`UploadFileSignature`)({
  /**
   * MD5 hex digest of file contents.
   *
   * @remarks
   * Computed using streaming hash to handle large files efficiently.
   * Used for S3 content verification (Content-MD5 header).
   */
  contentHash: Md5ContentHash,

  /**
   * UTC timestamp when the signature was created.
   *
   * @remarks
   * Used for expiration checks and audit trails.
   * Should use DateTime.unsafeNow() or DateTime.now.
   */
  signedAt: S.DateTimeUtc,

  /**
   * Optional reference to an upload session.
   *
   * @remarks
   * When present, links this signature to a specific upload session
   * in the database for verification and cleanup.
   */
  uploadToken: S.OptionFromSelf(S.String),
}) {}

export declare namespace UploadFileSignature {
  export type Type = typeof UploadFileSignature.Type;
  export type Encoded = typeof UploadFileSignature.Encoded;
}

// ============================================================================
// Errors
// ============================================================================

/**
 * Error thrown when file content integrity verification fails.
 *
 * @since 1.0.0
 * @category Errors
 *
 * @remarks
 * This error indicates that the computed content hash does not match
 * the expected hash. This can occur due to:
 * - File corruption during upload
 * - Man-in-the-middle attacks
 * - Client-side file modification after hash computation
 * - Network transmission errors
 *
 * ## Security Considerations
 * It is safe to expose both expected and actual hashes in error messages
 * since MD5 is a one-way hash function and the values do not reveal
 * sensitive information about file contents.
 *
 * @example
 * if (actualHash !== expectedHash) {
 *   return yield* Effect.fail(new FileIntegrityError({
 *     message: "File content was modified during upload",
 *     expected: expectedHash,
 *     actual: actualHash,
 *   }));
 * }
 */
export class FileIntegrityError extends S.TaggedError<FileIntegrityError>()("FileIntegrityError", {
  /**
   * Human-readable description of the integrity failure.
   */
  message: S.String,

  /**
   * The expected MD5 hash (from the original signature).
   */
  expected: Md5ContentHash,

  /**
   * The actual MD5 hash computed from the received content.
   */
  actual: Md5ContentHash,
}) {}

export declare namespace FileIntegrityError {
  export type Type = typeof FileIntegrityError.Type;
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Generic factory to attach file signatures to any schema with a `file` field.
 *
 * @since 1.0.0
 * @category Factories
 *
 * @remarks
 * This factory function uses schema composition to add a `signature` field
 * containing a `FileSignature` to any schema that has a `file: File` property.
 * The signature is computed during decode (input validation) using MD5 hashing.
 *
 * ## How It Works
 * 1. Takes an existing schema with `file: File` field
 * 2. Returns a new schema with additional `signature: FileSignature` field
 * 3. During decode, computes MD5 hash of file contents
 * 4. During encode, passes through without recomputation
 *
 * ## Implementation Guidance for Implementer
 * The stub currently throws `Effect.die`. The implementer should:
 *
 * 1. In the decode transformation:
 *    - Get ParallelHasher from context (or use hashBlob utility)
 *    - Compute MD5: `yield* hasher.hashBlob(data.file)`
 *    - Create FileSignature with hash and timestamp
 *    - Return original data with signature attached
 *
 * 2. Handle errors:
 *    - Map hash computation errors to ParseResult.Type
 *    - Include meaningful error messages
 *
 * ## Performance Considerations
 * - MD5 computation is streaming and memory-efficient
 * - Large files (>10MB) may take 100ms+ to hash
 * - Consider file size limits for synchronous workflows
 *
 * @example
 * import { NormalizedFile } from "./File";
 *
 * // Create signed version of NormalizedFile
 * const SignedNormalizedFile = F.pipe(NormalizedFile, withFileSignature);
 *
 * // Use in Effect pipeline
 * const signed = yield* S.decode(SignedNormalizedFile)(rawFile);
 * console.log(signed.signature.contentHash); // "d41d8cd98f00b204e9800998ecf8427e"
 *
 * @typeParam A - The type with a `file: File` field
 * @typeParam I - The input/encoded type
 * @typeParam R - Requirements (context dependencies)
 *
 * @param schema - Source schema containing a `file: File` property
 * @returns New schema with `signature: UploadFileSignature` added
 *
 * @throws {ParseResult.Type} When MD5 computation fails
 *
 * @see UploadFileSignature for the signature structure
 * @see NormalizedFile for the typical use case
 */
export const withFileSignature = <A extends { file: File }, I, R>(
  schema: S.Schema<A, I, R>
): S.Schema<A & { signature: UploadFileSignature }, I, R> => {
  // Create the output schema type
  const OutputSchema = S.extend(
    schema,
    S.Struct({
      signature: UploadFileSignature,
    })
  );

  return S.transformOrFail(schema, OutputSchema, {
    strict: false,

    /**
     * decode: input -> output with signature
     *
     * Computes MD5 hash of file contents and attaches signature.
     */
    decode: (data, _, ast) =>
      Effect.gen(function* () {
        // Compute MD5 hash of file contents using the hashBlob utility
        const contentHash = yield* hashBlob(data.file);

        // Create the signature with hash and timestamp
        const signature = UploadFileSignature.make({
          contentHash: contentHash as Md5ContentHash,
          signedAt: DateTime.unsafeNow(),
          uploadToken: O.none(),
        });

        // Return original data with signature attached
        return { ...data, signature };
      }).pipe(
        Effect.mapError(
          (e) =>
            new ParseResult.Type(
              ast,
              data,
              e instanceof Error ? `Hash failed: ${e.message}` : "Hash computation failed"
            )
        )
      ),

    /**
     * encode: output with signature -> input
     *
     * Strips signature and returns original data.
     */
    encode: (data, _, _ast) =>
      // Signature is stripped during encode - use Struct.omit to remove the signature field
      // and return the base data. The omit function creates a new object without the
      // specified key, preserving the original type structure.
      Effect.succeed(Struct.omit(data, "signature")),
  });
};

// ============================================================================
// Pre-built Signed Schemas
// ============================================================================

// Note: SignedNormalizedFile is intentionally NOT exported here to avoid
// circular dependency with File.ts. Instead, consumers should create
// their own signed versions using:
//
//   import { NormalizedFile } from "./File";
//   import { withFileSignature } from "./SignedFile";
//   import * as F from "effect/Function";
//
//   const SignedNormalizedFile = F.pipe(NormalizedFile, withFileSignature);
//
// This pattern keeps the dependency graph clean and allows for more
// flexibility in how signatures are computed and attached.

/**
 * Type helper for creating signed file types.
 *
 * @since 1.0.0
 * @category Types
 *
 * @remarks
 * Use this type to add signature typing to existing file types
 * without constructing the full schema.
 *
 * @example
 * type SignedUpload = WithFileSignature<NormalizedFile.Type>;
 * // Equivalent to: NormalizedFile.Type & { signature: UploadFileSignature }
 */
export type WithFileSignature<T extends { file: File }> = T & {
  readonly signature: UploadFileSignature;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Verifies that a content hash matches the expected value.
 *
 * @since 1.0.0
 * @category Utilities
 *
 * @remarks
 * Utility function for comparing content hashes during upload verification.
 * Returns an Effect that succeeds with void if hashes match, or fails
 * with `FileIntegrityError` if they differ.
 *
 * ## Implementation Guidance for Implementer
 * The stub currently throws `Effect.die`. The implementer should:
 * 1. Compare strings using constant-time comparison if security-critical
 * 2. For MD5 hashes, simple string comparison is acceptable
 * 3. Return `Effect.void` if equal
 * 4. Return `Effect.fail(new FileIntegrityError(...))` if different
 *
 * @example
 * // In upload completion handler
 * yield* verifyContentHash({
 *   expected: session.metadata.contentHash,
 *   actual: computedHash,
 * });
 * // Continues if hashes match, fails otherwise
 *
 * @param params - Object with expected and actual hash values
 * @returns Effect that succeeds if hashes match, fails with FileIntegrityError otherwise
 *
 * @throws {FileIntegrityError} When hashes do not match
 */
export const verifyContentHash = (params: {
  readonly expected: Md5ContentHash;
  readonly actual: Md5ContentHash;
}): Effect.Effect<void, FileIntegrityError> => {
  const { expected, actual } = params;

  // Simple string comparison is acceptable for MD5 hashes
  // (constant-time comparison not required for hash values, only for secrets)
  if (expected === actual) {
    return Effect.void;
  }

  return Effect.fail(
    new FileIntegrityError({
      message: "Content hash mismatch",
      expected,
      actual,
    })
  );
};

/**
 * Creates an UploadFileSignature from a pre-computed hash.
 *
 * @since 1.0.0
 * @category Utilities
 *
 * @remarks
 * Use this when you already have the MD5 hash computed (e.g., from
 * a previous validation step or external source).
 *
 * @example
 * const signature = createUploadFileSignature("d41d8cd98f00b204e9800998ecf8427e");
 *
 * @param contentHash - Pre-computed MD5 hash string
 * @param uploadToken - Optional upload session token
 * @returns A new UploadFileSignature instance
 */
export const createUploadFileSignature = (
  contentHash: Md5ContentHash,
  uploadToken?: string | undefined
): UploadFileSignature =>
  UploadFileSignature.make({
    contentHash,
    signedAt: DateTime.unsafeNow(),
    uploadToken: F.pipe(uploadToken, O.fromNullable),
  });
