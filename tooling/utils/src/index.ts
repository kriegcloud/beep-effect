/**
 * Tooling utilities public API.
 *
 * Exposes:
 * - FsUtils: Effect-based filesystem/glob helpers
 * - Repo: repository utilities (workspaces, dependencies, tsconfig)
 * - getUniqueDeps: compatibility alias for unique dependency collection
 * - schemas: Effect schemas used by the tooling
 */
export * as FsUtils from "@beep/tooling-utils/FsUtils.js";
export * as Repo from "@beep/tooling-utils/repo/index.js";
export { getUniqueDeps } from "@beep/tooling-utils/repo/UniqueDependencies.js";
export * from "@beep/tooling-utils/schemas/index.js";
