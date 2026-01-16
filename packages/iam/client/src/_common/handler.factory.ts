import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { ClientFetchOption } from "./common.types.ts";
import { BetterAuthResponseError, IamError, type UnknownIamError } from "./errors.ts";
import { extractBetterAuthErrorMessage } from "./schema.helpers.ts";

// ============================================================================
// Better Auth Response Type
// ============================================================================

/**
 * Better Auth response shape with dual error channel
 */
interface BetterAuthResponse {
  readonly data: unknown;
  readonly error: {
    readonly message?: string;
    readonly code?: string;
    readonly status?: number;
  } | null;
}

// ============================================================================
// Handler Error Type
// ============================================================================

/**
 * Union of possible errors from handler factory
 */
export type HandlerFactoryError = BetterAuthResponseError | IamError | UnknownIamError | ParseResult.ParseError;

// ============================================================================
// Handler Input Types
// ============================================================================

/**
 * Input type for handlers with payload
 */
export interface HandlerWithPayloadInput<Payload> {
  readonly payload: Payload;
  readonly fetchOptions?: ClientFetchOption;
}

/**
 * Input type for handlers without payload
 */
export interface HandlerNoPayloadInput {
  readonly fetchOptions?: ClientFetchOption;
}

// ============================================================================
// Handler Factory
// ============================================================================

/**
 * Creates an Effect handler for Better Auth client methods.
 *
 * Features:
 * - Auto-generates Effect.fn span name: `"{domain}/{feature}/handler"`
 * - Checks `response.error` before decode (CRITICAL fix from Phase 1)
 * - Notifies `$sessionSignal` when `mutatesSession: true`
 * - Supports both payload and no-payload variants
 *
 * @example
 * ```ts
 * // With payload (sign-in, sign-up)
 * export const Handler = createHandler({
 *   domain: "sign-in",
 *   feature: "email",
 *   execute: (encoded) => client.signIn.email(encoded),
 *   successSchema: Contract.Success,
 *   payloadSchema: Contract.Payload,
 *   mutatesSession: true,
 * });
 *
 * // Without payload (sign-out)
 * export const Handler = createHandler({
 *   domain: "core",
 *   feature: "sign-out",
 *   execute: () => client.signOut(),
 *   successSchema: Contract.Success,
 *   mutatesSession: true,
 * });
 * ```
 */
// Overload 1: With payload schema
export function createHandler<PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: (
    encoded: S.Schema.Encoded<PayloadSchema> & { readonly fetchOptions?: ClientFetchOption }
  ) => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema: PayloadSchema;
  readonly mutatesSession?: boolean;
}): (
  input: HandlerWithPayloadInput<S.Schema.Type<PayloadSchema>>
) => Effect.Effect<
  S.Schema.Type<SuccessSchema>,
  HandlerFactoryError,
  S.Schema.Context<PayloadSchema> | S.Schema.Context<SuccessSchema>
>;

// Overload 2: Without payload schema
export function createHandler<SuccessSchema extends S.Schema.Any>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: () => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema?: undefined;
  readonly mutatesSession?: boolean;
}): (
  input?: HandlerNoPayloadInput
) => Effect.Effect<S.Schema.Type<SuccessSchema>, HandlerFactoryError, S.Schema.Context<SuccessSchema>>;

// ============================================================================
// Implementation
// ============================================================================

export function createHandler<
  PayloadSchema extends S.Schema.Any | undefined,
  SuccessSchema extends S.Schema.Any,
>(config: {
  readonly domain: string;
  readonly feature: string;
  readonly execute: PayloadSchema extends S.Schema.Any
    ? (
        encoded: S.Schema.Encoded<PayloadSchema> & { readonly fetchOptions?: ClientFetchOption }
      ) => Promise<BetterAuthResponse>
    : () => Promise<BetterAuthResponse>;
  readonly successSchema: SuccessSchema;
  readonly payloadSchema?: PayloadSchema;
  readonly mutatesSession?: boolean;
}) {
  // Generate consistent name: "domain/feature/handler"
  const spanName = `${config.domain}/${config.feature}/handler`;

  // Handler with payload
  if (P.isNotUndefined(config.payloadSchema)) {
    const payloadSchema = config.payloadSchema as S.Schema.Any;
    const execute = config.execute as (
      encoded: unknown & { readonly fetchOptions?: ClientFetchOption }
    ) => Promise<BetterAuthResponse>;

    return Effect.fn(spanName)(function* (input: {
      readonly payload: unknown;
      readonly fetchOptions?: ClientFetchOption;
    }) {
      // 1. Encode payload
      const encoded = yield* S.encode(payloadSchema)(input.payload);

      // 2. Execute Better Auth call
      const response = yield* Effect.tryPromise({
        try: () => execute({ ...encoded, fetchOptions: input.fetchOptions }),
        catch: IamError.fromUnknown,
      });

      // 3. Check Better Auth error (CRITICAL - missing in most handlers)
      if (response.error !== null) {
        return yield* new BetterAuthResponseError({
          message: extractBetterAuthErrorMessage(response.error),
          code: response.error.code,
          status: response.error.status,
        });
      }

      // 4. Notify session signal if mutation succeeded
      if (config.mutatesSession === true) {
        client.$store.notify("$sessionSignal");
      }

      // 5. Decode and return success
      return yield* S.decodeUnknown(config.successSchema as S.Schema.Any)(response.data);
    });
  }

  // Handler without payload
  const execute = config.execute as () => Promise<BetterAuthResponse>;

  return Effect.fn(spanName)(function* (_input?: { readonly fetchOptions?: ClientFetchOption }) {
    // 1. Execute Better Auth call
    const response = yield* Effect.tryPromise({
      try: () => execute(),
      catch: IamError.fromUnknown,
    });

    // 2. Check Better Auth error
    if (P.isNotNull(response.error)) {
      return yield* new BetterAuthResponseError({
        message: extractBetterAuthErrorMessage(response.error),
        code: response.error.code,
        status: response.error.status,
      });
    }

    // 3. Notify session signal if mutation succeeded
    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // 4. Decode and return success
    return yield* S.decodeUnknown(config.successSchema as S.Schema.Any)(response.data);
  });
}
