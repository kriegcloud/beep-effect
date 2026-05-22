/**
 * X-Frame-Options header schemas.
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
export * from "../http/headers/FrameGuard.ts";
/**
 * Canonical aliases for the frame guard module.
 *
 * @category schemas
 * @since 0.0.0
 */
export {
  FrameGuardHeader as Header,
  FrameGuardMode as Mode,
  FrameGuardOption as Option,
  FrameGuardResponseHeader as ResponseHeader,
} from "../http/headers/FrameGuard.ts";
