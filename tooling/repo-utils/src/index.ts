/**
 * Effect-based monorepo utilities for repository analysis and workspace management.
 *
 * @since 0.0.0
 * @packageDocumentation
 */
// cspell:ignore codegraph tsmorph

/**
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

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
} from "./FsUtils.js";
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
  PackageJson,
} from "./schemas/PackageJson.js";
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
  type WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";
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
export {
  /**
   * @since 0.0.0
   */
  collectUniqueNpmDependencies,
  /**
   * @since 0.0.0
   */
  type UniqueNpmDeps,
} from "./UniqueDeps.js";
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
