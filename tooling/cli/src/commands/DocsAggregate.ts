/**
 * Docs aggregation command implementation.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Console, Effect, FileSystem, HashSet, MutableHashSet, Order, Path, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/DocsAggregate");
const PACKAGE_ROOTS = ["packages", "tooling", "apps"] as const;
const IGNORED_DIRS = HashSet.fromIterable([".git", ".turbo", "node_modules", "dist", "build"]);
const byStringAscending: Order.Order<string> = Order.String;
const byDocsOutputPathAscending: Order.Order<DocsPackage> = Order.mapInput(
  Order.String,
  (pkg: DocsPackage) => pkg.outputPath
);
type DocsEnv = FileSystem.FileSystem | Path.Path;

class DocsPackage extends S.Class<DocsPackage>($I`DocsPackage`)(
  {
    packageDir: S.String,
    outputPath: S.String,
  },
  $I.annote("DocsPackage", {
    description: "Package docs source and output destination descriptor.",
  })
) {}

class PackageJsonDocument extends S.Class<PackageJsonDocument>($I`PackageJsonDocument`)(
  {
    name: S.optionalKey(S.UndefinedOr(S.String)),
  },
  $I.annote("PackageJsonDocument", {
    description: "Minimal package.json document for docs aggregation.",
  })
) {}

class DocsAggregateFailure extends TaggedErrorClass<DocsAggregateFailure>($I`DocsAggregateFailure`)(
  "DocsAggregateFailure",
  {
    message: S.String,
  },
  $I.annote("DocsAggregateFailure", {
    description: "Docs aggregation operation failed.",
  })
) {}

const decodePackageJsonDocument = S.decodeUnknownEffect(S.fromJsonString(PackageJsonDocument));

const walkRoot = (root: string): Effect.Effect<ReadonlyArray<DocsPackage>, DocsAggregateFailure, DocsEnv> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const exists = yield* fs.exists(root).pipe(Effect.orElseSucceed(() => false));
    if (!exists) {
      return A.empty<DocsPackage>();
    }

    const walk = (relativePath: string): Effect.Effect<ReadonlyArray<DocsPackage>, DocsAggregateFailure, DocsEnv> =>
      Effect.gen(function* () {
        const packageDir = Str.isNonEmpty(relativePath) ? path.join(root, relativePath) : root;
        const docsModulesPath = path.join(packageDir, "docs", "modules");
        const hasDocsModules = yield* fs.exists(docsModulesPath).pipe(Effect.orElseSucceed(() => false));
        if (hasDocsModules) {
          return A.make(
            new DocsPackage({
              packageDir,
              outputPath: relativePath,
            })
          );
        }

        const entries = yield* fs.readDirectory(packageDir).pipe(Effect.orElseSucceed(A.empty<string>));
        const directories = yield* Effect.forEach(entries, (entry) =>
          Effect.gen(function* () {
            if (HashSet.has(IGNORED_DIRS, entry)) {
              return O.none<string>();
            }

            const fullPath = path.join(packageDir, entry);
            const stat = yield* fs.stat(fullPath).pipe(Effect.option);
            if (O.isNone(stat) || stat.value.type !== "Directory") {
              return O.none<string>();
            }
            return O.some(entry);
          })
        );

        const sorted = pipe(directories, A.getSomes, A.sort(byStringAscending));
        const nested = yield* Effect.forEach(sorted, (child) =>
          walk(Str.isNonEmpty(relativePath) ? path.join(relativePath, child) : child)
        );
        return A.flatten(nested);
      });

    return yield* walk("");
  });

const findPackages = Effect.gen(function* () {
  const discovered = yield* Effect.forEach(PACKAGE_ROOTS, (root) => walkRoot(root), {
    concurrency: "unbounded",
  });
  const packages = A.sort(A.flatten(discovered), byDocsOutputPathAscending);

  const duplicateOutputPaths = MutableHashSet.empty<string>();
  const seenOutputPaths = MutableHashSet.empty<string>();

  for (const pkg of packages) {
    if (MutableHashSet.has(seenOutputPaths, pkg.outputPath)) {
      MutableHashSet.add(duplicateOutputPaths, pkg.outputPath);
      continue;
    }
    MutableHashSet.add(seenOutputPaths, pkg.outputPath);
  }

  if (MutableHashSet.size(duplicateOutputPaths) > 0) {
    const duplicateList = pipe(A.fromIterable(duplicateOutputPaths), A.sort(byStringAscending), A.join(", "));
    return yield* new DocsAggregateFailure({
      message: `Duplicate docs output paths detected: ${duplicateList}`,
    });
  }

  return packages;
});

const pkgName = (pkg: DocsPackage): Effect.Effect<string, DocsAggregateFailure, DocsEnv> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const packageJsonPath = path.join(pkg.packageDir, "package.json");
    const packageJson = yield* fs.readFileString(packageJsonPath).pipe(
      Effect.mapError(
        (cause) =>
          new DocsAggregateFailure({
            message: `Failed to read ${packageJsonPath}: ${Str.trim(`${cause}`)}`,
          })
      )
    );
    const decoded = yield* decodePackageJsonDocument(packageJson).pipe(
      Effect.mapError(
        (cause) =>
          new DocsAggregateFailure({
            message: `Failed to decode package.json at ${packageJsonPath}: ${Str.trim(`${cause}`)}`,
          })
      )
    );
    return O.getOrElse(O.fromUndefinedOr(decoded.name), () => pkg.outputPath);
  });

const copyFiles = (pkg: DocsPackage, name: string): Effect.Effect<void, DocsAggregateFailure, DocsEnv> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const docs = path.join(pkg.packageDir, "docs", "modules");
    const dest = path.join("docs", pkg.outputPath);

    yield* fs.remove(dest, { recursive: true, force: true }).pipe(Effect.orElseSucceed(() => undefined));
    yield* fs.makeDirectory(dest, { recursive: true }).pipe(
      Effect.mapError(
        (cause) =>
          new DocsAggregateFailure({
            message: `Failed to create docs destination ${dest}: ${Str.trim(`${cause}`)}`,
          })
      )
    );

    const copyTree = (relativePath: string): Effect.Effect<void, DocsAggregateFailure, DocsEnv> =>
      Effect.gen(function* () {
        const sourceDir = Str.isNonEmpty(relativePath) ? path.join(docs, relativePath) : docs;
        const entries = yield* fs.readDirectory(sourceDir).pipe(
          Effect.mapError(
            (cause) =>
              new DocsAggregateFailure({
                message: `Failed to read docs directory ${sourceDir}: ${Str.trim(`${cause}`)}`,
              })
          )
        );

        for (const entry of entries) {
          const sourcePath = path.join(sourceDir, entry);
          const targetRelative = Str.isNonEmpty(relativePath) ? path.join(relativePath, entry) : entry;
          const destPath = path.join(dest, targetRelative);
          const stat = yield* fs.stat(sourcePath).pipe(
            Effect.mapError(
              (cause) =>
                new DocsAggregateFailure({
                  message: `Failed to stat docs path ${sourcePath}: ${Str.trim(`${cause}`)}`,
                })
            )
          );

          if (stat.type === "Directory") {
            yield* fs.makeDirectory(destPath, { recursive: true }).pipe(
              Effect.mapError(
                (cause) =>
                  new DocsAggregateFailure({
                    message: `Failed to create directory ${destPath}: ${Str.trim(`${cause}`)}`,
                  })
              )
            );
            yield* copyTree(targetRelative);
            continue;
          }

          const content = yield* fs.readFileString(sourcePath).pipe(
            Effect.mapError(
              (cause) =>
                new DocsAggregateFailure({
                  message: `Failed to read docs file ${sourcePath}: ${Str.trim(`${cause}`)}`,
                })
            )
          );
          const rewritten = Str.replace(/^parent: Modules$/m, `parent: "${name}"`)(content);
          yield* fs.writeFileString(destPath, rewritten).pipe(
            Effect.mapError(
              (cause) =>
                new DocsAggregateFailure({
                  message: `Failed to write docs file ${destPath}: ${Str.trim(`${cause}`)}`,
                })
            )
          );
        }
      });

    yield* copyTree("");
  });

const generateIndex = (
  outputPath: string,
  name: string,
  order: number
): Effect.Effect<void, DocsAggregateFailure, DocsEnv> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const permalink = Str.replace(/\\/g, "/")(outputPath);
    const content = `---
title: "${name}"
has_children: true
permalink: /docs/${permalink}
nav_order: ${order}
---
`;
    yield* fs.writeFileString(path.join("docs", outputPath, "index.md"), content).pipe(
      Effect.mapError(
        (cause) =>
          new DocsAggregateFailure({
            message: `Failed to write docs index for ${outputPath}: ${Str.trim(`${cause}`)}`,
          })
      )
    );
  });

const aggregateDocs = Effect.fn(function* () {
  const packages = yield* findPackages;

  for (let index = 0; index < A.length(packages); index += 1) {
    const pkg = packages[index];
    if (pkg === undefined) {
      continue;
    }

    const name = yield* pkgName(pkg);
    yield* copyFiles(pkg, name);
    yield* generateIndex(pkg.outputPath, name, index + 2);
    yield* Console.log(`✅ Processed docs for ${name}`);
  }

  yield* Console.log("");
  yield* Console.log(`✅ Aggregated docs from ${A.length(packages)} packages`);
});

/**
 * Aggregate package docs under root `docs/`.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const docsAggregateCommand = Command.make("aggregate", {}, aggregateDocs).pipe(
  Command.withDescription("Aggregate package docs/modules output into root docs directory")
);
