/**
 * Shared ESLint helper schemas and path utilities.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { normalizePath as normalizeSchemaPath, PosixPath as PosixPathSchema } from "@beep/schema";

/**
 * POSIX-normalized path string schema re-exported for tooling config consumers.
 *
 * @example
 * ```ts
 * import { PosixPath } from "@beep/repo-configs/eslint/Shared"
 * void PosixPath
 * ```
 * @category validation
 * @since 0.0.0
 */
export const PosixPath = PosixPathSchema;

/**
 * Type for {@link PosixPath}.
 *
 * @example
 * ```ts
 * import type { PosixPath } from "@beep/repo-configs/eslint/Shared"
 * type ExamplePath = PosixPath
 * ```
 * @category models
 * @since 0.0.0
 */
export type PosixPath = typeof PosixPath.Type;

/**
 * Normalize a file-system path to POSIX separators.
 *
 * @param value - Input path string that may contain native separators.
 * @returns Path string normalized to POSIX separators.
 * @example
 * ```ts
 * import { normalizePath } from "@beep/repo-configs/eslint/Shared"
 * const path = normalizePath("tooling/configs/src/index.ts")
 * void path
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const normalizePath = (value: string): PosixPath => normalizeSchemaPath(value);
