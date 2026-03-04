/**
 * Docs aggregation command implementation.
 *
 * @since 0.0.0
 * @module
 */

import * as Fs from "node:fs";
import * as Path from "node:path";
import { $RepoCliId } from "@beep/identity/packages";
import { Console, Effect, HashSet, MutableHashSet, Order, String as Str } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { Command } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/DocsAggregate");
const PACKAGE_ROOTS = ["packages", "tooling", "apps"] as const;
const IGNORED_DIRS = HashSet.fromIterable([".git", ".turbo", "node_modules", "dist", "build"]);

type DocsPackage = {
  readonly packageDir: string;
  readonly outputPath: string;
};

class DocsAggregateFailure extends S.TaggedErrorClass<DocsAggregateFailure>($I`DocsAggregateFailure`)(
  "DocsAggregateFailure",
  {
    message: S.String,
  },
  $I.annote("DocsAggregateFailure", {
    description: "Docs aggregation operation failed.",
  })
) {}

const walkRoot = (root: string): Array<DocsPackage> => {
  const packages = [] as Array<DocsPackage>;

  if (!Fs.existsSync(root)) {
    return packages;
  }

  const walk = (relativePath: string): void => {
    const packageDir = relativePath.length > 0 ? Path.join(root, relativePath) : root;

    if (Fs.existsSync(Path.join(packageDir, "docs/modules"))) {
      packages.push({
        packageDir,
        outputPath: relativePath,
      });
      return;
    }

    const children = Fs.readdirSync(packageDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !HashSet.has(IGNORED_DIRS, entry.name))
      .map((entry) => entry.name)
      .sort();

    for (const child of children) {
      walk(relativePath.length > 0 ? Path.join(relativePath, child) : child);
    }
  };

  walk("");
  return packages;
};

const findPackages = (): Array<DocsPackage> => {
  const packages = A.sort(
    PACKAGE_ROOTS.flatMap(walkRoot),
    Order.mapInput(Order.String, (pkg: DocsPackage) => pkg.outputPath)
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
    throw new DocsAggregateFailure({
      message: `Duplicate docs output paths detected: ${Array.from(duplicateOutputPaths).join(", ")}`,
    });
  }

  return packages;
};

const pkgName = (pkg: DocsPackage): string => {
  const packageJson = Fs.readFileSync(Path.join(pkg.packageDir, "package.json"));
  const decoded = JSON.parse(packageJson.toString("utf8")) as { name?: string };
  return decoded.name ?? pkg.outputPath;
};

const copyFiles = (pkg: DocsPackage): void => {
  const name = pkgName(pkg);
  const docs = Path.join(pkg.packageDir, "docs/modules");
  const dest = Path.join("docs", pkg.outputPath);
  const files = Fs.readdirSync(docs, { withFileTypes: true });

  const handleFiles = (root: string, entries: ReadonlyArray<Fs.Dirent>): void => {
    for (const file of entries) {
      const sourcePath = Path.join(docs, root, file.name);
      const destPath = Path.join(dest, root, file.name);

      if (file.isDirectory()) {
        Fs.mkdirSync(destPath, { recursive: true });
        handleFiles(Path.join(root, file.name), Fs.readdirSync(sourcePath, { withFileTypes: true }));
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

const generateIndex = (outputPath: string, name: string, order: number): void => {
  const permalink = Str.replace(/\\/g, "/")(outputPath);
  const content = `---
title: "${name}"
has_children: true
permalink: /docs/${permalink}
nav_order: ${String(order)}
---
`;

  Fs.writeFileSync(Path.join("docs", outputPath, "index.md"), content);
};

const aggregateDocs = Effect.fn(function* () {
  const packages = yield* Effect.try({
    try: findPackages,
    catch: (cause) =>
      new DocsAggregateFailure({
        message: `Failed to discover docs packages: ${String(cause)}`,
      }),
  });

  for (let index = 0; index < A.length(packages); index += 1) {
    const pkg = packages[index];
    if (pkg === undefined) {
      continue;
    }

    const name = yield* Effect.try({
      try: () => pkgName(pkg),
      catch: (cause) =>
        new DocsAggregateFailure({
          message: `Failed reading package name for ${pkg.packageDir}: ${String(cause)}`,
        }),
    });

    yield* Effect.try({
      try: () => {
        Fs.rmSync(Path.join("docs", pkg.outputPath), { recursive: true, force: true });
        Fs.mkdirSync(Path.join("docs", pkg.outputPath), { recursive: true });
        copyFiles(pkg);
        generateIndex(pkg.outputPath, name, index + 2);
      },
      catch: (cause) =>
        new DocsAggregateFailure({
          message: `Failed to aggregate docs for ${name}: ${String(cause)}`,
        }),
    });

    yield* Console.log(`✅ Processed docs for ${name}`);
  }

  yield* Console.log("");
  yield* Console.log(`✅ Aggregated docs from ${String(A.length(packages))} packages`);
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
