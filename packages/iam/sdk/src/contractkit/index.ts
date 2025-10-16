/**
 * The `IamError` module provides comprehensive error handling for IAM operations.
 *
 * This module defines a hierarchy of error types that can occur when working
 * with Iam services, including HTTP request/response errors, input/output
 * validation errors, and general runtime errors. All errors follow Effect's
 * structured error patterns and provide detailed context for debugging.
 *
 * ## Error Types
 *
 * - **HttpRequestError**: Errors occurring during HTTP request processing
 * - **HttpResponseError**: Errors occurring during HTTP response processing
 * - **MalformedInput**: Errors when input data doesn't match expected format
 * - **MalformedOutput**: Errors when output data can't be parsed or validated
 * - **UnknownError**: Catch-all for unexpected runtime errors
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk";
 * import * as Effect from "effect/Effect";
 * import * as Match from "effect/Match";
 *
 * const handleIamError = Match.type<IamError.IamError>().pipe(
 *   Match.tag("HttpRequestError", (err) =>
 *     Effect.logError(`Request failed: ${err.message}`)
 *   ),
 *   Match.tag("HttpResponseError", (err) =>
 *     Effect.logError(`Response error (${err.response.status}): ${err.message}`)
 *   ),
 *   Match.tag("MalformedInput", (err) =>
 *     Effect.logError(`Invalid input: ${err.message}`)
 *   ),
 *   Match.tag("MalformedOutput", (err) =>
 *     Effect.logError(`Invalid output: ${err.message}`)
 *   ),
 *   Match.orElse((err) =>
 *     Effect.logError(`Unknown error: ${err.message}`)
 *   )
 * )
 * ```
 *
 * @example
 * ```ts
 * import { IamError } from "@beep/iam-sdk"
 * import * as Effect from "effect/Effect";
 * import * as O from "effect/Option";
 *
 * const iamOperation = Effect.gen(function* () {
 *   // Some Iam operation that might fail
 *   return yield* new IamError.HttpRequestError({
 *     module: "BetterAuth",
 *     method: "signInEmail",
 *     reason: "Transport",
 *     request: {
 *       method: "POST",
 *       url: "http://localhost:3000/api/auth/sign-in-email",
 *       urlParams: [],
 *       hash: O.none(),
 *       headers: { "Content-Type": "application/json" }
 *     }
 *   })
 * })
 *
 * const program = iamOperation.pipe(
 *   Effect.catchTag("HttpRequestError", (error) => {
 *     console.log("Request failed:", error.message)
 *     return Effect.succeed("fallback response")
 *   })
 * )
 * ```
 *
 * @since 1.0.0
 */

/**
 * The `Contract` module provides functionality for defining and managing tools
 * that language models can call to augment their capabilities.
 *
 * This module enables creation of both user-defined and provider-defined tools,
 * with full schema validation, type safety, and contract support. Contracts allow
 * AI models to perform actions like searching databases, calling APIs, or
 * executing code within your application context.
 *
 * @example
 * ```ts
 * import { Contract } from "@beep/iam-sdk"
 * import * as S from "effect/Schema";
 *
 * // Define a simple calculator tool
 * const SignInEmail = Contract.make("SignInEmail", {
 *   description: "Signs the user in using email",
 *   parameters: {
 *     email: S.String,
 *     password: S.String
 *   },
 *   success: S.Number
 * })
 * ```
 *
 * @since 1.0.0
 */
export * as Contract from "./Contract";
/**
 * The `ContractSet` module allows for creating and implementing a collection of
 * `Contract`s which can be used to enhance the capabilities of a large language
 * model beyond simple text generation.
 *
 * @example
 * ```ts
 * import { ContractSet, Contract } from "@beep/iam-sdk"
 * import * as Effect from "effect/Effect";
 * import * as S from "effect/Schema";
 *
 * // Create individual tools
 * const SignInEmail = Contract.make("SignInEmail", {
 *   description: "Signs the user in using email",
 *   parameters: {
 *     email: S.String,
 *     password: S.String
 *   },
 *   success: S.String
 * })
 *
 * const SignInSocial = Contract.make("SignInSocial", {
 *   description: "Signs the user in using social provider",
 *   parameters: { provider: S.String },
 *   success: S.String
 * })
 *
 * // Create a contractSt with multiple contracts
 * const MyContractSet = ContractSet.make(SignInEmail, SignInSocial)
 *
 * const MyContractSetLayer = MyContractSet.toLayer({
 *   SignInEmail: ({ email, password }) => Effect.succeed("Signed in Successfully"),
 *   SignInSocial: ({ provider }) => Effect.succeed("Signed in Successfully")
 * })
 * ```
 *
 * @since 1.0.0
 */
export * as ContractSet from "./ContractSet";
export * as IamError from "./IamError";
export {
  makeFailureContinuation,
  type FailureContinuation,
  type FailureContinuationContext,
  type FailureContinuationHandlers,
  type FailureContinuationOptions,
} from "./failure-continuation";
