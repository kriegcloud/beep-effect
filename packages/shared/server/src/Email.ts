/**
 * Email service exports for transactional email delivery.
 *
 * @since 0.1.0
 */

/**
 * Re-exports email service implementations including Resend integration.
 *
 * @example
 * ```typescript
 * import { Email } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const emailService = yield* Email.ResendService
 *   yield* emailService.send({ to: "user@example.com", subject: "Hello" })
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./internal/email";
