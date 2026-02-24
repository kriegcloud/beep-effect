/**
 * @fileoverview Username sign-in module aggregating contracts and handlers.
 *
 * @module @beep/iam-client/sign-in/username/mod
 * @category SignIn/Username
 * @since 0.1.0
 */

/**
 * Re-exports username sign-in contract schemas and wrapper.
 *
 * @example
 * ```typescript
 * import { Payload, Success, Wrapper } from "@beep/iam-client/sign-in/username"
 *
 * const payload = Payload.make({ username: "alice", password: "secure" })
 * ```
 *
 * @category SignIn/Username
 * @since 0.1.0
 */
export * from "./contract.ts";

/**
 * Re-exports username sign-in handler implementation.
 *
 * @example
 * ```typescript
 * import { Handler } from "@beep/iam-client/sign-in/username"
 * import * as Effect from "effect/Effect"
 *
 * const result = yield* Handler({ username: "alice", password: "secure" })
 * ```
 *
 * @category SignIn/Username
 * @since 0.1.0
 */
export * from "./handler.ts";
