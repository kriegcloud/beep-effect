import * as pg from "drizzle-orm/pg-core";
import * as Str from "effect/String";
// =============================================================================
// Custom Types
// =============================================================================

/**
 * Create a pgvector custom type for a specific dimension.
 *
 * @param dimension - Vector dimension (e.g., 512, 768, 1024)
 * @returns Drizzle custom type for pgvector
 *
 * @since 0.1.0
 * @category Custom Types
 */
export const vectorN = (dimension: number) =>
  // Note: we intentionally expose pgvector values as their literal string form ("[0.1,0.2,...]").
  // Runtime code decodes/encodes via Effect Schema at the boundary, and the DB driver expects the literal.
  pg.customType<{ data: string; driverData: string }>({
    dataType() {
      return `vector(${dimension})`;
    },
    toDriver(value: string): string {
      const trimmed = value.trim();
      if (!trimmed.startsWith("[") || !trimmed.endsWith("]")) {
        throw new Error(`Invalid pgvector literal for vector(${dimension}): expected "[...]", got "${value}"`);
      }
      return trimmed;
    },
    fromDriver(value: string): string {
      return Str.trim(value);
    },
  });

/**
 * Custom type for pgvector embedding columns (768-dimensional).
 * Used by Nomic embed text v1.5 (default dimension).
 *
 * @since 0.1.0
 * @category Custom Types
 */
export const vector768 = vectorN(768);

/**
 * Custom type for pgvector embedding columns (512-dimensional).
 * Used by Voyage-3-lite.
 *
 * @since 0.1.0
 * @category Custom Types
 */
export const vector512 = vectorN(512);

/**
 * Custom type for pgvector embedding columns (1024-dimensional).
 * Used by Voyage-3, Voyage-code-3, Voyage-law-2.
 *
 * @since 0.1.0
 * @category Custom Types
 */
export const vector1024 = vectorN(1024);

/**
 * Custom type for pgvector embedding columns (256-dimensional).
 * Used for Matryoshka representation learning (truncated embeddings).
 *
 * @since 0.1.0
 * @category Custom Types
 */
export const vector256 = vectorN(256);
