/**
 * Primary schemas for CSV parser options.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Public schema module export.
 *
 * @category type-level
 * @since 0.0.0
 */
export type { ParserOptionsArgs } from "../csv/parse/ParserOptions.ts";
/**
 * Canonical aliases for the parser options module.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  HeaderValueInput,
  ParserOptions as Schema,
  ParserOptions,
  ParserOptionsError as Error,
  ParserOptionsError,
} from "../csv/parse/ParserOptions.ts";
