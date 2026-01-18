import * as pg from "drizzle-orm/pg-core";
import * as Str from "effect/String";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
// =============================================================================
// Custom Types
// =============================================================================

/**
 * Create a pgvector custom type for a specific dimension.
 *
 * @param dimension - Vector dimension (e.g., 512, 768, 1024)
 * @returns Drizzle custom type for pgvector
 *
 * @since 2.0.0
 * @category Custom Types
 */
export const vectorN = (dimension: number) =>
  pg.customType<{ data: ReadonlyArray<number>; driverData: string }>({
    dataType() {
      return `vector(${dimension})`
    },
    toDriver(value: ReadonlyArray<number>): string {
      return `[${value.join(",")}]`
    },
    fromDriver(value: string): ReadonlyArray<number> {
      // Parse "[0.1,0.2,...]" format from PostgreSQL
      const cleaned = Str.replace(/^\[|]$/g, "")(value)
      return pipe(cleaned, Str.split(","), A.map(Number))
    }
  })

/**
 * Custom type for pgvector embedding columns (768-dimensional).
 * Used by Nomic embed text v1.5 (default dimension).
 *
 * @since 2.0.0
 * @category Custom Types
 */
export const vector768 = vectorN(768)

/**
 * Custom type for pgvector embedding columns (512-dimensional).
 * Used by Voyage-3-lite.
 *
 * @since 2.0.0
 * @category Custom Types
 */
export const vector512 = vectorN(512)

/**
 * Custom type for pgvector embedding columns (1024-dimensional).
 * Used by Voyage-3, Voyage-code-3, Voyage-law-2.
 *
 * @since 2.0.0
 * @category Custom Types
 */
export const vector1024 = vectorN(1024)

/**
 * Custom type for pgvector embedding columns (256-dimensional).
 * Used for Matryoshka representation learning (truncated embeddings).
 *
 * @since 2.0.0
 * @category Custom Types
 */
export const vector256 = vectorN(256)