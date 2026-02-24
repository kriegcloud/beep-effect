/**
 * @fileoverview
 * Anonymous module.
 *
 * @module @beep/iam-client/anonymous
 * @category Anonymous
 * @since 0.1.0
 */

// Feature modules
export * as DeleteUser from "./delete-user/mod.ts";

// Layer and group exports
export { AnonymousGroup, layer } from "./layer.ts";
