/**
 * X-XSS-Protection header schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
export * from "../http/headers/XSSProtection.ts";
/**
 * Canonical aliases for the X-XSS-Protection module.
 *
 * @category aliases
 * @since 0.0.0
 */
export {
  XSSProtectionHeader as Header,
  XSSProtectionMode as Mode,
  XSSProtectionOption as Option,
  XSSProtectionResponseHeader as ResponseHeader,
} from "../http/headers/XSSProtection.ts";
