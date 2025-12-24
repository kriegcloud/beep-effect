/**
 * Workspace dependency extraction.
 *
 * Extracts and categorizes dependencies from package.json files into workspace
 * and npm dependency sets.
 *
 * @since 0.1.0
 */
import * as FileSystem from "@effect/platform/FileSystem";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";
import { FsUtils } from "../FsUtils.js";
import {
  Dependencies as DepsSchema,
  NpmDepTuple,
  PackageJson,
  RepoDepMapValue,
  WorkspaceDepTuple,
} from "../schemas/index.js";

/**
 * Extract typed sets of workspace and npm dependencies from a package.json.
 *
 * - Safely handles missing `dependencies`/`devDependencies` by treating them as empty
 * - Validates the JSON against the PackageJson schema
 * - Splits entries into workspace vs npm dependency sets
 *
 * @param pkgJsonPath Absolute path to a package.json file
 * @returns RepoDepMapValue with `dependencies` and `devDependencies` each containing
 *          a HashSet of workspace names and npm package names
 *
 * @example
 * ```typescript
 * import { extractWorkspaceDependencies } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const deps = yield* extractWorkspaceDependencies("/path/to/package.json")
 *   console.log("Workspace deps:", deps.dependencies.workspace)
 *   console.log("NPM deps:", deps.dependencies.npm)
 * })
 * ```
 *
 * @category Utils/Repo
 * @since 0.1.0
 */
export const extractWorkspaceDependencies = Effect.fn("extractWorkspaceDependencies")(function* (pkgJsonPath: string) {
  const fs = yield* FileSystem.FileSystem;
  const utils = yield* FsUtils;

  // Ensure file exists
  yield* fs.access(pkgJsonPath);

  // Decode JSON and default missing maps to empty objects
  const json = yield* utils.readJson(pkgJsonPath);
  const decoded = yield* S.decode(PackageJson)(json);
  const devMap = decoded.devDependencies ?? {};
  const prodMap = decoded.dependencies ?? {};
  const peerMap = decoded.peerDependencies ?? {};

  const isWorkspaceDep = S.is(WorkspaceDepTuple);
  const isNpmDep = S.is(NpmDepTuple);

  const toDeps = (entries: ReadonlyArray<readonly [string, string]>) =>
    S.decodeSync(DepsSchema)({
      workspace: HashSet.fromIterable(A.map(A.filter(entries, isWorkspaceDep), ([k]) => k)),
      npm: HashSet.fromIterable(A.map(A.filter(entries, isNpmDep), ([k]) => k)),
    });

  const devEntries = Object.entries(devMap) as ReadonlyArray<readonly [string, string]>;
  const prodEntries = Object.entries(prodMap) as ReadonlyArray<readonly [string, string]>;
  const peerEntries = Object.entries(peerMap) as ReadonlyArray<readonly [string, string]>;

  return yield* S.decode(RepoDepMapValue)({
    devDependencies: toDeps(devEntries),
    dependencies: toDeps(prodEntries),
    peerDependencies: toDeps(peerEntries),
  });
});
