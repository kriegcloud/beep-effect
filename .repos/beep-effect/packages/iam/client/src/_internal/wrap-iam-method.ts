/**
 * @since 0.1.0
 * @description Utility for wrapping Better Auth client methods with Effect patterns
 */

import { client } from "@beep/iam-client/adapters";
import { $IamClientId } from "@beep/identity/packages";
import type { Wrapper } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { IamError } from "./errors";

const $I = $IamClientId.create("_internal/wrap-iam-method");

// ============================================================================
// Types
// ============================================================================

/**
 * Better Auth response shape with dual error channel
 */
export interface BetterAuthResponse {
  readonly data?: unknown;
  readonly error?:
    | undefined
    | null
    | {
        readonly message?: undefined | string;
        readonly code?: undefined | string;
        readonly status?: undefined | number;
      };
}

/**
 * Config without a before effect
 */
interface WrapConfigNoBefore<W extends Wrapper.AnyWithProps> {
  readonly wrapper: W;
  readonly before?: undefined;
  readonly mutatesSession?: undefined | boolean;
  /**
   * Optional transform to reshape response.data before decoding against successSchema.
   * Useful when Better Auth's response shape differs from the schema's expected encoded shape.
   *
   * @example
   * ```ts
   * // GetSession: Better Auth returns { session, user } | null
   * // Success schema expects { data: { session, user } | null }
   * transformResponse: (response) => ({ data: response.data })
   * ```
   */
  readonly transformResponse?: undefined | ((response: BetterAuthResponse) => unknown);
}

/**
 * Config with a before effect
 */
interface WrapConfigWithBefore<W extends Wrapper.AnyWithProps, BeforeResult, BeforeError, BeforeReq> {
  readonly wrapper: W;
  readonly before: Effect.Effect<BeforeResult, BeforeError, BeforeReq>;
  readonly mutatesSession?: undefined | boolean;
  /**
   * Optional transform to reshape response.data before decoding against successSchema.
   * Useful when Better Auth's response shape differs from the schema's expected encoded shape.
   */
  readonly transformResponse?: undefined | ((response: BetterAuthResponse) => unknown);
}

/**
 * Extract payload type from wrapper
 */
type WrapperPayloadType<W extends Wrapper.AnyWithProps> = S.Schema.Type<W["payloadSchema"]>;

/**
 * Extract encoded payload type from wrapper
 */
type WrapperPayloadEncoded<W extends Wrapper.AnyWithProps> = S.Schema.Encoded<W["payloadSchema"]>;

/**
 * Extract success type from wrapper
 */
type WrapperSuccessType<W extends Wrapper.AnyWithProps> = S.Schema.Type<W["successSchema"]>;

/**
 * Execute function signature without before effect
 */
type ExecuteFnNoBefore<W extends Wrapper.AnyWithProps> = (
  encodedPayload: WrapperPayloadEncoded<W>
) => Promise<BetterAuthResponse>;

/**
 * Execute function signature with before effect
 */
type ExecuteFnWithBefore<W extends Wrapper.AnyWithProps, BeforeResult> = (
  encodedPayload: WrapperPayloadEncoded<W>,
  beforeResult: BeforeResult
) => Promise<BetterAuthResponse>;

// ============================================================================
// Implementation
// ============================================================================

/**
 * Creates an IAM method wrapper that handles encoding, error checking, and decoding.
 *
 * @overload Without before effect - execute receives only encoded payload
 * @overload With before effect - execute receives encoded payload + before result
 *
 * @example
 * ```ts
 * // Without before effect
 * const success = yield* wrapIamMethod({
 *   wrapper: Contract.Wrapper,
 * })(
 *   (encodedPayload) => client.signIn.email(encodedPayload)
 * )(payload);
 *
 * // With before effect (e.g., captcha)
 * const success = yield* wrapIamMethod({
 *   wrapper: Contract.Wrapper,
 *   before: Effect.gen(function* () {
 *     const captchaService = yield* ReCaptcha.ReCaptchaService;
 *     return yield* captchaService.execute(siteKey, action);
 *   })
 * })(
 *   (encodedPayload, captchaResponse) => client.signIn.email({
 *     ...encodedPayload,
 *     fetchOptions: {
 *       headers: { "x-captcha-response": captchaResponse }
 *     }
 *   })
 * )(payload);
 * ```
 */
// Overload: Without before effect
export function wrapIamMethod<W extends Wrapper.AnyWithProps>(
  config: WrapConfigNoBefore<W>
): (
  execute: ExecuteFnNoBefore<W>
) => (
  payload: WrapperPayloadType<W>
) => Effect.Effect<
  WrapperSuccessType<W>,
  IamError.Type,
  S.Schema.Context<W["payloadSchema"]> | S.Schema.Context<W["successSchema"]>
>;

// Overload: With before effect
export function wrapIamMethod<W extends Wrapper.AnyWithProps, BeforeResult, BeforeError, BeforeReq>(
  config: WrapConfigWithBefore<W, BeforeResult, BeforeError, BeforeReq>
): (
  execute: ExecuteFnWithBefore<W, BeforeResult>
) => (
  payload: WrapperPayloadType<W>
) => Effect.Effect<
  WrapperSuccessType<W>,
  IamError.Type,
  S.Schema.Context<W["payloadSchema"]> | S.Schema.Context<W["successSchema"]> | BeforeReq
>;

// Implementation
export function wrapIamMethod<
  W extends Wrapper.AnyWithProps,
  BeforeResult = undefined,
  BeforeError = never,
  BeforeReq = never,
>(config: WrapConfigNoBefore<W> | WrapConfigWithBefore<W, BeforeResult, BeforeError, BeforeReq>) {
  const spanName = `${$I.string()}/${config.wrapper._tag}`;
  const hasBefore = config.before !== undefined;

  return (execute: ExecuteFnNoBefore<W> | ExecuteFnWithBefore<W, BeforeResult>) => {
    // Wrap the entire effect in error mapping to convert all errors to IamError
    return Effect.fn(spanName)((payload: WrapperPayloadType<W>) =>
      Effect.gen(function* () {
        // 1. Encode the payload using the wrapper's payloadSchema
        const encoded = (yield* S.encode(config.wrapper.payloadSchema)(payload)) as WrapperPayloadEncoded<W>;

        // 2. Run before effect if provided
        let beforeResult: BeforeResult | undefined;
        if (hasBefore && config.before !== undefined) {
          beforeResult = yield* config.before;
        }

        // 3. Execute the Better Auth call
        const response = yield* Effect.tryPromise({
          try: () =>
            hasBefore
              ? (execute as ExecuteFnWithBefore<W, BeforeResult>)(encoded, beforeResult as BeforeResult)
              : (execute as ExecuteFnNoBefore<W>)(encoded),
          catch: IamError.fromUnknown,
        });

        // 4. Check Better Auth error (CRITICAL - data is null when error present)
        if (P.isNotNullable(response.error)) {
          return yield* IamError.fromUnknown(response.error);
        }

        // 5. Notify session signal if mutation succeeded
        if (config.mutatesSession === true) {
          client.$store.notify("$sessionSignal");
        }

        // 6. Transform response if needed, then decode using successSchema
        const dataToEncode =
          config.transformResponse !== undefined ? config.transformResponse(response) : response.data;
        return yield* S.decodeUnknown(config.wrapper.successSchema)(dataToEncode);
      }).pipe(
        // Map ALL errors (ParseError, ReCaptcha errors, etc.) to IamError
        Effect.mapError(IamError.fromUnknown)
      )
    );
  };
}
