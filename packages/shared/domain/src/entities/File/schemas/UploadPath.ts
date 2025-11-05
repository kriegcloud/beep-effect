/**
 * @fileoverview Upload Path Schema and Transformations
 *
 * This module provides a comprehensive solution for handling file upload paths in S3.
 * It implements bidirectional transformations between structured data and S3 path strings,
 * with automatic sharding, timestamp generation, and validation.
 *
 * Path Structure:
 * /{env}/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}
 *
 * Example:
 * /dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg
 *
 * Features:
 * - Automatic shard prefix generation from FileId for load distribution
 * - Current timestamp injection (year/month) during encoding
 * - Bidirectional parsing and validation
 * - Type-safe transformations using Effect Schema
 */

import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Hash from "effect/Hash";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import { AnyEntityId, EntityKind, SharedEntityIds } from "../../../entity-ids";
import * as Organization from "../../Organization";

/**
 * Encoded shard prefix as a plain string.
 *
 * This represents the shard prefix in its raw string form as it appears in S3 paths.
 * The prefix is a 2-character hexadecimal string used for distributing files across
 * S3 prefixes to avoid hotspotting and improve performance.
 *
 * @example "a1", "f3", "00", "ff"
 */
export class ShardPrefixEncoded extends S.String.annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/ShardPrefixEncoded"),
  identifier: "ShardPrefixEncoded",
  title: "Shard Prefix Encoded",
  description:
    "Raw string representation of a two-character hexadecimal shard prefix for S3 load distribution. Used to distribute files across S3 prefixes to prevent hotspotting.",
  examples: ["a1", "f3", "00", "ff", "2b"],
}) {}

export declare namespace ShardPrefixEncoded {
  export type Type = S.Schema.Type<typeof ShardPrefixEncoded>;
  export type Encoded = S.Schema.Encoded<typeof ShardPrefixEncoded>;
}

/**
 * Validated and branded shard prefix.
 *
 * This is the decoded/validated form of a shard prefix that ensures:
 * - Exactly 2 characters in length
 * - Only contains hexadecimal characters (0-9, a-f, case insensitive)
 * - Is properly trimmed and non-empty
 *
 * The branded type prevents accidental mixing with regular strings
 * and provides compile-time safety.
 *
 * @example ShardPrefixDecoded branded strings: "a1", "F3", "00", "ff"
 */
export class ShardPrefixDecoded extends S.NonEmptyTrimmedString.pipe(
  S.pattern(BS.Regex.make(/^[0-9a-f]{2}$/i)),
  S.brand("ShardPrefixDecoded")
).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/ShardPrefixDecoded"),
  identifier: "ShardPrefixDecoded",
  title: "Shard Prefix Decoded",
  description:
    "Validated two-character hexadecimal shard prefix with branded type safety. Ensures proper format (exactly 2 hex characters) for consistent S3 load distribution.",
  examples: [
    BS.makeBranded("a1"),
    BS.makeBranded("F3"),
    BS.makeBranded("00"),
    BS.makeBranded("ff"),
    BS.makeBranded("2B"),
  ],
}) {}

export declare namespace ShardPrefixDecoded {
  export type Type = S.Schema.Type<typeof ShardPrefixDecoded>;
  export type Encoded = S.Schema.Encoded<typeof ShardPrefixDecoded>;
}

/**
 * Bidirectional transformation between encoded and decoded shard prefixes.
 *
 * This schema provides:
 * - Validation of shard prefix format during decoding
 * - Type-safe conversion between string and branded types
 * - Deterministic shard generation from FileId for consistent routing
 *
 * The shard prefix is used to distribute files across S3 prefixes, preventing
 * hotspotting by ensuring files are evenly distributed across the storage system.
 *
 * @example
 * ```typescript
 * // Generate shard from FileId
 * const shard = ShardPrefix.fromFileId("file__123-456-789");
 *
 * // Decode string to validated shard
 * const decoded = S.decode(ShardPrefix)("a1");
 *
 * // Encode back to string
 * const encoded = S.encode(ShardPrefix)(decoded);
 * ```
 */
export class ShardPrefix extends S.transformOrFail(ShardPrefixEncoded, ShardPrefixDecoded, {
  strict: true,
  decode: (encoded, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(ShardPrefixDecoded)(encoded),
      catch: () =>
        new ParseResult.Type(ast, encoded, "Invalid shard prefix format: must be exactly 2 hexadecimal characters"),
    }),
  encode: (decoded, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(ShardPrefixEncoded)(decoded),
      catch: () => new ParseResult.Type(ast, decoded, "Failed to encode shard prefix to string representation"),
    }),
}).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/ShardPrefix"),
  identifier: "ShardPrefix",
  title: "Shard Prefix Transformation",
  description:
    "Bidirectional transformation for shard prefixes with validation. Converts between raw strings and validated branded types while ensuring proper hexadecimal format for S3 load distribution.",
}) {
  /**
   * Generate a deterministic shard prefix from a FileId.
   *
   * Uses Effect's Hash function to create a consistent 2-character hex prefix
   * from the FileId. The same FileId will always produce the same shard prefix,
   * ensuring files are consistently routed to the same S3 prefix.
   *
   * @param fileId - The FileId to generate a shard prefix from
   * @returns A validated ShardPrefix that can be used in S3 paths
   *
   * @example
   * ```typescript
   * const fileId = "file__12345678-1234-1234-1234-123456789012" as FileId.Type;
   * const shard = ShardPrefix.fromFileId(fileId); // Returns something like "a1"
   * ```
   */
  static readonly fromFileId = (fileId: SharedEntityIds.FileId.Type) => {
    const hashValue = Hash.string(fileId);
    const hexString = Math.abs(hashValue).toString(16).slice(0, 2).padStart(2, "0");
    return S.decodeSync(ShardPrefix)(hexString);
  };
}

export declare namespace ShardPrefix {
  export type Type = S.Schema.Type<typeof ShardPrefix>;
  export type Encoded = S.Schema.Encoded<typeof ShardPrefix>;
}

/**
 * Template literal parts defining the structure of an upload path.
 *
 * This array defines the exact structure of S3 upload paths used throughout the system.
 * Each element represents either a literal string (like "/" or "tenants") or a schema
 * that validates and parses dynamic parts of the path.
 *
 * Path Structure Breakdown:
 * - /{env} - Environment (dev, staging, prod)
 * - /tenants - Literal "tenants" segment
 * - /{shard} - 2-char hex shard prefix for load distribution
 * - /{orgType} - Organization type (individual, team, enterprise)
 * - /{orgId} - Organization ID (UUID format)
 * - /{entityKind} - Entity type (organization, user, team)
 * - /{entityId} - Entity identifier (string)
 * - /{attribute} - File attribute name (avatar, logo, document, etc.)
 * - /{year} - 4-digit year (auto-generated)
 * - /{month} - 2-digit zero-padded month (auto-generated)
 * - /{fileId} - File ID (UUID format)
 * - .{ext} - File extension (jpg, png, pdf, etc.)
 *
 * @example
 * "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg"
 */
const UploadPathParts = [
  "/",
  EnvValue, // Environment: dev, staging, prod
  "/",
  "tenants", // Literal segment for all file paths
  "/",
  ShardPrefixEncoded, // 2-character hex shard for load distribution
  "/",
  Organization.OrganizationType, // individual, team, enterprise
  "/",
  S.encodedSchema(SharedEntityIds.OrganizationId), // Organization UUID
  "/",
  S.String, // Entity kind
  "/",
  S.String, // Entity identifier (user ID, team slug, etc.)
  "/",
  S.String, // Entity attribute (avatar, logo, document, etc.)
  "/",
  BS.YearEncoded, // 4-digit year (auto-generated from current time)
  "/",
  BS.MonthNumber, // 2-digit zero-padded month (auto-generated)
  "/",
  S.encodedSchema(SharedEntityIds.FileId), // File UUID
  ".",
  S.String, // File extension
] as const;

/**
 * Encoded upload path as a template literal string.
 *
 * This represents the final S3 path as a string that matches the exact
 * pattern defined by UploadPathParts. It's the format that would be used
 * as an actual S3 object key.
 *
 * The path includes all necessary components for:
 * - Environment isolation (dev/staging/prod)
 * - Load distribution (shard prefix)
 * - Organizational hierarchy
 * - Temporal organization (year/month)
 * - Unique file identification
 *
 * @example
 * "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg"
 */
export class UploadPathEncoded extends S.TemplateLiteral(...UploadPathParts).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/UploadPathEncoded"),
  identifier: "UploadPathEncoded",
  title: "Upload Path Encoded",
  description:
    "Complete S3 object key as a string following the standardized upload path format: /{env}/tenants/{shard}/{orgType}/{orgId}/{entityKind}/{entityId}/{attribute}/{year}/{month}/{fileId}.{ext}",
}) {}

export declare namespace UploadPathEncoded {
  export type Type = S.Schema.Type<typeof UploadPathEncoded>;
  export type Encoded = S.Schema.Encoded<typeof UploadPathEncoded>;
}

/**
 * Template literal parser for upload paths.
 *
 * This parser can both construct and deconstruct upload path strings,
 * converting between the string representation and an array of typed components.
 * It's used internally by the UploadPath transformation to handle the
 * bidirectional conversion between structured data and path strings.
 *
 * The parser validates each component according to its schema and provides
 * type-safe access to individual path segments.
 *
 * @example
 * ```typescript
 * // Parse a path string into components
 * const components = S.decode(UploadPathParser)(
 *   "/dev/tenants/a1/individual/org_123/user/user_456/avatar/2024/03/file_789.jpg"
 * );
 *
 * // Construct a path from components
 * const pathString = S.encode(UploadPathParser)([
 *   "/", "dev", "/", "tenants", "/", "a1", "/", "individual",
 *   "/", "org_123", "/", "user", "/", "user_456", "/", "avatar",
 *   "/", "2024", "/", "03", "/", "file_789", ".", "jpg"
 * ]);
 * ```
 */
export const UploadPathParser = S.TemplateLiteralParser(...UploadPathParts).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/UploadPathParser"),
  identifier: "UploadPathParser",
  title: "Upload Path Parser",
  description:
    "Bidirectional parser for upload path strings. Converts between string paths and typed component arrays, validating each segment according to its schema definition.",
});

export declare namespace UploadPathParser {
  export type Type = S.Schema.Type<typeof UploadPathParser>;
  export type Encoded = S.Schema.Encoded<typeof UploadPathParser>;
}

/**
 * Structured representation of upload path data.
 *
 * This is the decoded form containing all the components needed to generate
 * an upload path. When decoded, the system automatically injects:
 * - Current timestamp (year/month)
 * - Shard prefix (derived from fileId)
 *
 * This structure contains only the essential data that the caller provides,
 * while the system generates the derived values during encoding.
 *
 * @example
 * ```typescript
 * const uploadData: UploadPathDecoded.Type = {
 *   env: "dev",
 *   fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
 *   organizationType: "individual",
 *   organizationId: SharedEntityIds.OrganizationId.make("organization__87654321-4321-4321-4321-210987654321"),
 *   entityKind: "user",
 *   entityIdentifier: SharedEntityIds.UserId.make("user__87654321-4321-4321-4321-210987654321"),
 *   entityAttribute: "avatar",
 *   fileItemExtension: "jpg"
 * };
 * ```
 */
export const UploadPathDecoded = BS.Struct({
  env: EnvValue, // Environment: dev, staging, prod
  fileId: SharedEntityIds.FileId, // Unique file identifier
  organizationType: Organization.OrganizationType, // Organization classification
  organizationId: SharedEntityIds.OrganizationId, // Organization UUID
  entityKind: EntityKind, // Type of entity owning the file
  entityIdentifier: AnyEntityId, // Identifier for the specific entity instance
  entityAttribute: S.String, // File attribute/purpose (avatar, logo, document, etc.)
  fileItemExtension: BS.FileExtension, // File extension (validated against allowed types)
}).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/UploadPathDecoded"),
  identifier: "UploadPathDecoded",
  title: "Upload Path Decoded Structure",
  description:
    "Structured data representation for upload paths. Contains all user-provided components needed to generate S3 paths. System automatically injects timestamp and shard prefix during encoding.",
  examples: [
    {
      env: "dev",
      fileId: SharedEntityIds.FileId.make("file__12345678-1234-1234-1234-123456789012"),
      organizationType: "individual",
      organizationId: SharedEntityIds.OrganizationId.make("organization__87654321-4321-4321-4321-210987654321"),
      entityKind: "user",
      entityIdentifier: SharedEntityIds.UserId.make("user__12345678-1234-1234-1234-123456789012"),
      entityAttribute: "avatar",
      fileItemExtension: "jpg",
    },
  ],
});

export declare namespace UploadPathDecoded {
  export type Type = S.Schema.Type<typeof UploadPathDecoded>;
  export type Encoded = S.Schema.Encoded<typeof UploadPathDecoded>;
}

/**
 * Bidirectional transformation between structured upload data and S3 path strings.
 *
 * This is the main schema for handling file upload paths. It provides:
 *
 * **Encoding (Decode operation)**: UploadPathDecoded -> UploadPathEncoded
 * - Takes structured upload data
 * - Automatically injects current timestamp (year/month)
 * - Generates shard prefix from fileId
 * - Validates all components
 * - Produces complete S3 path string
 *
 * **Decoding (Encode operation)**: UploadPathEncoded -> UploadPathDecoded
 * - Parses S3 path string into components
 * - Validates path structure and format
 * - Extracts all user-provided data
 * - Returns structured representation
 *
 * **Key Features**:
 * - Automatic timestamp injection for time-based organization
 * - Deterministic shard generation for load distribution
 * - Comprehensive validation of all path components
 * - Type-safe bidirectional transformations
 * - Effect-based error handling
 *
 * @example
 * ```typescript
 * // Encode: structured data -> S3 path
 * const uploadData = {
 *   env: "dev",
 *   fileId: "file__123...",
 *   organizationType: "individual",
 *   organizationId: "org__456...",
 *   entityKind: "user",
 *   entityIdentifier: "user_789",
 *   entityAttribute: "avatar",
 *   fileItemExtension: "jpg"
 * };
 *
 * const s3Path = yield* S.decode(UploadPath)(uploadData);
 * // Result: "/dev/tenants/a1/individual/org__456.../user/user_789/avatar/2024/03/file__123....jpg"
 *
 * // Decode: S3 path -> structured data
 * const parsedData = yield* S.encode(UploadPath)(s3Path);
 * // Result: Original uploadData structure
 * ```
 */
export class UploadPath extends S.transformOrFail(UploadPathDecoded, UploadPathEncoded, {
  strict: true,
  decode: (i, _, ast) => {
    const program = DateTime.now.pipe(
      Effect.flatMap((now) =>
        Effect.flatMap(
          Effect.all([
            Effect.succeed(now),
            Effect.succeed(ShardPrefix.fromFileId(i.fileId)),
            S.encode(BS.FileExtension)(i.fileItemExtension),
            S.decode(BS.MonthNumberFromMonthInt)(DateTime.getPartUtc(now, "month")),
          ]),
          ([now, shardPrefix, fileItemExtension, month]) =>
            Effect.flatMap(
              S.encode(UploadPathParser)([
                "/",
                i.env,
                "/",
                "tenants",
                "/",
                shardPrefix,
                "/",
                i.organizationType,
                "/",
                i.organizationId,
                "/",
                i.entityKind,
                "/",
                i.entityIdentifier,
                "/",
                i.entityAttribute,
                "/",
                DateTime.getPartUtc(now, "year"),
                "/",
                month,
                "/",
                i.fileId,
                ".",
                fileItemExtension,
              ]),
              (path) => S.decode(UploadPathEncoded)(path)
            )
        )
      )
    );

    return Effect.try({
      try: () => Effect.runSync(program),
      catch: (e) => new ParseResult.Type(ast, i, `Invalid upload path: ${e}`),
    });
  },
  encode: (i, _, ast) => {
    const program = Effect.flatMap(S.decode(UploadPathParser)(i), (pathParts) =>
      Effect.flatMap(
        Effect.all([
          Effect.succeed(pathParts[1]), // env
          Effect.succeed(pathParts[7]), // organizationType
          S.decodeUnknown(SharedEntityIds.OrganizationId)(pathParts[9]), // organizationId
          S.decodeUnknown(EntityKind)(pathParts[11]), // entityKind
          S.decodeUnknown(AnyEntityId)(pathParts[13]), //entityIdentifier
          Effect.succeed(pathParts[15]), // entityAttribute
          S.decodeUnknown(SharedEntityIds.FileId)(pathParts[21]), //fileId
          S.decodeUnknown(BS.FileExtension)(pathParts[23]), // FileItemExtension
        ]),
        ([
          env,
          organizationType,
          organizationId,
          entityKind,
          entityIdentifier,
          entityAttribute,
          fileId,
          fileItemExtension,
        ]) =>
          S.decode(UploadPathDecoded)({
            env,
            fileId,
            organizationType,
            organizationId,
            entityKind,
            entityIdentifier,
            entityAttribute,
            fileItemExtension,
          })
      )
    );

    return Effect.try({
      try: () => Effect.runSync(program),
      catch: (e) => new ParseResult.Type(ast, i, `Failed to parse upload path: ${e}`),
    });
  },
}).annotations({
  schemaId: Symbol.for("@beep/shared-domain/File/schemas/FilePath/UploadPath"),
  identifier: "UploadPath",
  title: "Upload Path Transformation",
  description:
    "Complete bidirectional transformation system for S3 upload paths. Handles conversion between structured upload data and S3 object keys with automatic timestamp injection, shard generation, and comprehensive validation. Ensures consistent path format across all file operations.",
  documentation: [
    "Automatic shard prefix generation using fileId hash for load distribution",
    "Current timestamp injection (year/month) for temporal organization",
    "Comprehensive validation of all path components and format",
    "Type-safe transformations with Effect-based error handling",
    `Supports all entity types: organization, user, team`,
    "Compatible with all environments: dev, staging, prod",
  ].join("\n- "),
}) {}

export declare namespace UploadPath {
  export type Type = S.Schema.Type<typeof UploadPath>;
  export type Encoded = S.Schema.Encoded<typeof UploadPath>;
}
