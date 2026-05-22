/**
 * X-Content-Type-Options header schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
/**
 * Public schema module export.
 *
 * @category schemas
 * @since 0.0.0
 */
export * from "../http/headers/NoSniff.ts";
/**
 * Canonical aliases for the X-Content-Type-Options module.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  NoSniffHeader as Header,
  NoSniffOption as Option,
  NoSniffResponseHeader as ResponseHeader,
  NoSniffValue as Value,
} from "../http/headers/NoSniff.ts";
