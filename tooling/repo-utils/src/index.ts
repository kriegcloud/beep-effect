/**
 * Effect-based monorepo utilities for repository analysis and workspace management.
 *
 * @since 0.0.0
 */

/**
 * @since 0.0.0
 * @category constants
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  NoSuchFileError,
  /**
   * @since 0.0.0
   */
  DomainError,
  /**
   * @since 0.0.0
   */
  CyclicDependencyError,
} from "./errors/index.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  FsUtils,
  /**
   * @since 0.0.0
   */
  FsUtilsLive,
  /**
   * @since 0.0.0
   */
  type FsUtilsShape,
  /**
   * @since 0.0.0
   */
  type GlobOptions,
} from "./FsUtils.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
  /**
   * @since 0.0.0
   */
  getWorkspaceDir,
} from "./Workspaces.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  collectUniqueNpmDependencies,
  /**
   * @since 0.0.0
   */
  type UniqueNpmDeps,
} from "./UniqueDeps.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  PackageJson,
  /**
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @since 0.0.0
   */
  decodePackageJsonEffect,
} from "./schemas/PackageJson.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  type WorkspaceDeps,
  /**
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
} from "./schemas/WorkspaceDeps.js"

/**
 * @since 0.0.0
 */
export {
  /**
   * @since 0.0.0
   */
  topologicalSort,
  /**
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @since 0.0.0
   */
  computeTransitiveClosure,
} from "./Graph.js"
