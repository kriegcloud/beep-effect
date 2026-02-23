/**
 * Type-safe package.json schema using Effect v4 Schema.
 *
 * Provides validation and type inference for package.json files commonly
 * found in Node.js / Bun monorepo workspaces.
 *
 * @since 0.0.0
 * @module
 */
import { Effect, Schema } from "effect";
import type { DomainError } from "../errors/index.js";
import { jsonStringifyPretty } from "../JsonUtils.js";

/**
 * Schema for `author` field which can be a string or an object with
 * `name`, optional `email`, and optional `url`.
 *
 * @since 0.0.0
 * @category schemas
 */
export const Author = Schema.Union([
  Schema.String,
  Schema.Struct({
    name: Schema.String,
    email: Schema.optionalKey(Schema.String),
    url: Schema.optionalKey(Schema.String),
  }),
]).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/Author",
  title: "Author",
  description:
    "Package author, either as a string (e.g. 'Name <email> (url)') or a structured object with name, optional email, and optional url.",
});

/**
 * Schema for `repository` field which can be a string or an object with
 * `type`, `url`, and optional `directory`.
 *
 * @since 0.0.0
 * @category schemas
 */
export const Repository = Schema.Union([
  Schema.String,
  Schema.Struct({
    type: Schema.String,
    url: Schema.String,
    directory: Schema.optionalKey(Schema.String),
  }),
  /**
   * Fallback for non-standard repository objects (e.g. nested `repository`
   * keys or other malformed shapes found in the wild).
   */
  Schema.Record(Schema.String, Schema.Unknown),
]).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/Repository",
  title: "Repository",
  description:
    "Source code repository reference, either as a URL string, a structured object with type/url/directory, or an arbitrary record for non-standard shapes.",
});

/**
 * Schema for `bugs` field which can be a string or an object with
 * optional `url` and optional `email`.
 *
 * @since 0.0.0
 * @category schemas
 */
export const Bugs = Schema.Union([
  Schema.String,
  Schema.Struct({
    url: Schema.optionalKey(Schema.String),
    email: Schema.optionalKey(Schema.String),
  }),
]).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/Bugs",
  title: "Bugs",
  description: "Bug tracker reference, either as a URL string or a structured object with optional url and email.",
});

/**
 * A `Record<string, string>` schema used for dependency maps, scripts, engines, etc.
 *
 * @since 0.0.0
 * @category schemas
 */
const StringRecord = Schema.Record(Schema.String, Schema.String).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/StringRecord",
  title: "String Record",
  description: "A record mapping string keys to string values, used for dependency maps, scripts, and engines.",
});

/**
 * Schema for `bin` field which can be a string (single executable) or
 * a record mapping command names to file paths.
 *
 * @since 0.0.0
 * @category schemas
 */
export const Bin = Schema.Union([Schema.String, StringRecord]).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/Bin",
  title: "Bin",
  description: "Executable binaries, either a single file path string or a record mapping command names to file paths.",
});

/**
 * Type-safe schema for package.json files.
 *
 * - `name` is the only required field
 * - All other fields are optional, matching the npm package.json specification
 * - Excess properties are stripped by default during decoding
 *
 * @since 0.0.0
 * @category schemas
 */
export const PackageJson = Schema.Struct({
  name: Schema.String,
  version: Schema.optionalKey(Schema.String),
  description: Schema.optionalKey(Schema.String),
  keywords: Schema.optionalKey(Schema.Array(Schema.String)),
  license: Schema.optionalKey(Schema.String),
  private: Schema.optionalKey(Schema.Boolean),
  type: Schema.optionalKey(Schema.String),
  main: Schema.optionalKey(Schema.String),
  module: Schema.optionalKey(Schema.String),
  types: Schema.optionalKey(Schema.String),
  scripts: Schema.optionalKey(StringRecord),
  dependencies: Schema.optionalKey(StringRecord),
  devDependencies: Schema.optionalKey(StringRecord),
  peerDependencies: Schema.optionalKey(StringRecord),
  optionalDependencies: Schema.optionalKey(StringRecord),
  bin: Schema.optionalKey(Bin),
  exports: Schema.optionalKey(Schema.Unknown),
  files: Schema.optionalKey(Schema.Array(Schema.String)),
  engines: Schema.optionalKey(StringRecord),
  workspaces: Schema.optionalKey(Schema.Array(Schema.String)),
  author: Schema.optionalKey(Author),
  repository: Schema.optionalKey(Repository),
  bugs: Schema.optionalKey(Bugs),
  funding: Schema.optionalKey(Schema.Unknown),
  homepage: Schema.optionalKey(Schema.String),
  sideEffects: Schema.optionalKey(Schema.Unknown),
  publishConfig: Schema.optionalKey(Schema.Unknown),
}).annotate({
  identifier: "@beep/repo-utils/schemas/PackageJson/PackageJson",
  title: "Package JSON",
  description:
    "Type-safe schema for package.json files. Only `name` is required; all other fields are optional and match the npm package.json specification.",
  examples: [{ name: "@beep/my-pkg", version: "1.0.0", dependencies: { effect: "^4.0.0" } }],
});

/**
 * The decoded TypeScript type for a package.json file.
 *
 * @since 0.0.0
 * @category types
 */
export type PackageJson = (typeof PackageJson)["Type"];

/**
 * Synchronously decode an unknown value into a `PackageJson`.
 * Throws a `SchemaError` if validation fails.
 *
 * @since 0.0.0
 * @category decoding
 */
export const decodePackageJson = Schema.decodeUnknownSync(PackageJson);

/**
 * Synchronously decode an unknown value into a `PackageJson`,
 * returning an `Exit` instead of throwing.
 *
 * @since 0.0.0
 * @category decoding
 */
export const decodePackageJsonExit = Schema.decodeUnknownExit(PackageJson);

/**
 * Decode an unknown value into a `PackageJson` as an Effect.
 * Returns `Effect<PackageJson, SchemaError>`.
 *
 * @since 0.0.0
 * @category decoding
 */
export const decodePackageJsonEffect = Schema.decodeUnknownEffect(PackageJson);

/**
 * Encode a `PackageJson` value back to its encoded (plain object) form as an Effect.
 * Returns `Effect<unknown, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonEffect = Schema.encodeUnknownEffect(PackageJson);

/**
 * Encode a `PackageJson` value to a compact JSON string as an Effect.
 * Uses `Schema.fromJsonString(PackageJson)` for schema-validated serialization.
 * Returns `Effect<string, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonToJsonEffect = Schema.encodeUnknownEffect(Schema.fromJsonString(PackageJson));

/**
 * Encode a `PackageJson` value to a pretty-printed JSON string (2-space indent).
 * Validates through the `PackageJson` schema before serialization.
 * Returns `Effect<string, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonPrettyEffect: (
  input: unknown
) => Effect.Effect<string, Schema.SchemaError | DomainError> = Effect.fn(function* (input) {
  const validated = yield* encodePackageJsonEffect(input);
  return yield* jsonStringifyPretty(validated);
});
