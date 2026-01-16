/**
 * Proof of Concept - Type-Safe Handler Factory
 *
 * Demonstrates eliminating unsafe `as` assertions while maintaining
 * identical public API and type inference.
 *
 * KEY INSIGHT: The solution is NOT Effect Match, but rather:
 * 1. Separate config interfaces (discriminated by payloadSchema presence)
 * 2. Separate implementation functions (each with constrained types)
 * 3. Type guard that bridges runtime check to type narrowing
 * 4. Unchanged overload signatures (preserves call site inference)
 */

import type * as ParseResult from "effect/ParseResult";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

// ============================================================================
// Types (unchanged from original)
// ============================================================================

interface BetterAuthResponse {
  readonly data: unknown;
  readonly error: {
    readonly message?: string;
    readonly code?: string;
    readonly status?: number;
  } | null;
}

interface ClientFetchOption {
  readonly headers?: Record<string, string>;
}

export interface HandlerWithPayloadInput<Payload> {
  readonly payload: Payload;
  readonly fetchOptions?: ClientFetchOption;
}

export interface HandlerNoPayloadInput {
  readonly fetchOptions?: ClientFetchOption;
}

// Placeholder error types
class BetterAuthResponseError extends Error {}
class IamError extends Error {
  static fromUnknown = (e: unknown) => new IamError(String(e));
}

type HandlerFactoryError = BetterAuthResponseError | IamError | ParseResult.ParseError;

// ============================================================================
// NEW: Discriminated Config Interfaces
// ============================================================================

/**
 * Config for handlers WITH payload schema.
 * payloadSchema is REQUIRED (not optional).
 */
interface ConfigWithPayload<PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema: PayloadSchema; // REQUIRED
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: (
    encoded: S.Schema.Encoded<PayloadSchema> & { readonly fetchOptions?: ClientFetchOption }
  ) => Promise<BetterAuthResponse>;
}

/**
 * Config for handlers WITHOUT payload schema.
 * payloadSchema is explicitly undefined or omitted.
 */
interface ConfigNoPayload<SuccessSchema extends S.Schema.Any> {
  readonly domain: string;
  readonly feature: string;
  readonly payloadSchema?: undefined; // OPTIONAL, must be undefined
  readonly successSchema: SuccessSchema;
  readonly mutatesSession?: boolean;
  readonly execute: () => Promise<BetterAuthResponse>;
}

/**
 * Union type for internal implementation.
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
 * Types are fully constrained - no assertions needed.
 */
const createHandlerWithPayload = <PayloadSchema extends S.Schema.Any, SuccessSchema extends S.Schema.Any>(
  config: ConfigWithPayload<PayloadSchema, SuccessSchema>
) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  // Return type is inferred correctly
  return Effect.fn(spanName)(function* (input: HandlerWithPayloadInput<S.Schema.Type<PayloadSchema>>) {
    // config.payloadSchema is guaranteed to be PayloadSchema (not undefined)
    const encoded = yield* S.encode(config.payloadSchema)(input.payload);

    // config.execute has the correct signature: (encoded) => Promise
    const response = yield* Effect.tryPromise({
      try: () => config.execute({ ...encoded, fetchOptions: input.fetchOptions }),
      catch: IamError.fromUnknown,
    });

    if (response.error !== null) {
      return yield* Effect.fail(new BetterAuthResponseError(response.error.message));
    }

    if (config.mutatesSession === true) {
      // client.$store.notify("$sessionSignal");
    }

    // config.successSchema is SuccessSchema
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};

/**
 * Implementation for handlers WITHOUT payload.
 * Types are fully constrained - no assertions needed.
 */
const createHandlerNoPayload = <SuccessSchema extends S.Schema.Any>(config: ConfigNoPayload<SuccessSchema>) => {
  const spanName = `${config.domain}/${config.feature}/handler`;

  // Return type is inferred correctly
  return Effect.fn(spanName)(function* (_input?: HandlerNoPayloadInput) {
    // config.execute has the correct signature: () => Promise
    const response = yield* Effect.tryPromise({
      try: () => config.execute(),
      catch: IamError.fromUnknown,
    });

    if (response.error !== null) {
      return yield* Effect.fail(new BetterAuthResponseError(response.error.message));
    }

    if (config.mutatesSession === true) {
      // client.$store.notify("$sessionSignal");
    }

    // config.successSchema is SuccessSchema
    return yield* S.decodeUnknown(config.successSchema)(response.data);
  });
};

// ============================================================================
// PUBLIC API: Overloads (UNCHANGED from original)
// ============================================================================

/**
 * Overload 1: With payload schema
 */
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

/**
 * Overload 2: Without payload schema
 */
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
// IMPLEMENTATION: Type-Safe Dispatch
// ============================================================================

/**
 * Implementation function.
 *
 * KEY: The implementation signature is simplified to HandlerConfig<any>.
 * The overload signatures above handle all the complex generic inference.
 * This implementation just needs to dispatch to the correct helper.
 */
export function createHandler<SuccessSchema extends S.Schema.Any>(
  config: HandlerConfig<SuccessSchema>
): (input?: unknown) => Effect.Effect<S.Schema.Type<SuccessSchema>, HandlerFactoryError, unknown> {
  // Type guard narrows config to the correct variant
  if (hasPayloadSchema(config)) {
    // TypeScript knows: config is ConfigWithPayload<Schema.Any, SuccessSchema>
    // No assertion needed!
    return createHandlerWithPayload(config);
  }

  // TypeScript knows: config is ConfigNoPayload<SuccessSchema>
  // No assertion needed!
  return createHandlerNoPayload(config);
}

// ============================================================================
// USAGE EXAMPLES (for validation)
// ============================================================================

// Example schemas
const EmailPayload = S.Struct({
  email: S.String,
  password: S.String,
});

const SignInSuccess = S.Struct({
  user: S.Struct({ id: S.String }),
  token: S.String,
});

const SignOutSuccess = S.Struct({
  success: S.Boolean,
});

// Example: With payload (sign-in style)
const signInHandler = createHandler({
  domain: "sign-in",
  feature: "email",
  payloadSchema: EmailPayload,
  successSchema: SignInSuccess,
  execute: (encoded) => Promise.resolve({ data: {}, error: null }),
  mutatesSession: true,
});

// TypeScript infers:
// signInHandler: (input: HandlerWithPayloadInput<{ email: string; password: string }>) =>
//   Effect.Effect<{ user: { id: string }; token: string }, HandlerFactoryError, never>

// Example: Without payload (sign-out style)
const signOutHandler = createHandler({
  domain: "core",
  feature: "sign-out",
  successSchema: SignOutSuccess,
  execute: () => Promise.resolve({ data: {}, error: null }),
  mutatesSession: true,
});

// TypeScript infers:
// signOutHandler: (input?: HandlerNoPayloadInput) =>
//   Effect.Effect<{ success: boolean }, HandlerFactoryError, never>
