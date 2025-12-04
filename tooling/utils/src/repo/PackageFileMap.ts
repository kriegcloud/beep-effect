import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as HashSet from "effect/HashSet";
import { FsUtils } from "../FsUtils.js";
import { DomainError } from "./Errors.js";
import { resolveWorkspaceDirs } from "./Workspaces.js";

const IGNORE = ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.turbo/**"] as const;

/**
 * Build a map of workspace package name -> HashSet of .ts/.tsx source files.
 *
 * For each workspace, scans the `src` directory for TypeScript files and
 * collects them into a HashSet. Workspaces without a `src` directory are
 * included with an empty HashSet.
 *
 * @example
 * ```ts
 * import { mapWorkspaceToSourceFiles } from "@beep/tooling-utils/repo/PackageFileMap";
 * import { Effect, HashMap, HashSet } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const packageFileMap = yield* mapWorkspaceToSourceFiles;
 *   const files = HashMap.get(packageFileMap, "@beep/tooling-utils");
 *   // files: Option<HashSet<string>>
 * });
 * ```
 */
export const mapWorkspaceToSourceFiles: Effect.Effect<
  HashMap.HashMap<string, HashSet.HashSet<string>>,
  DomainError,
  Path.Path | FsUtils | FileSystem.FileSystem
> = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path_ = yield* Path.Path;
  const utils = yield* FsUtils;
  const workspaceMap = yield* resolveWorkspaceDirs;

  let packageFileMap = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [workspace, dir] of HashMap.entries(workspaceMap)) {
    const srcDir = path_.join(dir, "src");
    const srcExists = yield* fs.exists(srcDir);

    if (!srcExists) {
      // No src directory - include with empty set
      packageFileMap = HashMap.set(packageFileMap, workspace, HashSet.empty<string>());
      continue;
    }

    // Glob for .ts and .tsx files in src directory
    const files = yield* utils.globFiles(["**/*.ts", "**/*.tsx"], {
      cwd: srcDir,
      absolute: true,
      ignore: IGNORE as unknown as string[],
    });

    packageFileMap = HashMap.set(packageFileMap, workspace, HashSet.fromIterable(files));
  }

  return packageFileMap;
}).pipe(Effect.mapError(DomainError.selfOrMap));

/**
 * Transform an absolute file path to a package-relative import path.
 *
 * Strips everything up to and including `/src/`, removes the file extension,
 * and prepends the package name.
 *
 * @example
 * ```ts
 * toImportPath("@beep/tooling-utils", "/home/user/projects/beep/tooling/utils/src/repo/Errors.ts")
 * // => "@beep/tooling-utils/repo/Errors"
 * ```
 */
const toImportPath = (packageName: string, absolutePath: string): string => {
  const srcIndex = absolutePath.indexOf("/src/");
  if (srcIndex === -1) {
    return absolutePath;
  }
  const relativePath = absolutePath.slice(srcIndex + 5); // +5 to skip "/src/"
  const withoutExtension = relativePath.replace(/\.(tsx?|jsx?)$/, "");
  return `${packageName}/${withoutExtension}`;
};

/**
 * Build a map of workspace package name -> HashSet of import-style paths.
 *
 * Similar to {@link mapWorkspaceToSourceFiles} but transforms absolute file
 * paths into package-relative import paths.
 *
 * For example:
 * - `/home/user/projects/beep/tooling/utils/src/types.ts`
 * - becomes `@beep/tooling-utils/types`
 *
 * @example
 * ```ts
 * import { mapWorkspaceToImportPaths } from "@beep/tooling-utils/repo/PackageFileMap";
 * import { Effect, HashMap, HashSet, Option } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const packageFileMap = yield* mapWorkspaceToImportPaths;
 *   const imports = HashMap.get(packageFileMap, "@beep/tooling-utils");
 *   // imports: Option<HashSet<string>> containing "@beep/tooling-utils/types", etc.
 * });
 * ```
 */
export const mapWorkspaceToImportPaths: Effect.Effect<
  HashMap.HashMap<string, HashSet.HashSet<string>>,
  DomainError,
  Path.Path | FsUtils | FileSystem.FileSystem
> = Effect.gen(function* () {
  const sourceFileMap = yield* mapWorkspaceToSourceFiles;

  let importPathMap = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [packageName, files] of HashMap.entries(sourceFileMap)) {
    const importPaths = HashSet.map(files, (file) => toImportPath(packageName, file));
    importPathMap = HashMap.set(importPathMap, packageName, importPaths);
  }

  return importPathMap;
});

/**
 * Transform an absolute file path to a relative path from src.
 *
 * Strips everything up to and including `/src/` and removes the file extension.
 *
 * @example
 * ```ts
 * toRelativePath("/home/user/projects/beep/tooling/utils/src/repo/Errors.ts")
 * // => "repo/Errors"
 * ```
 */
const toRelativePath = (absolutePath: string): string => {
  const srcIndex = absolutePath.indexOf("/src/");
  if (srcIndex === -1) {
    return absolutePath;
  }
  const relativePath = absolutePath.slice(srcIndex + 5); // +5 to skip "/src/"
  return relativePath.replace(/\.(tsx?|jsx?)$/, "");
};

/**
 * Build a map of workspace package name -> HashSet of relative paths from src.
 *
 * Similar to {@link mapWorkspaceToSourceFiles} but transforms absolute file
 * paths into relative paths from the src directory (without package name prefix).
 *
 * For example:
 * - `/home/user/projects/beep/tooling/utils/src/types.ts` becomes `types`
 * - `/home/user/projects/beep/tooling/utils/src/repo/Errors.ts` becomes `repo/Errors`
 *
 * @example
 * ```ts
 * import { mapWorkspaceToRelativePaths } from "@beep/tooling-utils/repo/PackageFileMap";
 * import { Effect, HashMap, HashSet, Option } from "effect";
 *
 * const program = Effect.gen(function* () {
 *   const packageFileMap = yield* mapWorkspaceToRelativePaths;
 *   const paths = HashMap.get(packageFileMap, "@beep/tooling-utils");
 *   // paths: Option<HashSet<string>> containing "types", "repo/Errors", etc.
 * });
 * ```
 */
export const mapWorkspaceToRelativePaths: Effect.Effect<
  HashMap.HashMap<string, HashSet.HashSet<string>>,
  DomainError,
  Path.Path | FsUtils | FileSystem.FileSystem
> = Effect.gen(function* () {
  const sourceFileMap = yield* mapWorkspaceToSourceFiles;

  let relativePathMap = HashMap.empty<string, HashSet.HashSet<string>>();

  for (const [packageName, files] of HashMap.entries(sourceFileMap)) {
    const relativePaths = HashSet.map(files, toRelativePath);
    relativePathMap = HashMap.set(relativePathMap, packageName, relativePaths);
  }

  return relativePathMap;
});
