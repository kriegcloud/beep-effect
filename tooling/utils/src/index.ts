/**
 * Tooling utilities public API.
 *
 * Exposes:
 * - FsUtils: Effect-based filesystem/glob helpers
 * - Repo: repository utilities (workspaces, dependencies, tsconfig)
 * - getUniqueDeps: compatibility alias for unique dependency collection
 * - schemas: Effect schemas used by the tooling
 */
export * as FsUtils from "./FsUtils.js";
export { getUniqueDeps } from "./repo/UniqueDependencies.js";
export * as Repo from "./repo.js";
export * from "./schemas/index.js";
