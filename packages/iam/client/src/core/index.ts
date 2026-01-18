/**
 * @fileoverview Core authentication namespace export.
 *
 * @module @beep/iam-client/core
 * @category Core
 * @since 0.1.0
 */

/**
 * Core authentication namespace providing session management and sign-out operations.
 *
 * Exposes hooks, service definitions, and handlers for managing user authentication
 * state in React applications.
 *
 * @example
 * ```typescript
 * import { Core } from "@beep/iam-client"
 *
 * function MyComponent() {
 *   const { signOut, sessionResult } = Core.Atoms.use()
 *
 *   return (
 *     <div>
 *       <button onClick={() => signOut()}>Sign Out</button>
 *     </div>
 *   )
 * }
 * ```
 *
 * @category Core
 * @since 0.1.0
 */
export * as Core from "./mod.ts";
