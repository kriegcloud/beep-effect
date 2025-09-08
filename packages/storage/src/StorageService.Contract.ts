// import { serverEnv } from "@beep/env/server";
// import { SharedEntityIds } from "@beep/shared-domain/EntityIds";
import * as S from "effect/Schema";
import { BS } from "../../common/schema/src";

// https://static.vaultctx.org/organizations/{org-slug}/{path-kind}/{entity-identifier}/{uuid}.{file-extension}`

const filePathKit = BS.stringLiteralKit("organizations", "users");

export class FilePathKind extends filePathKit.Schema {
  static readonly Options = filePathKit.Options;
  static readonly Enum = filePathKit.Enum;
}

export namespace FilePathKind {
  export type Type = S.Schema.Type<typeof FilePathKind>;
  export type Encoded = S.Schema.Type<typeof FilePathKind>;
}

export class BucketName extends BS.DomainName.annotations({
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

export class OrgPath extends S.TemplateLiteral("organizations/", BS.Slug, "/").annotations({
  schemaId: Symbol.for("@beep/storage/contract/OrgPath"),
  identifier: "OrgPath",
  title: "Organization Path",
  description: "Organization path for storage service",
}) {}
