/**
 * Effect-based monorepo utilities for repository analysis and workspace management.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
// cspell:ignore codegraph tsmorph
// biome-ignore-all assist/source/organizeImports: docgen requires individually documented re-export declarations.

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
  /**
   * @since 0.0.0
   */
  DomainError,
  /**
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./errors/index.js";
/**
 * Filesystem utility service tag.
 *
 * @example
 * ```ts
 * import { FsUtils } from "@beep/repo-utils"
 *
 * void FsUtils
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export { FsUtils } from "./FsUtils.js";
/**
 * Live layer for the filesystem utility service.
 *
 * @example
 * ```ts
 * import { FsUtilsLive } from "@beep/repo-utils"
 *
 * void FsUtilsLive
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export { FsUtilsLive } from "./FsUtils.js";
/**
 * Service shape implemented by `FsUtils` providers.
 *
 * @example
 * ```ts
 * import type { FsUtilsShape } from "@beep/repo-utils"
 *
 * const key = "readJson" satisfies keyof FsUtilsShape
 * void key
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type { FsUtilsShape } from "./FsUtils.js";
/**
 * Options accepted by filesystem glob helpers.
 *
 * @example
 * ```ts
 * import { GlobOptions } from "@beep/repo-utils"
 *
 * const options = new GlobOptions({ cwd: "src" })
 * void options.cwd
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export { GlobOptions } from "./FsUtils.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  computeTransitiveClosure,
  /**
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @since 0.0.0
   */
  topologicalSort,
} from "./Graph.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  jsonParse,
  /**
   * @since 0.0.0
   */
  jsonStringifyCompact,
  /**
   * @since 0.0.0
   */
  jsonStringifyPretty,
} from "./JsonUtils.js";
/**
 * @since 0.0.0
 */
export * from "./Reuse/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @since 0.0.0
   */
  decodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @since 0.0.0
   */
  encodePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonPrettyEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonToJsonEffect,
  /**
   * @since 0.0.0
   */
  NpmPackageJson,
  /**
   * @since 0.0.0
   */
  PackageJson,
} from "./schemas/PackageJson.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  applyPackageJsonPatchEffect,
  /**
   * @since 0.0.0
   */
  diffPackageJsonEffect,
  /**
   * @since 0.0.0
   */
  encodePackageJsonCanonicalPrettyEffect,
  /**
   * @since 0.0.0
   */
  getPackageJsonSchemaIssues,
  /**
   * @since 0.0.0
   */
  normalizePackageJsonEffect,
  /**
   * @since 0.0.0
   */
  npmPackageJsonJsonSchema,
  /**
   * @since 0.0.0
   */
  PackageJsonValidationIssue,
  /**
   * @since 0.0.0
   */
  packageJsonJsonSchema,
} from "./schemas/PackageJsonTools.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  decodeTSConfig,
  /**
   * @since 0.0.0
   */
  decodeTSConfigEffect,
  /**
   * @since 0.0.0
   */
  decodeTSConfigExit,
  /**
   * @since 0.0.0
   */
  decodeTSConfigFromJsoncTextEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigPrettyEffect,
  /**
   * @since 0.0.0
   */
  encodeTSConfigToJsonEffect,
  /**
   * @since 0.0.0
   */
  TSConfig,
  /**
   * @since 0.0.0
   */
  TSConfigBuildOptions,
  /**
   * @since 0.0.0
   */
  TSConfigCompilerOptions,
  /**
   * @since 0.0.0
   */
  TSConfigReference,
  /**
   * @since 0.0.0
   */
  TSConfigTypeAcquisition,
  /**
   * @since 0.0.0
   */
  TSConfigWatchOptions,
  /**
   * @since 0.0.0
   */
  TSNodeConfig,
} from "./schemas/TSConfig.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
  /**
   * @since 0.0.0
   */
  WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";
/**
 * @since 0.0.0
 */
export * from "./TSMorph/index.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";
/**
 * @since 0.0.0
 */
export * from "./TypeScript/index.js";
/**
 * Collect unique NPM dependency names from the workspace graph.
 *
 * @example
 * ```ts
 * import { collectUniqueNpmDependencies } from "@beep/repo-utils"
 *
 * void collectUniqueNpmDependencies
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export { collectUniqueNpmDependencies } from "./UniqueDeps.js";
/**
 * Result model for unique NPM dependency aggregation.
 *
 * @example
 * ```ts
 * import { UniqueNpmDeps } from "@beep/repo-utils"
 *
 * const deps = new UniqueNpmDeps({
 *   dependencies: ["effect"],
 *   devDependencies: ["vitest"]
 * })
 * void deps
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export { UniqueNpmDeps } from "./UniqueDeps.js";
/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  getWorkspaceDir,
  /**
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
} from "./Workspaces.js";
// bench
