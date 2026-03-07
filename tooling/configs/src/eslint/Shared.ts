import { normalizePath as normalizeSchemaPath, PosixPath as PosixPathSchema } from "@beep/schema";

/**
 * POSIX-normalized path string schema re-exported for tooling config consumers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PosixPath = PosixPathSchema;

/**
 * Type for {@link PosixPath}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PosixPath = typeof PosixPath.Type;

/**
 * Normalize a file-system path to POSIX separators.
 *
 * @param value - Input path string that may contain native separators.
 * @returns Path string normalized to POSIX separators.
 * @since 0.0.0
 * @category Utility
 */
export const normalizePath = (value: string): PosixPath => normalizeSchemaPath(value);
