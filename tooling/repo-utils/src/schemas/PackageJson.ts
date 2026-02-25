/**
 * Type-safe package.json schema using Effect v4 Schema.
 *
 * Provides validation and type inference for package.json files commonly
 * found in Node.js / Bun monorepo workspaces.
 *
 * @since 0.0.0
 * @module
 */
import { Effect } from "effect";
import * as S from "effect/Schema";
import type { DomainError } from "../errors/index.js";
import { jsonStringifyPretty } from "../JsonUtils.js";

/**
 * Schema for `author` field which can be a string or an object with
 * `name`, optional `email`, and optional `url`.
 *
 * @since 0.0.0
 * @category schemas
 */
export const Author = S.Union([
  S.String,
  S.Struct({
    name: S.String,
    email: S.optionalKey(S.String),
    url: S.optionalKey(S.String),
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
export const Repository = S.Union([
  S.String,
  S.Struct({
    type: S.String,
    url: S.String,
    directory: S.optionalKey(S.String),
  }),
  /**
   * Fallback for non-standard repository objects (e.g. nested `repository`
   * keys or other malformed shapes found in the wild).
   */
  S.Record(S.String, S.Unknown),
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
export const Bugs = S.Union([
  S.String,
  S.Struct({
    url: S.optionalKey(S.String),
    email: S.optionalKey(S.String),
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
const StringRecord = S.Record(S.String, S.String).annotate({
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
export const Bin = S.Union([S.String, StringRecord]).annotate({
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
export const PackageJson = S.Struct({
  name: S.String,
  version: S.optionalKey(S.String),
  description: S.optionalKey(S.String),
  keywords: S.optionalKey(S.Array(S.String)),
  license: S.optionalKey(S.String),
  private: S.optionalKey(S.Boolean),
  type: S.optionalKey(S.String),
  main: S.optionalKey(S.String),
  module: S.optionalKey(S.String),
  types: S.optionalKey(S.String),
  scripts: S.optionalKey(StringRecord),
  dependencies: S.optionalKey(StringRecord),
  devDependencies: S.optionalKey(StringRecord),
  peerDependencies: S.optionalKey(StringRecord),
  optionalDependencies: S.optionalKey(StringRecord),
  bin: S.optionalKey(Bin),
  exports: S.optionalKey(S.Unknown),
  files: S.optionalKey(S.Array(S.String)),
  engines: S.optionalKey(StringRecord),
  workspaces: S.optionalKey(S.Array(S.String)),
  author: S.optionalKey(Author),
  repository: S.optionalKey(Repository),
  bugs: S.optionalKey(Bugs),
  funding: S.optionalKey(S.Unknown),
  homepage: S.optionalKey(S.String),
  sideEffects: S.optionalKey(S.Unknown),
  publishConfig: S.optionalKey(S.Unknown),
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
export const decodePackageJson = S.decodeUnknownSync(PackageJson);

/**
 * Synchronously decode an unknown value into a `PackageJson`,
 * returning an `Exit` instead of throwing.
 *
 * @since 0.0.0
 * @category decoding
 */
export const decodePackageJsonExit = S.decodeUnknownExit(PackageJson);

/**
 * Decode an unknown value into a `PackageJson` as an Effect.
 * Returns `Effect<PackageJson, SchemaError>`.
 *
 * @since 0.0.0
 * @category decoding
 */
export const decodePackageJsonEffect = S.decodeUnknownEffect(PackageJson);

/**
 * Encode a `PackageJson` value back to its encoded (plain object) form as an Effect.
 * Returns `Effect<unknown, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonEffect = S.encodeUnknownEffect(PackageJson);

/**
 * Encode a `PackageJson` value to a compact JSON string as an Effect.
 * Uses `S.fromJsonString(PackageJson)` for schema-validated serialization.
 * Returns `Effect<string, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonToJsonEffect = S.encodeUnknownEffect(S.fromJsonString(PackageJson));

/**
 * Encode a `PackageJson` value to a pretty-printed JSON string (2-space indent).
 * Validates through the `PackageJson` schema before serialization.
 * Returns `Effect<string, SchemaError>`.
 *
 * @since 0.0.0
 * @category encoding
 */
export const encodePackageJsonPrettyEffect: (input: unknown) => Effect.Effect<string, S.SchemaError | DomainError> =
  Effect.fn(function* (input) {
    const validated = yield* encodePackageJsonEffect(input);
    return yield* jsonStringifyPretty(validated);
  });
