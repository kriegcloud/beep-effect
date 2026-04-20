/**
 * Canonicalization, artifact export, diff/patch, and diagnostics helpers for package.json schemas.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoUtilsId } from "@beep/identity/packages";
import { ArrayOfStrings } from "@beep/schema";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import { Effect, identity, type JsonPatch, JsonPointer, Order, pipe, SchemaIssue, Tuple } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { DomainError } from "../errors/index.js";
import { jsonStringifyPretty } from "../JsonUtils.js";
import {
  Browser,
  decodePackageJsonEffect,
  encodePackageJsonEffect,
  NpmPackageJson,
  PackageExports,
  PackageImports,
  PackageJson,
  PeerDependenciesMeta,
  PublishConfig,
  TypesVersions,
} from "./PackageJson.js";

const $I = $RepoUtilsId.create("schemas/PackageJsonTools");

const packageJsonDiffer = S.toDifferJsonPatch(PackageJson);

const publishConfigKeyOrder = A.make("access", "tag", "registry", "provenance", "bin", "exports");

const isStringRecord = (value: unknown): value is Readonly<Record<string, unknown>> => P.isObject(value);

type IssuePathSegment = NonNullable<StandardSchemaV1.Issue["path"]>[number];

const decodeBrowser = S.decodeUnknownSync(Browser);
const decodePackageExports = S.decodeUnknownSync(PackageExports);
const decodePackageImports = S.decodeUnknownSync(PackageImports);
const decodePeerDependenciesMeta = S.decodeUnknownSync(PeerDependenciesMeta);
const decodePublishConfig = S.decodeUnknownSync(PublishConfig);
const decodeTypesVersions = S.decodeUnknownSync(TypesVersions);

const isIssuePathSegmentObject = (value: IssuePathSegment): value is StandardSchemaV1.PathSegment =>
  P.isObject(value) &&
  P.hasProperty(value, "key") &&
  (P.isString(value.key) || P.isNumber(value.key) || P.isSymbol(value.key));

const toIssuePathPropertyKey = (segment: IssuePathSegment): PropertyKey =>
  isIssuePathSegmentObject(segment) ? segment.key : segment;

const toPathSegment = (value: PropertyKey): string => {
  if (P.isString(value)) {
    return value;
  }
  if (P.isNumber(value)) {
    return `${value}`;
  }
  return value.description === undefined ? "Symbol()" : `Symbol(${value.description})`;
};

const renderIssuePathSegment = (segment: IssuePathSegment): string => toPathSegment(toIssuePathPropertyKey(segment));

const sortStringRecord = <Value>(
  record: Readonly<Record<string, Value>>,
  normalizeValue: (value: Value) => Value
): Record<string, Value> =>
  pipe(
    R.toEntries(record),
    A.map(([key, value]) => Tuple.make(key, normalizeValue(value))),
    A.sort(Order.mapInput(Order.String, ([key]: [string, Value]) => key)),
    R.fromEntries
  );

const canonicalizeUnknownValue = (value: unknown): unknown => {
  if (A.isArray(value)) {
    return A.map(value, canonicalizeUnknownValue);
  }
  if (isStringRecord(value)) {
    return sortStringRecord(value, canonicalizeUnknownValue);
  }
  return value;
};

const isKnownPublishConfigKey = (key: string): boolean =>
  key === "access" || key === "tag" || key === "registry" || key === "provenance" || key === "bin" || key === "exports";

const canonicalizePublishConfigValue = (key: string, value: unknown): unknown => {
  if (key === "bin" && isStringRecord(value)) {
    return sortStringRecord(value, identity);
  }
  if (key === "exports") {
    return canonicalizeUnknownValue(value);
  }
  return value;
};

const canonicalizePublishConfig = (
  value: NonNullable<PackageJson.Encoded["publishConfig"]>
): NonNullable<PackageJson.Encoded["publishConfig"]> => {
  if (!isStringRecord(value)) {
    return value;
  }

  let out = R.empty<string, unknown>();
  for (const key of publishConfigKeyOrder) {
    if (R.has(key)(value)) {
      out = R.set(out, key, canonicalizePublishConfigValue(key, value[key]));
    }
  }

  const remaining = pipe(
    R.toEntries(value),
    A.filter(([key]) => !isKnownPublishConfigKey(key)),
    A.sort(Order.mapInput(Order.String, ([key]: [string, unknown]) => key))
  );

  for (const [key, entryValue] of remaining) {
    out = R.set(out, key, canonicalizeUnknownValue(entryValue));
  }

  return decodePublishConfig(out);
};

const canonicalizePackageJsonEncoded = (encoded: PackageJson.Encoded): PackageJson.Encoded => {
  return {
    name: encoded.name,
    ...(encoded.version === undefined ? {} : { version: encoded.version }),
    ...(encoded.description === undefined ? {} : { description: encoded.description }),
    ...(encoded.keywords === undefined ? {} : { keywords: encoded.keywords }),
    ...(encoded.license === undefined ? {} : { license: encoded.license }),
    ...(encoded.private === undefined ? {} : { private: encoded.private }),
    ...(encoded.type === undefined ? {} : { type: encoded.type }),
    ...(encoded.packageManager === undefined ? {} : { packageManager: encoded.packageManager }),
    ...(encoded.workspaces === undefined ? {} : { workspaces: encoded.workspaces }),
    ...(encoded.homepage === undefined ? {} : { homepage: encoded.homepage }),
    ...(encoded.repository === undefined ? {} : { repository: encoded.repository }),
    ...(encoded.bugs === undefined ? {} : { bugs: encoded.bugs }),
    ...(encoded.author === undefined ? {} : { author: encoded.author }),
    ...(encoded.contributors === undefined ? {} : { contributors: encoded.contributors }),
    ...(encoded.maintainers === undefined ? {} : { maintainers: encoded.maintainers }),
    ...(encoded.funding === undefined ? {} : { funding: encoded.funding }),
    ...(encoded.scripts === undefined ? {} : { scripts: sortStringRecord(encoded.scripts, identity) }),
    ...(encoded.main === undefined ? {} : { main: encoded.main }),
    ...(encoded.module === undefined ? {} : { module: encoded.module }),
    ...(encoded.types === undefined ? {} : { types: encoded.types }),
    ...(encoded.typings === undefined ? {} : { typings: encoded.typings }),
    ...(encoded.exports === undefined
      ? {}
      : { exports: decodePackageExports(canonicalizeUnknownValue(encoded.exports)) }),
    ...(encoded.imports === undefined
      ? {}
      : { imports: decodePackageImports(canonicalizeUnknownValue(encoded.imports)) }),
    ...(encoded.browser === undefined
      ? {}
      : {
          browser: P.isString(encoded.browser)
            ? encoded.browser
            : decodeBrowser(canonicalizeUnknownValue(encoded.browser)),
        }),
    ...(encoded.bin === undefined ? {} : { bin: encoded.bin }),
    ...(encoded.man === undefined ? {} : { man: encoded.man }),
    ...(encoded.directories === undefined ? {} : { directories: encoded.directories }),
    ...(encoded.files === undefined ? {} : { files: encoded.files }),
    ...(encoded.sideEffects === undefined ? {} : { sideEffects: encoded.sideEffects }),
    ...(encoded.publishConfig === undefined ? {} : { publishConfig: canonicalizePublishConfig(encoded.publishConfig) }),
    ...(encoded.config === undefined ? {} : { config: encoded.config }),
    ...(encoded.dependencies === undefined ? {} : { dependencies: sortStringRecord(encoded.dependencies, identity) }),
    ...(encoded.devDependencies === undefined
      ? {}
      : { devDependencies: sortStringRecord(encoded.devDependencies, identity) }),
    ...(encoded.peerDependencies === undefined
      ? {}
      : { peerDependencies: sortStringRecord(encoded.peerDependencies, identity) }),
    ...(encoded.peerDependenciesMeta === undefined
      ? {}
      : { peerDependenciesMeta: decodePeerDependenciesMeta(canonicalizeUnknownValue(encoded.peerDependenciesMeta)) }),
    ...(encoded.optionalDependencies === undefined
      ? {}
      : { optionalDependencies: sortStringRecord(encoded.optionalDependencies, identity) }),
    ...(encoded.bundleDependencies === undefined ? {} : { bundleDependencies: encoded.bundleDependencies }),
    ...(encoded.bundledDependencies === undefined ? {} : { bundledDependencies: encoded.bundledDependencies }),
    ...(encoded.overrides === undefined ? {} : { overrides: encoded.overrides }),
    ...(encoded.resolutions === undefined ? {} : { resolutions: sortStringRecord(encoded.resolutions, identity) }),
    ...(encoded.catalog === undefined ? {} : { catalog: sortStringRecord(encoded.catalog, identity) }),
    ...(encoded["resolutions#"] === undefined
      ? {}
      : { "resolutions#": sortStringRecord(encoded["resolutions#"], identity) }),
    ...(encoded.engines === undefined ? {} : { engines: sortStringRecord(encoded.engines, identity) }),
    ...(encoded.engineStrict === undefined ? {} : { engineStrict: encoded.engineStrict }),
    ...(encoded.os === undefined ? {} : { os: encoded.os }),
    ...(encoded.cpu === undefined ? {} : { cpu: encoded.cpu }),
    ...(encoded.libc === undefined ? {} : { libc: encoded.libc }),
    ...(encoded.devEngines === undefined ? {} : { devEngines: encoded.devEngines }),
    ...(encoded.preferGlobal === undefined ? {} : { preferGlobal: encoded.preferGlobal }),
    ...(encoded.readme === undefined ? {} : { readme: encoded.readme }),
    ...(encoded.typesVersions === undefined
      ? {}
      : { typesVersions: decodeTypesVersions(canonicalizeUnknownValue(encoded.typesVersions)) }),
  };
};

const toPointer = (path: ReadonlyArray<string>): string =>
  A.isReadonlyArrayEmpty(path) ? "" : `/${pipe(path, A.map(JsonPointer.escapeToken), A.join("/"))}`;

const renderIssuePath = (path: StandardSchemaV1.Issue["path"]): ReadonlyArray<string> =>
  pipe(
    O.fromNullishOr(path),
    O.map(
      (segments: ReadonlyArray<IssuePathSegment>): ReadonlyArray<string> =>
        pipe(segments, A.map(renderIssuePathSegment))
    ),
    O.getOrElse(A.empty<string>)
  );

/**
 * Structured package.json validation issue.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class PackageJsonValidationIssue extends S.Class<PackageJsonValidationIssue>($I`PackageJsonValidationIssue`)(
  {
    path: ArrayOfStrings,
    pointer: S.String,
    message: S.String,
  },
  $I.annote("PackageJsonValidationIssue", {
    description: "A formatted package.json validation issue with both path segments and a JSON Pointer.",
  })
) {}

/**
 * Draft 2020-12 JSON Schema document for the repo-aware package.json schema.
 *
 * @category Utility
 * @since 0.0.0
 */
export const packageJsonJsonSchema = S.toJsonSchemaDocument(PackageJson);

/**
 * Draft 2020-12 JSON Schema document for the npm-only package.json schema.
 *
 * @category Utility
 * @since 0.0.0
 */
export const npmPackageJsonJsonSchema = S.toJsonSchemaDocument(NpmPackageJson);

/**
 * Normalize an unknown package.json value into a canonical encoded object.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const normalizePackageJsonEffect: (input: unknown) => Effect.Effect<PackageJson.Encoded, S.SchemaError> =
  Effect.fn("RepoUtils.PackageJsonTools.normalizePackageJson")(function* (input) {
    const encoded = yield* encodePackageJsonEffect(input);
    return canonicalizePackageJsonEncoded(encoded);
  });

/**
 * Encode an unknown package.json value to a canonical pretty JSON string.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const encodePackageJsonCanonicalPrettyEffect: (
  input: unknown
) => Effect.Effect<string, S.SchemaError | DomainError> = Effect.fn(
  "RepoUtils.PackageJsonTools.encodePackageJsonCanonicalPretty"
)(function* (input) {
  const normalized = yield* normalizePackageJsonEffect(input);
  return yield* jsonStringifyPretty(normalized);
});

/**
 * Compute a typed JSON Patch diff between two package.json values.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const diffPackageJsonEffect: (
  before: unknown,
  after: unknown
) => Effect.Effect<JsonPatch.JsonPatch, S.SchemaError> = Effect.fn("RepoUtils.PackageJsonTools.diffPackageJson")(
  function* (before, after) {
    const decodedBefore = yield* decodePackageJsonEffect(before);
    const decodedAfter = yield* decodePackageJsonEffect(after);
    return packageJsonDiffer.diff(decodedBefore, decodedAfter);
  }
);

/**
 * Apply a typed JSON Patch document to a package.json value.
 *
 * @category DomainLogic
 * @since 0.0.0
 */
export const applyPackageJsonPatchEffect: (
  base: unknown,
  patch: JsonPatch.JsonPatch
) => Effect.Effect<PackageJson.Type, S.SchemaError | DomainError> = Effect.fn(
  "RepoUtils.PackageJsonTools.applyPackageJsonPatch"
)(function* (base, patch) {
  const decodedBase = yield* decodePackageJsonEffect(base);
  return yield* Effect.try({
    try: () => packageJsonDiffer.patch(decodedBase, patch),
    catch: (cause) => new DomainError({ cause, message: "Failed to apply package.json JSON Patch" }),
  });
});

/**
 * Format a SchemaError into package.json validation issues with JSON Pointers.
 *
 * @param error - Schema decoding or encoding error to render as structured validation issues.
 * @returns Structured validation issues derived from the schema error.
 * @category Utility
 * @since 0.0.0
 */
export const getPackageJsonSchemaIssues = (error: S.SchemaError): ReadonlyArray<PackageJsonValidationIssue> =>
  pipe(
    SchemaIssue.makeFormatterStandardSchemaV1()(error.issue).issues,
    A.map(({ path, message }) => {
      const renderedPath = renderIssuePath(path);
      return new PackageJsonValidationIssue({
        path: renderedPath,
        pointer: toPointer(renderedPath),
        message,
      });
    })
  );
