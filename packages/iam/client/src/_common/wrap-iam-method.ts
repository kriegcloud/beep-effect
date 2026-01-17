/**
 * @since 1.0.0
 * @description Utility for wrapping Better Auth client methods with Effect patterns
 */

import { IamError } from "@beep/iam-client/_common/errors";
import { client } from "@beep/iam-client/adapters";
import { $IamClientId } from "@beep/identity/packages";
import type { Wrapper } from "@beep/wrap";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { BetterAuthResponse } from "./handler.factory.ts";

const $I = $IamClientId.create("tmp/_common/wrap-iam-method");

// ============================================================================
// Types
// ============================================================================

/**
 * Config without a before effect
 */
interface WrapConfigNoBefore<W extends Wrapper.AnyWithProps> {
  readonly wrapper: W;
  readonly before?: undefined;
  readonly mutatesSession?: boolean;
}

/**
 * Config with a before effect
 */
interface WrapConfigWithBefore<W extends Wrapper.AnyWithProps, BeforeResult, BeforeError, BeforeReq> {
  readonly wrapper: W;
  readonly before: Effect.Effect<BeforeResult, BeforeError, BeforeReq>;
  readonly mutatesSession?: boolean;
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

        // 6. Decode and return success using the wrapper's successSchema
        return yield* S.decodeUnknown(config.wrapper.successSchema)(response.data);
      }).pipe(
        // Map ALL errors (ParseError, ReCaptcha errors, etc.) to IamError
        Effect.mapError(IamError.fromUnknown)
      )
    );
  };
}

/**
 * Helper to create the wrapped effect directly without the extra curry level.
 * Useful when you want to call the method immediately with a known payload.
 *
 * @example
 * ```ts
 * const success = yield* wrapIamMethodCall({
 *   wrapper: Contract.Wrapper,
 *   payload,
 *   before: captchaEffect,
 *   execute: (encoded, captcha) => client.signIn.email({
 *     ...encoded,
 *     fetchOptions: { headers: { "x-captcha-response": captcha } }
 *   })
 * });
 * ```
 */
// Overload: Without before effect
export function wrapIamMethodCall<W extends Wrapper.AnyWithProps>(config: {
  readonly wrapper: W;
  readonly payload: WrapperPayloadType<W>;
  readonly before?: undefined;
  readonly mutatesSession?: boolean;
  readonly execute: ExecuteFnNoBefore<W>;
}): Effect.Effect<
  WrapperSuccessType<W>,
  IamError.Type,
  S.Schema.Context<W["payloadSchema"]> | S.Schema.Context<W["successSchema"]>
>;

// Overload: With before effect
export function wrapIamMethodCall<W extends Wrapper.AnyWithProps, BeforeResult, BeforeError, BeforeReq>(config: {
  readonly wrapper: W;
  readonly payload: WrapperPayloadType<W>;
  readonly before: Effect.Effect<BeforeResult, BeforeError, BeforeReq>;
  readonly mutatesSession?: boolean;
  readonly execute: ExecuteFnWithBefore<W, BeforeResult>;
}): Effect.Effect<
  WrapperSuccessType<W>,
  IamError.Type,
  S.Schema.Context<W["payloadSchema"]> | S.Schema.Context<W["successSchema"]> | BeforeReq
>;

// Implementation
export function wrapIamMethodCall<
  W extends Wrapper.AnyWithProps,
  BeforeResult = undefined,
  BeforeError = never,
  BeforeReq = never,
>(config: {
  readonly wrapper: W;
  readonly payload: WrapperPayloadType<W>;
  readonly before?: Effect.Effect<BeforeResult, BeforeError, BeforeReq>;
  readonly mutatesSession?: boolean;
  readonly execute: ExecuteFnNoBefore<W> | ExecuteFnWithBefore<W, BeforeResult>;
}) {
  const hasBefore = config.before !== undefined;

  if (hasBefore) {
    return wrapIamMethod({
      wrapper: config.wrapper,
      before: config.before!,
      mutatesSession: config.mutatesSession,
    })(config.execute as ExecuteFnWithBefore<W, BeforeResult>)(config.payload);
  }

  return wrapIamMethod({
    wrapper: config.wrapper,
    mutatesSession: config.mutatesSession,
  })(config.execute as ExecuteFnNoBefore<W>)(config.payload);
}
