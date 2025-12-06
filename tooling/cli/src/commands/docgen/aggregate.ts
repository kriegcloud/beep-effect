/**
 * @file Docgen Aggregate Command
 *
 * Aggregates all generated documentation to a central ./docs folder.
 * Copies and transforms markdown files, rewrites frontmatter, and generates
 * navigation structure.
 *
 * Behavior:
 * 1. Discover packages with generated docs/modules/ directories
 * 2. For each package:
 *    - Read package.json for package name
 *    - Copy markdown files to docs/{slug}/
 *    - Rewrite `parent: Modules` to `parent: "{packageName}"`
 *    - Generate index.md with nav_order
 * 3. Generate root docs/index.md with links to all packages
 *
 * Options:
 * - --clean: Remove existing docs/ before aggregating
 * - --package, -p <path>: Aggregate specific package only
 *
 * Exit Codes:
 * - 0: Success
 * - 1: Invalid input (package not found)
 * - 3: Execution error (file operations failed)
 * - 4: Partial failure (some packages failed)
 *
 * Output Structure:
 * ```
 * docs/
 * +-- index.md                 # Main navigation
 * +-- identity/
 * |   +-- index.md             # Package index (nav_order: 1)
 * |   +-- BeepId.ts.md
 * +-- schema/
 * |   +-- index.md             # Package index (nav_order: 2)
 * |   +-- EntityId.ts.md
 * +-- ...
 * ```
 *
 * @module docgen/aggregate
 * @see DOCGEN_CLI_IMPLEMENTATION.md#4-beep-docgen-aggregate
 */

import type { FsUtils } from "@beep/tooling-utils";
import { findRepoRoot } from "@beep/tooling-utils/repo";
import * as CliCommand from "@effect/cli/Command";
import * as CliOptions from "@effect/cli/Options";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { discoverPackagesWithDocs, resolvePackagePath } from "./shared/discovery.js";
import { blank, error, formatPath, header, info, success, symbols, warning } from "./shared/output.js";
import type { PackageInfo } from "./types.js";
import { ExitCode } from "./types.js";

// Options
const cleanOption = CliOptions.boolean("clean").pipe(
  CliOptions.withDefault(false),
  CliOptions.withDescription("Remove existing docs/ before aggregating")
);

const packageOption = CliOptions.optional(CliOptions.text("package")).pipe(
  CliOptions.withAlias("p"),
  CliOptions.withDescription("Aggregate specific package only")
);

/**
 * Create a URL-safe slug from a package name.
 */
const createSlug = (name: string): string =>
  F.pipe(name, Str.replace("@beep/", Str.empty), Str.replace("/", "-"), Str.replace(" ", "-"), Str.toLowerCase);

/**
 * Generate package index.md content.
 */
const generatePackageIndex = (name: string, _slug: string, navOrder: number): string =>
  F.pipe(
    [
      "---",
      `title: ${name}`,
      `nav_order: ${navOrder}`,
      "has_children: true",
      "---",
      Str.empty,
      `# ${name}`,
      Str.empty,
      `Documentation for ${name}.`,
      Str.empty,
    ],
    A.join("\n")
  );

/**
 * Generate root docs index.md content.
 */
const generateRootIndex = (packages: ReadonlyArray<{ readonly name: string; readonly slug: string }>): string =>
  F.pipe(
    [
      "---",
      "title: Home",
      "nav_order: 1",
      "---",
      Str.empty,
      "# beep-effect Documentation",
      Str.empty,
      "## Packages",
      Str.empty,
      ...F.pipe(
        packages,
        A.map((p) => `- [${p.name}](./${p.slug}/)`)
      ),
      Str.empty,
    ],
    A.join("\n")
  );

/**
 * Aggregate a single package's documentation.
 */
const aggregatePackage = (
  pkg: PackageInfo,
  repoRoot: string,
  navOrder: number
): Effect.Effect<{ readonly slug: string; readonly fileCount: number }, never, FileSystem.FileSystem | Path.Path> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    const slug = createSlug(pkg.name);
    const srcDir = path.join(pkg.absolutePath, "docs", "modules");
    const destDir = path.join(repoRoot, "docs", slug);

    // Create destination directory
    yield* fs.makeDirectory(destDir, { recursive: true }).pipe(Effect.catchAll(() => Effect.void));

    // Read source files
    const files = yield* fs.readDirectory(srcDir).pipe(Effect.catchAll(() => Effect.succeed(A.empty() as string[])));

    const mdFiles = F.pipe(
      files,
      A.filter((f) => F.pipe(f, Str.endsWith(".md")))
    );

    // Copy and transform each markdown file
    yield* Effect.forEach(
      mdFiles,
      (file) =>
        Effect.gen(function* () {
          const srcPath = path.join(srcDir, file);
          const destPath = path.join(destDir, file);

          const content = yield* fs.readFileString(srcPath).pipe(Effect.catchAll(() => Effect.succeed(Str.empty)));

          // Rewrite frontmatter: parent: Modules -> parent: "{slug}"
          const transformed = F.pipe(content, Str.replace("parent: Modules", `parent: "${slug}"`));

          yield* fs.writeFileString(destPath, transformed).pipe(Effect.catchAll(() => Effect.void));
        }),
      { discard: true }
    );

    // Generate package index.md
    const indexContent = generatePackageIndex(pkg.name, slug, navOrder);
    yield* fs.writeFileString(path.join(destDir, "index.md"), indexContent).pipe(Effect.catchAll(() => Effect.void));

    return { slug, fileCount: A.length(mdFiles) };
  });

/**
 * Handle the aggregate command.
 */
const handleAggregate = (args: {
  readonly clean: boolean;
  readonly package: string | undefined;
}): Effect.Effect<void, never, FileSystem.FileSystem | Path.Path | FsUtils.FsUtils> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;

    // Get repo root
    const repoRoot = yield* findRepoRoot.pipe(Effect.catchAll(() => Effect.succeed(process.cwd())));
    const docsPath = path.join(repoRoot, "docs");

    // Handle --clean flag
    if (args.clean) {
      const exists = yield* fs.exists(docsPath).pipe(Effect.orElseSucceed(F.constFalse));
      if (exists) {
        yield* fs.remove(docsPath, { recursive: true }).pipe(Effect.catchAll(() => Effect.void));
        yield* info("Cleaned existing docs/ directory");
      }
    }

    // Resolve target packages
    let packages: ReadonlyArray<PackageInfo>;

    if (args.package !== undefined) {
      // Single package mode
      const pkgInfo = yield* resolvePackagePath(args.package).pipe(
        Effect.catchAll((e) =>
          Effect.gen(function* () {
            yield* error(
              `Invalid package path: ${e.path} - ${e._tag === "InvalidPackagePathError" ? e.reason : (e.message ?? "not found")}`
            );
            return yield* Effect.fail(ExitCode.InvalidInput);
          })
        )
      );

      if (!pkgInfo.hasGeneratedDocs) {
        yield* error(
          `Package ${pkgInfo.name} has no generated docs. Run: beep docgen generate -p ${pkgInfo.relativePath}`
        );
        return yield* Effect.fail(ExitCode.InvalidInput);
      }

      packages = [pkgInfo];
    } else {
      // All packages with generated docs
      packages = yield* discoverPackagesWithDocs;
    }

    if (A.isEmptyArray([...packages])) {
      yield* warning("No packages with generated docs found");
      yield* info("Run 'beep docgen generate' to generate documentation first");
      return;
    }

    yield* info(`Aggregating documentation for ${A.length(packages)} package(s)...`);
    yield* blank();

    // Ensure docs directory exists
    yield* fs.makeDirectory(docsPath, { recursive: true }).pipe(Effect.catchAll(() => Effect.void));

    // Aggregate each package
    // Create index array for nav_order (starts at 2, 1 is reserved for root)
    const packagesArray = [...packages];
    const packagesWithNavOrder = F.pipe(
      packagesArray,
      A.map((pkg, idx) => ({ pkg, navOrder: idx + 2 }))
    );

    const results = yield* Effect.forEach(
      packagesWithNavOrder,
      ({ pkg, navOrder }) => aggregatePackage(pkg, repoRoot, navOrder),
      { concurrency: 4 }
    );

    // Generate root index.md
    const packageLinks = F.pipe(
      results,
      A.zip(packagesArray),
      A.map(([result, pkg]) => ({ name: pkg.name, slug: result.slug }))
    );

    const rootIndexContent = generateRootIndex(packageLinks);
    yield* fs
      .writeFileString(path.join(docsPath, "index.md"), rootIndexContent)
      .pipe(Effect.catchAll(() => Effect.void));

    // Report results
    yield* header("Aggregation Complete");

    yield* Effect.forEach(results, (r) => Console.log(`  ${symbols.success} ${r.slug} (${r.fileCount} files)`), {
      discard: true,
    });

    yield* blank();
    yield* success(`Aggregated ${A.length(results)} packages to ${formatPath("docs/")}`);
  }).pipe(
    Effect.catchAll((exitCode) =>
      Effect.gen(function* () {
        if (typeof exitCode === "number") {
          yield* Effect.sync(() => {
            process.exitCode = exitCode;
          });
        }
      })
    )
  );

export const aggregateCommand = CliCommand.make("aggregate", { clean: cleanOption, package: packageOption }, (args) =>
  handleAggregate({
    clean: args.clean,
    package: O.getOrUndefined(args.package),
  })
).pipe(CliCommand.withDescription("Aggregate all docs to central ./docs folder"));
