import { customType } from "drizzle-orm/pg-core";
import * as Encoding from "effect/Encoding";
import * as Either from "effect/Either";

/**
 * Custom Drizzle column type for PostgreSQL's `bytea` (binary data).
 *
 * This column stores raw binary data in the database and handles
 * conversion between `Uint8Array` (application) and PostgreSQL's
 * bytea format (database).
 *
 * Benefits over storing Base64 in a text column:
 * - ~33% storage savings (no Base64 encoding overhead)
 * - No encoding/decoding overhead on every read/write
 * - Native binary operations in PostgreSQL
 *
 * @example
 * ```ts
 * import { bytea } from "@beep/shared-tables";
 *
 * export const myTable = pgTable("my_table", {
 *   binaryData: bytea("binary_data"),
 * });
 * ```
 */
export const bytea = customType<{ data: Uint8Array; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: Uint8Array): Buffer {
    return Buffer.from(value);
  },
  fromDriver(value: Buffer): Uint8Array {
    return new Uint8Array(value);
  },
});

/**
 * Custom Drizzle column type for PostgreSQL's `bytea` with Base64 string interface.
 *
 * This column stores raw binary data in the database but accepts/returns
 * Base64-encoded strings in the application layer. Useful when working with
 * APIs that expect Base64 strings.
 *
 * Uses Effect's Encoding module for Base64 encoding/decoding.
 *
 * @example
 * ```ts
 * import { byteaBase64 } from "@beep/shared-tables";
 *
 * export const myTable = pgTable("my_table", {
 *   snapshot: byteaBase64("snapshot"),
 * });
 *
 * // Insert with Base64 string
 * await db.insert(myTable).values({ snapshot: "SGVsbG8gV29ybGQ=" });
 *
 * // Returns Base64 string
 * const row = await db.select().from(myTable);
 * console.log(row.snapshot); // "SGVsbG8gV29ybGQ="
 * ```
 */
export const byteaBase64 = customType<{ data: string; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
  toDriver(value: string): Buffer {
    const decoded = Encoding.decodeBase64(value);
    if (Either.isLeft(decoded)) {
      throw new Error(`Invalid Base64 string: ${decoded.left.message}`);
    }
    return Buffer.from(decoded.right);
  },
  fromDriver(value: Buffer): string {
    return Encoding.encodeBase64(new Uint8Array(value));
  },
});