/**
 * Permissions-Policy header schemas.
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
export * from "../http/headers/PermissionsPolicy.ts";
/**
 * Canonical aliases for the Permissions-Policy module.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  PermissionsPolicyHeader as Header,
  PermissionsPolicyOption as Option,
  PermissionsPolicyResponseHeader as ResponseHeader,
} from "../http/headers/PermissionsPolicy.ts";
