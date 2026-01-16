#!/usr/bin/env node
import { DomainError, findRepoRoot } from "@beep/tooling-utils/repo";
import type { PlatformError } from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import color from "picocolors";

type PackageTarget = {
  readonly workspacePath: string;
  readonly docsFolder: string;
  readonly slug: string;
  readonly navOrder: number;
};

const PACKAGE_TARGETS: Record<string, PackageTarget> = {
  types: {
    workspacePath: "packages/common/types",
    docsFolder: "docs/modules",
    slug: "types",
    navOrder: 1,
  },
  invariant: {
    workspacePath: "packages/common/invariant",
    docsFolder: "docs/modules",
    slug: "invariant",
    navOrder: 2,
  },
  identity: {
    workspacePath: "packages/common/identity",
    docsFolder: "docs/modules",
    slug: "identity",
    navOrder: 3,
  },
  utils: {
    workspacePath: "packages/common/utils",
    docsFolder: "docs/modules",
    slug: "utils",
    navOrder: 4,
  },
  schema: {
    workspacePath: "packages/common/schema",
    docsFolder: "docs/modules",
    slug: "schema",
    navOrder: 5,
  },
  errors: {
    workspacePath: "packages/common/errors",
    docsFolder: "docs/modules",
    slug: "errors",
    navOrder: 6,
  },
};

const program = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const repoRoot = yield* findRepoRoot;

  const requestedSlug = yield* getRequestedSlug();
  const target = PACKAGE_TARGETS[requestedSlug];

  if (!target) {
    return yield* Effect.fail(
      new DomainError({
        message: `Unknown docs target "${requestedSlug}". Supported targets: ${A.join(", ")(Struct.keys(PACKAGE_TARGETS))}`,
        cause: {},
      })
    );
  }

  const packageRoot = path.join(repoRoot, target.workspacePath);
  const docsSource = path.join(packageRoot, target.docsFolder);
  const docsDestination = path.join(repoRoot, "docs", target.slug);
  const packageJsonPath = path.join(packageRoot, "package.json");

  const hasDocs = yield* fs.exists(docsSource);
  if (!hasDocs) {
    return yield* Effect.fail(
      new DomainError({
        message: `Missing generated docs at ${docsSource}. Run docgen first.`,
        cause: {},
      })
    );
  }

  const packageName = yield* readPackageName(fs, packageJsonPath);

  yield* fs.remove(docsDestination, { recursive: true, force: true });
  yield* fs.makeDirectory(docsDestination, { recursive: true });

  yield* Console.log(
    color.cyan(`Copying docgen output for ${packageName} → ${path.relative(repoRoot, docsDestination)}`)
  );
  yield* copyDocsTree(fs, path, docsSource, docsDestination, packageName);
  yield* writeIndexFile(docsDestination, packageName, target);
  yield* Console.log(color.green("Docs copied successfully."));
});

const run = () => BunRuntime.runMain(program.pipe(Effect.provide(BunContext.layer)));

const docsCopyMeta = import.meta as ImportMeta & { readonly main?: boolean | undefined };
if (docsCopyMeta.main ?? true) {
  run();
}

const getRequestedSlug = (): Effect.Effect<string, DomainError> =>
  Effect.gen(function* () {
    const [, , slug] = process.argv;
    if (slug && Str.isNonEmpty(slug)) {
      return slug;
    }
    return yield* new DomainError({
      message: "Docs target argument is required (e.g., `schema`).",
      cause: {},
    });
  });

const readPackageName = (
  fs: FileSystem.FileSystem,
  packageJsonPath: string
): Effect.Effect<string, Error | PlatformError> =>
  Effect.gen(function* () {
    const raw = yield* fs.readFileString(packageJsonPath);
    const parsed = (yield* S.decode(S.parseJson())(raw)) as { readonly name?: string };
    if (!parsed.name) {
      return yield* Effect.fail(
        new DomainError({
          message: `Unable to determine package name from ${packageJsonPath}`,
          cause: parsed,
        })
      );
    }
    return parsed.name;
  });

const copyDocsTree = (
  fs: FileSystem.FileSystem,
  path: Path.Path,
  sourceDir: string,
  destinationDir: string,
  packageName: string
): Effect.Effect<void, PlatformError, never> =>
  Effect.gen(function* () {
    const entries = yield* fs.readDirectory(sourceDir);

    yield* Effect.forEach(
      entries,
      (entry) =>
        Effect.gen(function* () {
          const sourcePath = path.join(sourceDir, entry);
          const destinationPath = path.join(destinationDir, entry);
          const info = yield* fs.stat(sourcePath);

          if (info.type === "Directory") {
            yield* fs.makeDirectory(destinationPath, { recursive: true });
            yield* copyDocsTree(fs, path, sourcePath, destinationPath, packageName);
            return;
          }

          const content = yield* fs.readFileString(sourcePath);
          const rewritten = rewriteParentFrontmatter(content, packageName);
          yield* fs.writeFileString(destinationPath, rewritten);
        }),
      { concurrency: 8, discard: true }
    );
  });

const rewriteParentFrontmatter = (content: string, packageName: string): string =>
  F.pipe(content, Str.replace(/^parent:\s*Modules$/m, `parent: "${packageName}"`));

const writeIndexFile = Effect.fn(function* (docsDestination: string, packageName: string, target: PackageTarget) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const indexContent = `---\ntitle: "${packageName}"\nhas_children: true\npermalink: /docs/${target.slug}\nnav_order: ${target.navOrder}\n---\n`;
  return yield* fs.writeFileString(path.join(docsDestination, "index.md"), indexContent);
});
