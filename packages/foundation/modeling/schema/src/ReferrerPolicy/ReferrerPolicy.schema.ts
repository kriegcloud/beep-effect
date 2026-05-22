/**
 * Referrer-Policy header schemas.
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
export * from "../http/headers/ReferrerPolicy.ts";
/**
 * Canonical aliases for the Referrer-Policy module.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  ReferrerPolicyHeader as Header,
  ReferrerPolicyOption as Option,
  ReferrerPolicyResponseHeader as ResponseHeader,
  ReferrerPolicyValue as Value,
} from "../http/headers/ReferrerPolicy.ts";
