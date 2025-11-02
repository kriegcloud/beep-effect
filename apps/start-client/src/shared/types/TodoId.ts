import * as Brand from "effect/Brand";
import * as Schema from "effect/Schema";

/**
 * Branded type for Todo IDs to prevent mixing with other numeric types
 */
export type TodoId = number & Brand.Brand<"TodoId">;

/**
 * Constructor for TodoId branded type
 * Uses nominal branding (no runtime validation, compile-time only)
 */
export const TodoId = Brand.nominal<TodoId>();

/**
 * Schema for TodoId that integrates with Effect's Schema system
 * Used for RPC serialization and validation
 */
export const TodoIdSchema = Schema.Number.pipe(Schema.fromBrand(TodoId));
