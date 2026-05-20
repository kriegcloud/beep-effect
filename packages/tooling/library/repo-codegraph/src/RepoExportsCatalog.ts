/**
 * File readers for the generated repo export catalog and lookup policy metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCodegraphId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { A, Str, thunkFalse } from "@beep/utils";
import { Effect, FileSystem, Inspectable, Order, Path, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { type ParseError, parse, printParseErrorCode } from "jsonc-parser";
import { RepoCodegraphPackageImportPolicy, RepoCodegraphPreferredImport } from "./RepoCodegraphLookup.model.ts";
import { decodeRepoExportsCatalog, type RepoExportsCatalog } from "./RepoExportsCatalog.model.ts";

const $I = $RepoCodegraphId.create("RepoExportsCatalog");
const catalogRelativePath = "standards/repo-exports.catalog.jsonc";
const emptyPreferredImports = (): [] => [];

/**
 * Typed failure raised while reading repo-codegraph inputs.
 *
 * @example
 * ```ts
 * import { RepoCodegraphCatalogReadError } from "@beep/repo-codegraph"
 * const error = new RepoCodegraphCatalogReadError({
 *   cause: "missing",
 *   message: "Catalog not found",
 *   operation: "read",
 *   path: "standards/repo-exports.catalog.jsonc"
 * })
 * console.log(error.operation)
 * ```
 * @category error-handling
 * @since 0.0.0
 */
export class RepoCodegraphCatalogReadError extends TaggedErrorClass<RepoCodegraphCatalogReadError>(
  $I`RepoCodegraphCatalogReadError`
)(
  "RepoCodegraphCatalogReadError",
  {
    operation: S.NonEmptyString,
    path: S.NonEmptyString,
    message: S.NonEmptyString,
    cause: S.Unknown,
  },
  $I.annote("RepoCodegraphCatalogReadError", {
    description: "Typed failure raised while reading repo-codegraph catalog and package policy inputs.",
  })
) {}

class RepoCodegraphPackagePolicyPayload extends S.Class<RepoCodegraphPackagePolicyPayload>(
  $I`RepoCodegraphPackagePolicyPayload`
)(
  {
    preferredImports: S.Array(RepoCodegraphPreferredImport).pipe(
      S.withConstructorDefault(Effect.succeed(emptyPreferredImports())),
      S.withDecodingDefault(Effect.succeed(emptyPreferredImports()))
    ),
  },
  $I.annote("RepoCodegraphPackagePolicyPayload", {
    description: "Package.json beep.importPolicy payload consumed by repo-codegraph lookup.",
  })
) {}

class RepoCodegraphPackageManifestBeep extends S.Class<RepoCodegraphPackageManifestBeep>(
  $I`RepoCodegraphPackageManifestBeep`
)(
  {
    importPolicy: S.OptionFromOptionalKey(RepoCodegraphPackagePolicyPayload),
  },
  $I.annote("RepoCodegraphPackageManifestBeep", {
    description: "Minimal package.json beep metadata read by repo-codegraph.",
  })
) {}

class RepoCodegraphPackageManifest extends S.Class<RepoCodegraphPackageManifest>($I`RepoCodegraphPackageManifest`)(
  {
    beep: S.OptionFromOptionalKey(RepoCodegraphPackageManifestBeep),
  },
  $I.annote("RepoCodegraphPackageManifest", {
    description: "Minimal package.json manifest read by repo-codegraph.",
  })
) {}

const decodePackageManifestJson = S.decodeUnknownEffect(S.fromJsonString(RepoCodegraphPackageManifest));

const catalogReadFailure = (
  operation: string,
  path: string,
  message: string,
  cause: unknown
): RepoCodegraphCatalogReadError =>
  new RepoCodegraphCatalogReadError({
    cause,
    message,
    operation,
    path,
  });

const firstParseErrorMessage = (errors: ReadonlyArray<ParseError>): string =>
  pipe(
    errors,
    A.head,
    O.map((error) => `${printParseErrorCode(error.error)} at offset ${error.offset}`),
    O.getOrElse(() => "unknown JSONC parse error")
  );

const parseJsoncUnknown = (path: string, content: string) => {
  const errors: Array<ParseError> = [];
  const parsed: unknown = parse(content, errors, { allowTrailingComma: true });

  if (A.length(errors) > 0) {
    return Effect.fail(catalogReadFailure("parse-jsonc", path, firstParseErrorMessage(errors), errors));
  }

  return Effect.succeed(parsed);
};

const readTextFile = Effect.fn("RepoCodegraph.readTextFile")(function* (path: string) {
  const fs = yield* FileSystem.FileSystem;
  return yield* fs
    .readFileString(path)
    .pipe(
      Effect.mapError((cause) =>
        catalogReadFailure("read-file", path, `Failed to read ${path}: ${Inspectable.toStringUnknown(cause, 0)}`, cause)
      )
    );
});

const packageManifestPolicy = (
  packageName: string,
  packagePath: string,
  manifest: RepoCodegraphPackageManifest
): O.Option<RepoCodegraphPackageImportPolicy> =>
  pipe(
    manifest.beep,
    O.flatMap((beep) => beep.importPolicy),
    O.map(
      (policy) =>
        new RepoCodegraphPackageImportPolicy({
          packageName,
          packagePath,
          preferredImports: policy.preferredImports,
        })
    )
  );

const readPackagePolicy = Effect.fn("RepoCodegraph.readPackagePolicy")(function* (
  repoRoot: string,
  packageName: string,
  packagePath: string
) {
  const fs = yield* FileSystem.FileSystem;
  const pathApi = yield* Path.Path;
  const manifestPath = pathApi.join(repoRoot, packagePath, "package.json");
  const exists = yield* fs.exists(manifestPath).pipe(Effect.orElseSucceed(thunkFalse));
  if (!exists) {
    return O.none<RepoCodegraphPackageImportPolicy>();
  }

  const content = yield* readTextFile(manifestPath);
  const manifest = yield* decodePackageManifestJson(content).pipe(
    Effect.mapError((cause) =>
      catalogReadFailure(
        "decode-package-policy",
        manifestPath,
        `Failed to decode package policy ${manifestPath}: ${Inspectable.toStringUnknown(cause, 0)}`,
        cause
      )
    )
  );

  return packageManifestPolicy(packageName, packagePath, manifest);
});

/**
 * Resolve the generated export catalog path for a repo root.
 *
 * @example
 * ```ts
 * import { repoExportsCatalogPath } from "@beep/repo-codegraph"
 * console.log(repoExportsCatalogPath("/repo"))
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const repoExportsCatalogPath = (repoRoot: string): Effect.Effect<string, never, Path.Path> =>
  Effect.gen(function* () {
    const pathApi = yield* Path.Path;
    return pathApi.join(repoRoot, catalogRelativePath);
  });

/**
 * Read and decode the generated repo export catalog from a repo root.
 *
 * @example
 * ```ts
 * import { readRepoExportsCatalog } from "@beep/repo-codegraph"
 * console.log(readRepoExportsCatalog)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const readRepoExportsCatalog = Effect.fn("RepoCodegraph.readRepoExportsCatalog")(function* (
  repoRoot: string
): Effect.fn.Return<
  RepoExportsCatalog,
  RepoCodegraphCatalogReadError | S.SchemaError,
  FileSystem.FileSystem | Path.Path
> {
  const catalogPath = yield* repoExportsCatalogPath(repoRoot);
  const content = yield* readTextFile(catalogPath);
  const parsed = yield* parseJsoncUnknown(catalogPath, content);
  return yield* decodeRepoExportsCatalog(parsed);
});

/**
 * Read package-local import policies from package.json metadata.
 *
 * @example
 * ```ts
 * import { readRepoCodegraphImportPolicies } from "@beep/repo-codegraph"
 * console.log(readRepoCodegraphImportPolicies)
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const readRepoCodegraphImportPolicies = Effect.fn("RepoCodegraph.readRepoCodegraphImportPolicies")(function* (
  repoRoot: string,
  catalog: RepoExportsCatalog
): Effect.fn.Return<
  ReadonlyArray<RepoCodegraphPackageImportPolicy>,
  RepoCodegraphCatalogReadError,
  FileSystem.FileSystem | Path.Path
> {
  const policies = yield* Effect.forEach(
    catalog.packages,
    (pkg) => readPackagePolicy(repoRoot, pkg.packageName, pkg.packagePath),
    { concurrency: 8 }
  );

  return pipe(
    policies,
    A.getSomes,
    A.filter((policy) => A.length(policy.preferredImports) > 0),
    A.sort(Order.mapInput(Str.Order, (policy: RepoCodegraphPackageImportPolicy) => policy.packageName))
  );
});
