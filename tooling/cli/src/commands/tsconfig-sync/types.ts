/**
 * @file tsconfig-sync Shared Types
 *
 * Defines shared types used across tsconfig-sync modules.
 * This file has no imports from other tsconfig-sync modules to avoid circular dependencies.
 *
 * @module tsconfig-sync/types
 * @since 0.1.0
 */

import type { RepoDepMapValue, WorkspacePkgKey } from "@beep/tooling-utils";
import type * as A from "effect/Array";
import type * as HashMap from "effect/HashMap";
import type * as HashSet from "effect/HashSet";
import type * as S from "effect/Schema";

// ─────────────────────────────────────────────────────────────────────────────
// Type Aliases
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Workspace package key type from tooling-utils.
 *
 * @since 0.1.0
 * @category models
 */
export type WorkspacePkgKeyT = S.Schema.Type<typeof WorkspacePkgKey>;

/**
 * Repository dependency map value type from tooling-utils.
 *
 * @since 0.1.0
 * @category models
 */
export type RepoDepMapValueT = S.Schema.Type<typeof RepoDepMapValue>;

// ─────────────────────────────────────────────────────────────────────────────
// Workspace Context
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared context containing workspace discovery results.
 * Passed to sync functions to avoid repeated computation.
 *
 * @since 0.1.0
 * @category models
 */
export interface WorkspaceContext {
  /** Dependency index mapping package names to their dependencies */
  readonly depIndex: HashMap.HashMap<WorkspacePkgKeyT, RepoDepMapValueT>;
  /** Adjacency list for graph operations (package -> dependencies) */
  readonly adjacencyList: HashMap.HashMap<string, HashSet.HashSet<string>>;
  /** Tsconfig paths for each package */
  readonly tsconfigPaths: HashMap.HashMap<string, A.NonEmptyReadonlyArray<string>>;
  /** Map from package name to its directory path (relative to repo root) */
  readonly pkgDirMap: HashMap.HashMap<string, string>;
  /** Absolute path to the repository root */
  readonly repoRoot: string;
  /** Set of all workspace package names */
  readonly workspacePackages: HashSet.HashSet<string>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Options
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options passed to sync functions.
 *
 * @since 0.1.0
 * @category models
 */
export interface SyncOptions {
  /** Whether to show verbose output */
  readonly verbose: boolean;
  /** Whether to skip transitive dependency hoisting */
  readonly noHoist: boolean;
  /** Optional package filter */
  readonly filter?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sync Results
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of syncing a single package's tsconfig files.
 *
 * @since 0.1.0
 * @category models
 */
export interface TsconfigSyncResult {
  /** Whether any tsconfig files were updated */
  readonly hasChanges: boolean;
  /** Number of build config changes */
  readonly buildChanges: number;
  /** Number of src config changes */
  readonly srcChanges: number;
  /** Number of test config changes */
  readonly testChanges: number;
}

/**
 * Result of syncing a single package's package.json.
 *
 * @since 0.1.0
 * @category models
 */
export interface PackageJsonSyncResult {
  /** Whether package.json was updated */
  readonly hasChanges: boolean;
  /** Whether dependencies were reordered */
  readonly depsReordered: boolean;
  /** Whether devDependencies were reordered */
  readonly devDepsReordered: boolean;
  /** Whether peerDependencies were reordered */
  readonly peerDepsReordered: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Known Next.js apps in the repository.
 *
 * @since 0.1.0
 * @category constants
 */
export const NEXT_JS_APPS = ["web", "todox", "marketing"] as const;

/**
 * Type for Next.js app names.
 *
 * @since 0.1.0
 * @category models
 */
export type NextJsAppName = (typeof NEXT_JS_APPS)[number];

/**
 * Tooling packages that should be excluded from app tsconfig paths/references.
 * These are dev-only packages that apps don't need IDE intellisense for.
 * Exception: @beep/testkit is allowed as apps may have tests.
 *
 * @since 0.1.0
 * @category constants
 */
export const TOOLING_PACKAGES_TO_EXCLUDE = [
  "@beep/build-utils",
  "@beep/repo-cli",
  "@beep/tooling-utils",
  "@beep/repo-scripts",
] as const;

/**
 * Check if a package is a tooling package that should be excluded from app configs.
 *
 * @since 0.1.0
 * @category utils
 */
export const isToolingPackage = (pkgName: string): boolean =>
  (TOOLING_PACKAGES_TO_EXCLUDE as readonly string[]).includes(pkgName);

// ─────────────────────────────────────────────────────────────────────────────
// Config Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tsconfig type identifier.
 *
 * @since 0.1.0
 * @category models
 */
export type TsconfigType = "build" | "src" | "test";

/**
 * Config type descriptor for iteration.
 *
 * @since 0.1.0
 * @category models
 */
export interface ConfigTypeDescriptor {
  readonly type: TsconfigType;
  readonly file: string;
}

/**
 * Standard config types to process for each package.
 *
 * @since 0.1.0
 * @category constants
 */
export const CONFIG_TYPES: readonly ConfigTypeDescriptor[] = [
  { type: "build", file: "tsconfig.build.json" },
  { type: "src", file: "tsconfig.src.json" },
  { type: "test", file: "tsconfig.test.json" },
] as const;
