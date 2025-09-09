import { EnvValue } from "@beep/constants";
import { BS } from "@beep/schema";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain/EntityIds";
import { Organization } from "@beep/shared-domain/entities";
import * as ParseResult from "effect/ParseResult";
import * as S from "effect/Schema";
import * as Str from "effect/String";

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

export const EntityKindKit = BS.stringLiteralKit("organization", "user", "team");

export class EntityKind extends EntityKindKit.Schema {
  static readonly Options = EntityKindKit.Options;
  static readonly Enum = EntityKindKit.Enum;
}

export namespace EntityKind {
  export type Type = S.Schema.Type<typeof EntityKind>;
  export type Encoded = S.Schema.Type<typeof EntityKind>;
}

export class BucketNameEncoded extends S.String.annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketNameEncoded"),
  identifier: "BucketNameEncoded",
  title: "Bucket Name Encoded",
  description: "Bucket name encoded for storage service",
  jsonSchema: { type: "string", format: "domain-name" },
}) {}

export namespace BucketNameEncoded {
  export type Type = S.Schema.Type<typeof BucketNameEncoded>;
  export type Encoded = S.Schema.Type<typeof BucketNameEncoded>;
}

export class BucketNameDecoded extends BS.DomainName.pipe(S.brand("BucketName")).annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketNameDecoded"),
  identifier: "BucketNameDecoded",
  title: "Bucket Name Decoded",
  description: "Bucket name decoded for storage service",
  jsonSchema: { type: "string", format: "domain-name" },
}) {}

export namespace BucketNameDecoded {
  export type Type = S.Schema.Type<typeof BucketNameDecoded>;
  export type Encoded = S.Schema.Type<typeof BucketNameDecoded>;
}

export class BucketName extends S.transformOrFail(BucketNameEncoded, BucketNameDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(BucketNameDecoded)(i),
      catch: () => new ParseResult.Type(ast, i, "BucketName must be a domain name"),
    }),
  encode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(BucketNameEncoded)(i),
      catch: () => new ParseResult.Type(ast, i, "BucketName must be a domain name"),
    }),
}) {}

export namespace BucketName {
  export type Type = S.Schema.Type<typeof BucketName>;
  export type Encoded = S.Schema.Type<typeof BucketNameEncoded>;
}

export class BucketUrlEncoded extends S.TemplateLiteral("https://", BucketNameEncoded).annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketUrlEncoded"),
  identifier: "BucketUrlEncoded",
  title: "Bucket URL Encoded",
  description: "Bucket URL encoded for storage service",
}) {}

export namespace BucketUrlEncoded {
  export type Type = S.Schema.Type<typeof BucketUrlEncoded>;
  export type Encoded = S.Schema.Type<typeof BucketUrlEncoded>;
}

export class BucketUrlDecoded extends S.declare((i: unknown): i is `https://${BucketName.Type}` => {
  if (!S.is(S.NonEmptyTrimmedString)(i)) return false;
  if (!S.is(BS.HttpsUrl)) return false;
  const parts = Str.split("://")(i);
  return S.is(BucketName)(parts[1]);
}).annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketUrlDecoded"),
  identifier: "BucketUrlDecoded",
  title: "Bucket URL Decoded",
  description: "Bucket URL decoded for storage service",
}) {}

export namespace BucketUrlDecoded {
  export type Type = S.Schema.Type<typeof BucketUrlDecoded>;
  export type Encoded = S.Schema.Type<typeof BucketUrlDecoded>;
}

export class BucketUrl extends S.transformOrFail(BucketNameEncoded, BucketUrlDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(BucketUrlDecoded)(i),
      catch: () => new ParseResult.Type(ast, i, "BucketUrl must be a valid URL"),
    }),
  encode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(BucketUrlEncoded)(i),
      catch: () => new ParseResult.Type(ast, i, "BucketUrl must be a valid URL"),
    }),
}).annotations({
  schemaId: Symbol.for("@beep/storage/contract/BucketUrl"),
  identifier: "BucketUrl",
  title: "Bucket URL",
  description: "Bucket URL for storage service",
}) {}

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

export class EntityAttributeDecoded extends S.NonEmptyTrimmedString.pipe(S.brand("EntityAttribute")).annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityAttributeDecoded"),
  identifier: "EntityAttributeDecoded",
  title: "Entity Attribute Decoded",
  description: "Entity attribute decoded for storage service",
}) {}

export class EntityAttribute extends S.transformOrFail(EntityAttributeEncoded, EntityAttributeDecoded, {
  strict: true,
  decode: (i, _, ast) =>
    ParseResult.try({
      try: () => S.decodeUnknownSync(EntityAttributeDecoded)(i),
      catch: () => new ParseResult.Type(ast, i, "EntityAttribute must be a non-empty trimmed string"),
    }),
  encode: (i) => ParseResult.succeed(i),
}).annotations({
  schemaId: Symbol.for("@beep/storage/contract/EntityAttribute"),
  identifier: "EntityAttribute",
  title: "Entity Attribute",
  description: "Entity attribute for storage service",
}) {}

export namespace EntityAttribute {
  export type Type = S.Schema.Type<typeof EntityAttribute>;
  export type Encoded = S.Schema.Type<typeof EntityAttributeEncoded>;
}
export const FileIdKit = new BS.EntityIdKit({
  tableName: "file",
  brand: "FileId",
  annotations: {
    schemaId: Symbol.for("@beep/storage/contract/FileIdKit"),
    description: "File id for storage service",
  },
});

export class FileId extends FileIdKit.Schema {
  static readonly tableName = FileIdKit.tableName;
  static readonly create = FileIdKit.create;
  static readonly make = FileIdKit.make;
  static readonly is = FileIdKit.is;
}

export class FileItemExt extends BS.Ext {}

export class OrgPath extends S.TemplateLiteral("/", "organizations").annotations({
  schemaId: Symbol.for("@beep/storage/contract/OrgPath"),
  identifier: "OrgPath",
  title: "Organization Path",
  description: "Organization path for storage service",
}) {}

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

// `/<prod|dev|stage>/tenants/<users|organizations>/<EntityKind>/<EntityIdentifier>/<EntityAttribute>/<Year>/<MonthNumber>/<FileId>.<Ext>
// ## parts
// <prod|dev|stage> - environment
// <tenants> - tenant
// <"individual", "team", "enterprise"> - based on the organization type (see ./packages/shared/domain/src/Organization/schemas/OrganizationType.schema.ts)
// <tenantId> - the tenant id see ./packages/shared/domain/src/EntityIds.ts
// EntityKind - the entity name for an entity with a file reference(s)
// <EntityIdentifier> - the entity identifier see ./packages/shared/domain/src/EntityIds.ts
// <EntityAttribute> - the entity attribute/column/field for an entity with a file reference(s)
// <Year> - the year in which the file was uploaded
// <MonthNumber> - the month in which the file was uploaded
// <FileId> - the file id
// <Ext> - the file extension

export const UploadPathParser = S.TemplateLiteralParser(
  "/",
  S.Literal(...EnvValue.Options),
  "/",
  "tenants",
  "/",
  Organization.OrganizationType,
  "/",
  EntityKind,
  "/",
  YearEncoded,
  "/",
  BS.MonthNumber
).annotations({
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

export class UploadPath extends S.TemplateLiteral(
  "/",
  S.Literal(...EnvValue.Options),
  "/",
  "tenants",
  "/",
  Organization.OrganizationType,
  "/",
  EntityKind,
  "/",
  YearEncoded,
  "/",
  BS.MonthNumber
).annotations({
  schemaId: Symbol.for("@beep/storage/contract/UploadPath"),
  identifier: "UploadPath",
  title: "Upload Path",
  description: "Upload path for storage service",
  jsonSchema: { type: "string", format: "path" },
  pretty: () => (i) => `UploadPath(${i})`,
}) {
  static readonly parse = S.encodeSync(UploadPathParser);
}

export namespace UploadPath {
  export type Type = S.Schema.Type<typeof UploadPath>;
  export type Encoded = S.Schema.Type<typeof UploadPath>;
}
