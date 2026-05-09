/**
 * Shared filesystem metadata helpers for AI metrics source selection.
 *
 * @since 0.0.0
 */

import type { FileSystem } from "effect";

/**
 * Convert Effect filesystem file sizes into plain numeric byte counts for JSON-safe metrics.
 *
 * @category utilities
 * @since 0.0.0
 */
export const fileSizeBytes = (info: FileSystem.File.Info): number => globalThis.Number(info.size);
