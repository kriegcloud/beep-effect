/**
 * Docs aggregation command implementation.
 *
 * @since 0.0.0
 * @module
 */

import * as Fs from "node:fs";
import { $RepoCliId } from "@beep/identity/packages";
import { Console, Effect, HashSet, Inspectable, MutableHashSet, Order, Path, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/DocsAggregate");
const PACKAGE_ROOTS = ["packages", "tooling", "apps"] as const;
const IGNORED_DIRS = HashSet.fromIterable([".git", ".turbo", "node_modules", "dist", "build"]);
const byStringAscending: Order.Order<string> = Order.String;
const byDocsOutputPathAscending: Order.Order<DocsPackage> = Order.mapInput(Order.String, (pkg: DocsPackage) => pkg.outputPath);

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

class DocsAggregateFailure extends S.TaggedErrorClass<DocsAggregateFailure>($I`DocsAggregateFailure`)(
  "DocsAggregateFailure",
  {
    message: S.String,
  },
  $I.annote("DocsAggregateFailure", {
    description: "Docs aggregation operation failed.",
  })
) {}

const walkRoot = (root: string, path: Path.Path): Array<DocsPackage> => {
  const packages = [] as Array<DocsPackage>;

  if (!Fs.existsSync(root)) {
    return packages;
  }

  const walk = (relativePath: string): void => {
    const packageDir = relativePath.length > 0 ? path.join(root, relativePath) : root;

    if (Fs.existsSync(path.join(packageDir, "docs/modules"))) {
      packages.push(
        new DocsPackage({
          packageDir,
          outputPath: relativePath,
        })
      );
      return;
    }

    const children = pipe(
      Fs.readdirSync(packageDir, { withFileTypes: true }),
      A.filter((entry) => entry.isDirectory() && !HashSet.has(IGNORED_DIRS, entry.name)),
      A.map((entry) => entry.name),
      (names) => A.sort(names, byStringAscending)
    );

    for (const child of children) {
      walk(relativePath.length > 0 ? path.join(relativePath, child) : child);
    }
  };

  walk("");
  return packages;
};

const findPackages = (path: Path.Path): Array<DocsPackage> => {
  const packages = A.sort(
    pipe(PACKAGE_ROOTS, A.flatMap((root) => walkRoot(root, path))),
    byDocsOutputPathAscending
  );

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
    throw new DocsAggregateFailure({
      message: `Duplicate docs output paths detected: ${duplicateList}`,
    });
  }

  return packages;
};

const decodePackageJsonDocument = S.decodeUnknownSync(S.fromJsonString(PackageJsonDocument));

const pkgName = (pkg: DocsPackage, path: Path.Path): string => {
  const packageJson = Fs.readFileSync(path.join(pkg.packageDir, "package.json"), "utf8");
  const decoded = decodePackageJsonDocument(packageJson);
  return O.getOrElse(O.fromUndefinedOr(decoded.name), () => pkg.outputPath);
};

const copyFiles = (pkg: DocsPackage, path: Path.Path): void => {
  const name = pkgName(pkg, path);
  const docs = path.join(pkg.packageDir, "docs/modules");
  const dest = path.join("docs", pkg.outputPath);
  const files = Fs.readdirSync(docs, { withFileTypes: true });

  const handleFiles = (root: string, entries: ReadonlyArray<Fs.Dirent>): void => {
    for (const file of entries) {
      const sourcePath = path.join(docs, root, file.name);
      const destPath = path.join(dest, root, file.name);

      if (file.isDirectory()) {
        Fs.mkdirSync(destPath, { recursive: true });
        handleFiles(path.join(root, file.name), Fs.readdirSync(sourcePath, { withFileTypes: true }));
        continue;
      }

      const content = Str.replace(/^parent: Modules$/m, `parent: "${name}"`)(Fs.readFileSync(sourcePath, "utf8"));
      Fs.writeFileSync(destPath, content);
    }
  };

  Fs.rmSync(dest, { recursive: true, force: true });
  Fs.mkdirSync(dest, { recursive: true });
  handleFiles("", files);
};

const generateIndex = (outputPath: string, name: string, order: number, path: Path.Path): void => {
  const permalink = Str.replace(/\\/g, "/")(outputPath);
  const content = `---
title: "${name}"
has_children: true
permalink: /docs/${permalink}
nav_order: ${order}
---
`;

  Fs.writeFileSync(path.join("docs", outputPath, "index.md"), content);
};

const aggregateDocs = Effect.fn(function* () {
  const path = yield* Path.Path;

  const packages = yield* Effect.try({
    try: () => findPackages(path),
    catch: (cause) =>
      new DocsAggregateFailure({
        message: `Failed to discover docs packages: ${Inspectable.toStringUnknown(cause, 0)}`,
      }),
  });

  for (let index = 0; index < A.length(packages); index += 1) {
    const pkg = packages[index];
    if (pkg === undefined) {
      continue;
    }

    const name = yield* Effect.try({
      try: () => pkgName(pkg, path),
      catch: (cause) =>
        new DocsAggregateFailure({
          message: `Failed reading package name for ${pkg.packageDir}: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });

    yield* Effect.try({
      try: () => {
        Fs.rmSync(path.join("docs", pkg.outputPath), { recursive: true, force: true });
        Fs.mkdirSync(path.join("docs", pkg.outputPath), { recursive: true });
        copyFiles(pkg, path);
        generateIndex(pkg.outputPath, name, index + 2, path);
      },
      catch: (cause) =>
        new DocsAggregateFailure({
          message: `Failed to aggregate docs for ${name}: ${Inspectable.toStringUnknown(cause, 0)}`,
        }),
    });

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
