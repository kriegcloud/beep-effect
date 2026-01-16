/**
 * Type-Safe Handler Factory - POC Implementation
 *
 * This refactored version eliminates all 5 unsafe `as` type assertions
 * while maintaining identical public API and type inference.
 *
 * Approach: Separate Implementation Functions with Type Guard Dispatch
 *
 * Changes from original:
 * 1. Added discriminated config interfaces (ConfigWithPayload, ConfigNoPayload)
 * 2. Added type guard (hasPayloadSchema) for union narrowing
 * 3. Extracted createHandlerWithPayload and createHandlerNoPayload functions
 * 4. Simplified main implementation to dispatch based on type guard
 * 5. REMOVED all 5 `as` type assertions
 */

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
 * Better Auth response shape with dual error channel.
 *
 * NOTE: The actual Better Auth client returns a discriminated union type
 * `Data<T> | Error$1<E>`. We use a more permissive interface here that
 * accepts both the actual response shape and our expected shape.
 */
export interface BetterAuthResponse {
  readonly data?: unknown;
  readonly error?: {
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
// NEW: Discriminated Config Interfaces
// ============================================================================

/**
 * Config for handlers WITH payload schema.
 * payloadSchema is REQUIRED (not optional).
 *
 * This interface ensures that when payloadSchema is present,
 * the execute function has the correct signature accepting encoded payload.
 */
interface ConfigWithPayload<PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema: PayloadSchema; // REQUIRED - not optional
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: (
    encoded: S.Schema.Encoded<PayloadSchema> & { readonly fetchOptions?: ClientFetchOption }
  ) => Promise<BetterAuthResponse>;
}

/**
 * Config for handlers WITHOUT payload schema.
 * payloadSchema is explicitly undefined or omitted.
 *
 * This interface ensures that when payloadSchema is absent,
 * the execute function has the correct signature with no parameters.
 */
interface ConfigNoPayload<SuccessSchema extends S.Schema.Any> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema?: undefined; // OPTIONAL, must be undefined if present
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: () => Promise<BetterAuthResponse>;
}

/**
 * Union type for internal implementation dispatch.
 * The implementation signature uses this to accept both variants.
 */
type HandlerConfig<SuccessSchema extends S.Schema.Any> =
  | ConfigWithPayload<S.Schema.Any, SuccessSchema>
  | ConfigNoPayload<SuccessSchema>;

// ============================================================================
// NEW: Type Guard
// ============================================================================

/**
 * Type guard that narrows HandlerConfig to ConfigWithPayload.
 *
 * This bridges the runtime check (payloadSchema !== undefined)
 * to compile-time type narrowing (config is ConfigWithPayload).
 *
 * After this check, TypeScript knows:
 * - config.payloadSchema is S.Schema.Any (not undefined)
 * - config.execute accepts encoded payload
 */
const hasPayloadSchema = <SuccessSchema extends S.Schema.Any>(
  config: HandlerConfig<SuccessSchema>
): config is ConfigWithPayload<S.Schema.Any, SuccessSchema> => {
  return config.payloadSchema !== undefined;
};

// ============================================================================
// NEW: Separate Implementation Functions
// ============================================================================

/**
 * Implementation for handlers WITH payload.
 *
 * All types are fully constrained - NO assertions needed.
 *
 * @param config - Configuration with required payloadSchema
 * @returns Effect handler function that accepts payload input
 */
const createHandlerWithPayload = <PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any>(
  config: ConfigWithPayload<PayloadSchema, SuccessSchema>
) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  return Effect.fn(spanName)(function* (input: HandlerWithPayloadInput<S.Schema.Type<PayloadSchema>>) {
    // 1. Encode payload
    // config.payloadSchema is PayloadSchema (guaranteed by ConfigWithPayload)
    // NO assertion needed - type is correctly inferred
    const encoded = yield* S.encode(config.payloadSchema)(input.payload);

    // 2. Execute Better Auth call
    // config.execute has correct signature: (encoded) => Promise<BetterAuthResponse>
    // NO assertion needed - type is correctly inferred
    const response = yield* Effect.tryPromise({
      try: () => config.execute({ ...encoded, fetchOptions: input.fetchOptions }),
      catch: IamError.fromUnknown,
    });

    // 3. Check Better Auth error (CRITICAL - missing in most handlers)
    if (P.isNotNullable(response.error)) {
      return yield* new BetterAuthResponseError({
        message: extractBetterAuthErrorMessage(response.error),
        ...(P.isNotUndefined(response.error.code) && { code: response.error.code }),
        ...(P.isNotUndefined(response.error.status) && { status: response.error.status }),
      });
    }

    // 4. Notify session signal if mutation succeeded
    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // 5. Decode and return success
    // config.successSchema is SuccessSchema (guaranteed by ConfigWithPayload)
    // NO assertion needed - type is correctly inferred
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};

/**
 * Implementation for handlers WITHOUT payload.
 *
 * All types are fully constrained - NO assertions needed.
 *
 * @param config - Configuration without payloadSchema
 * @returns Effect handler function that accepts optional input
 */
const createHandlerNoPayload = <SuccessSchema extends S.Schema.Any>(config: ConfigNoPayload<SuccessSchema>) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  return Effect.fn(spanName)(function* (_input?: HandlerNoPayloadInput) {
    // 1. Execute Better Auth call
    // config.execute has correct signature: () => Promise<BetterAuthResponse>
    // NO assertion needed - type is correctly inferred
    const response = yield* Effect.tryPromise({
      try: () => config.execute(),
      catch: IamError.fromUnknown,
    });

    // 2. Check Better Auth error
    if (P.isNotNullable(response.error)) {
      return yield* new BetterAuthResponseError({
        message: extractBetterAuthErrorMessage(response.error),
        ...(P.isNotUndefined(response.error.code) && { code: response.error.code }),
        ...(P.isNotUndefined(response.error.status) && { status: response.error.status }),
      });
    }

    // 3. Notify session signal if mutation succeeded
    if (config.mutatesSession === true) {
      client.$store.notify("$sessionSignal");
    }

    // 4. Decode and return success
    // config.successSchema is SuccessSchema (guaranteed by ConfigNoPayload)
    // NO assertion needed - type is correctly inferred
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};

// ============================================================================
// PUBLIC API: Overloads (UNCHANGED from original)
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
// IMPLEMENTATION: Type-Safe Dispatch (REFACTORED)
// ============================================================================

/**
 * Implementation function.
 *
 * KEY CHANGES from original:
 * 1. Uses HandlerConfig<SuccessSchema> union type
 * 2. Type guard narrows to correct variant
 * 3. Dispatches to separate implementation functions
 * 4. NO unsafe `as` assertions anywhere
 *
 * The overload signatures above handle all the complex generic inference.
 * This implementation just dispatches to the correct helper.
 */
export function createHandler<SuccessSchema extends S.Schema.Any>(config: HandlerConfig<SuccessSchema>) {
  // Type guard narrows config to the correct variant
  if (hasPayloadSchema(config)) {
    // TypeScript knows: config is ConfigWithPayload<S.Schema.Any, SuccessSchema>
    // NO assertion needed - type guard provides narrowing
    return createHandlerWithPayload(config);
  }

  // TypeScript knows: config is ConfigNoPayload<SuccessSchema>
  // NO assertion needed - type guard provides narrowing
  return createHandlerNoPayload(config);
}
