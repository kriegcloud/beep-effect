/**
 * Effect-based monorepo utilities for repository analysis and workspace management.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
// cspell:ignore codegraph tsmorph

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
  GlobOptions,
  /**
   * @since 0.0.0
   */
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
export {
  /**
   * @since 0.0.0
   */
  collectUniqueNpmDependencies,
  /**
   * @since 0.0.0
   */
  UniqueNpmDeps,
  /**
   * @since 0.0.0
   */
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
