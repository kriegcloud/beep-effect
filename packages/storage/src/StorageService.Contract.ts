// import { serverEnv } from "@beep/env/server";
// import { SharedEntityIds } from "@beep/shared-domain/EntityIds";

import { EnvValue } from "@beep/env/common";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain/EntityIds";
import type * as B from "effect/Brand";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";

export const StoragePlatformKit = BS.stringLiteralKit("s3", "gcs");

export class StoragePlatform extends StoragePlatformKit.Schema.annotations({
  schemaId: Symbol.for("@beep/storage/contract/StoragePlatform"),
  identifier: "StoragePlatform",
  title: "Storage Platform",
  description: "Storage platform for storage service",
}) {
  static readonly Options = StoragePlatformKit.Options;
  static readonly Enum = StoragePlatformKit.Enum;
}

export namespace StoragePlatform {
  export type Type = S.Schema.Type<typeof StoragePlatform>;
  export type Encoded = S.Schema.Type<typeof StoragePlatform>;
}

export class FolderPrefix extends S.TemplateLiteral("/", S.String).annotations({
  schemaId: Symbol.for("@beep/storage/contract/FolderPrefix"),
  identifier: "FolderPrefix",
  title: "Folder Prefix",
  description: "Folder prefix for storage service",
  jsonSchema: { type: "string", format: "date-time" },
  pretty: () => (i) => `FolderPrefix(${i})`,
}) {}

export namespace FolderPrefix {
  export type Type = S.Schema.Type<typeof FolderPrefix>;
  export type Encoded = S.Schema.Type<typeof FolderPrefix>;
}

export const EntityKindKit = BS.stringLiteralKit("organization", "user", "teams");

export class EntityKind extends EntityKindKit.Schema {
  static readonly Options = EntityKindKit.Options;
  static readonly Enum = EntityKindKit.Enum;
}

export namespace EntityKind {
  export type Type = S.Schema.Type<typeof EntityKind>;
  export type Encoded = S.Schema.Type<typeof EntityKind>;
}

export class BucketName extends S.String.annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketName"),
  identifier: "BucketName",
  title: "Bucket Name",
  description: "Bucket name for storage service",
  jsonSchema: { type: "string", format: "domain-name" },
}) {}

export namespace BucketName {
  export type Type = S.Schema.Type<typeof BucketName>;
  export type Encoded = S.Schema.Type<typeof BucketName>;
}

export class BucketUrl extends S.TemplateLiteral("https://", BucketName).annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketUrl"),
  identifier: "BucketUrl",
  title: "Bucket URL",
  description: "Bucket URL for storage service",
}) {}

export namespace BucketUrl {
  export type Type = S.Schema.Type<typeof BucketUrl>;
  export type Encoded = S.Schema.Type<typeof BucketUrl>;
}

export class EntityIdentifierEncoded extends BS.UUIDLiteralEncoded.annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityIdentifierEncoded"),
  identifier: "EntityIdentifierEncoded",
  title: "Entity Identifier Encoded",
  description: "Entity identifier encoded for storage service",
  jsonSchema: { type: "string", format: "uuid" },
}) {}

export namespace EntityIdentifierEncoded {
  export type Type = S.Schema.Type<typeof EntityIdentifierEncoded>;
  export type Encoded = S.Schema.Type<typeof EntityIdentifierEncoded>;
}

export class EntityIdentifier extends BS.UUIDLiteral.pipe(S.brand("EntityIdentifier")).annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityIdentifier"),
  identifier: "EntityIdentifier",
  title: "Entity Identifier",
  description: "Entity identifier for storage service",
  jsonSchema: { type: "string", format: "uuid" },
}) {}

export class EntityAttributeEncoded extends S.String.annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityAttributeEncoded"),
  identifier: "EntityAttributeEncoded",
  title: "Entity Attribute Encoded",
  description: "Entity attribute encoded for storage service",
}) {}

export namespace EntityAttributeEncoded {
  export type Type = S.Schema.Type<typeof EntityAttributeEncoded>;
  export type Encoded = S.Schema.Type<typeof EntityAttributeEncoded>;
}

export class EntityAttribute extends S.transformOrFail(
  EntityAttributeEncoded,
  S.NonEmptyTrimmedString.pipe(S.brand("EntityAttribute")),
  {
    strict: true,
    decode: (i, _, ast) =>
      ParseResult.try({
        try: () => S.decodeUnknownSync(S.NonEmptyTrimmedString.pipe(S.brand("EntityAttribute")))(i),
        catch: () => new ParseResult.Type(ast, i, "EntityAttribute must be a non-empty trimmed string"),
      }),
    encode: (i) => ParseResult.succeed(i),
  }
).annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityAttribute"),
  identifier: "EntityAttribute",
  title: "Entity Attribute",
  description: "Entity attribute for storage service",
}) {}

export namespace EntityAttribute {
  export type Type = S.Schema.Type<typeof EntityAttribute>;
  export type Encoded = S.Schema.Type<typeof EntityAttributeEncoded>;
}

export class FileId extends S.String.annotations({
  schemaId: Symbol.for("@beep/storage/contract/FileId"),
  identifier: "FileId",
  title: "File Id",
  description: "File id for storage service",
  jsonSchema: { type: "string", format: "uuid" },
  arbitrary: () => (fc) => fc.uuid().map((_) => _ as B.Branded<string, "FileId">),
}) {}

export class FileItemExt extends BS.Ext {}

export class OrgPath extends S.TemplateLiteral("/", "organizations").annotations({
  schemaId: Symbol.for("@beep/storage/contract/OrgPath"),
  identifier: "OrgPath",
  title: "Organization Path",
  description: "Organization path for storage service",
}) {}

export const OrgTypeKit = BS.stringLiteralKit("user", "organization");

export class OrgType extends OrgTypeKit.Schema {
  static readonly Options = OrgTypeKit.Options;
  static readonly Enum = OrgTypeKit.Enum;
}

export namespace OrgType {
  export type Type = S.Schema.Type<typeof OrgType>;
  export type Encoded = S.Schema.Type<typeof OrgType>;
}

export namespace OrgPath {
  export type Type = S.Schema.Type<typeof OrgPath>;
  export type Encoded = S.Schema.Type<typeof OrgPath>;
}

export class YearEncoded extends S.Number.annotations({
  schemaId: Symbol.for("@beep/storage/contract/YearEncoded"),
  identifier: "YearEncoded",
  title: "Year Encoded",
  description: "Year encoded for storage service",
  jsonSchema: { type: "number", format: "year" },
  examples: [2025, 2024, 2026],
}) {}

export namespace YearEncoded {
  export type Type = S.Schema.Type<typeof YearEncoded>;
  export type Encoded = S.Schema.Type<typeof YearEncoded>;
}

export class YearDecoded extends S.Int.pipe(S.greaterThanOrEqualTo(2025), S.brand("Year")).annotations({
  schemaId: Symbol.for("@beep/storage/contract/YearDecoded"),
  identifier: "YearDecoded",
  title: "Year Decoded",
  description: "Year decoded for storage service",
  jsonSchema: { type: "number", format: "year" },
}) {}

export class Year extends S.transformOrFail(YearEncoded, YearDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(S.Int.pipe(S.greaterThanOrEqualTo(2025), S.brand("Year")))(i),
      catch: () => new ParseResult.Type(ast, i, "Year must be a number greater than or equal to 2025"),
    }),
  encode: (i) => ParseResult.succeed(i),
}).annotations({
  schemaId: Symbol.for("@beep/storage/contract/Year"),
  identifier: "Year",
  title: "Year",
  description: "Year for storage service",
  jsonSchema: { type: "number", format: "year" },
}) {}

export namespace Year {
  export type Type = S.Schema.Type<typeof Year>;
  export type Encoded = S.Schema.Type<typeof YearEncoded>;
}

export class OrgIdentifierEncoded extends S.String.annotations({
  schemaId: Symbol.for("@beep/storage/contract/OrgIdentifierEncoded"),
  identifier: "OrgIdentifierEncoded",
  title: "Organization Identifier Encoded",
  description: "Organization identifier encoded for storage service",
  jsonSchema: { type: "string", format: "uuid" },
}) {}

export namespace OrgIdentifierEncoded {
  export type Type = S.Schema.Type<typeof OrgIdentifierEncoded>;
  export type Encoded = S.Schema.Type<typeof OrgIdentifierEncoded>;
}

export class OrgIdentifierDecoded extends S.Union(SharedEntityIds.OrganizationId, IamEntityIds.UserId).annotations({
  schemaId: Symbol.for("@beep/storage/contract/OrgIdentifierDecoded"),
  identifier: "OrgIdentifierDecoded",
  title: "Organization Identifier Decoded",
  description: "Organization identifier decoded for storage service",
}) {}

// `/<prod|dev|stage>/organizations/<user|organization>/<EntityKind>/<Year>/<MonthNumber>/
export const UploadPathParts = [
  "/",
  EnvValue,
  "/",
  "organizations",
  "/",
  OrgType,
  "/",

  EntityKind,
  "/",
  YearEncoded,
  "/",
  BS.MonthNumber,
] as const;

export const UploadPathParser = S.TemplateLiteralParser(...UploadPathParts).annotations({
  schemaId: Symbol.for("@beep/storage/contract/UploadPathParser"),
  identifier: "UploadPathParser",
  title: "Upload Path Parser",
  description: "Upload path parser for storage service",
  jsonSchema: { type: "string", format: "path" },
  pretty: () => (i) => `UploadPathParser(${i})`,
});

export namespace UploadPathParser {
  export type Type = S.Schema.Type<typeof UploadPathParser>;
  export type Encoded = S.Schema.Type<typeof UploadPathParser>;
}

export class UploadPath extends S.TemplateLiteral(...UploadPathParts).annotations({
  schemaId: Symbol.for("@beep/storage/contract/UploadPath"),
  identifier: "UploadPath",
  title: "Upload Path",
  description: "Upload path for storage service",
  jsonSchema: { type: "string", format: "path" },
  pretty: () => (i) => `UploadPath(${i})`,
}) {
  static readonly parse = S.encodeSync(UploadPathParser);
  // static readonly make = S.decodeSync(this);
}

export namespace UploadPath {
  export type Type = S.Schema.Type<typeof UploadPath>;
  export type Encoded = S.Schema.Type<typeof UploadPath>;
}
