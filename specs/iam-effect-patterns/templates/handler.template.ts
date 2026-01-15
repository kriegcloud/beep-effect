/**
 * Handler Template
 *
 * This template demonstrates the canonical pattern for wrapping
 * Better Auth client methods with Effect.
 *
 * Copy this template when implementing new Better Auth handlers.
 */

import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import type * as Contract from "./{{method}}.contract";

/**
 * Handler parameters interface
 *
 * All handlers should use consistent parameter structure:
 * - `payload`: The typed payload for the method
 * - `fetchOptions`: Optional fetch customization (headers, etc.)
 */
export interface HandlerParams {
  readonly payload: Contract.Payload;
  readonly fetchOptions?: Common.ClientFetchOption | undefined;
}

/**
 * Handler implementation
 *
 * Pattern breakdown:
 * 1. Effect.fn with semantic name for tracing
 * 2. Encode payload if needed (Redacted fields → strings)
 * 3. Call Better Auth via Effect.tryPromise
 * 4. Check for response.error before decoding
 * 5. Decode response.data with contract schema
 * 6. Notify session signal if this handler mutates session state
 */
export const Handler = Effect.fn("{{domain}}/{{method}}/handler")(function* (params: HandlerParams) {
  // 1. Encode payload if schema has transformations (e.g., Redacted → string)
  const encodedPayload = yield* S.encode(Contract.Payload)(params.payload);

  // 2. Call Better Auth method, wrapping in tryPromise for error handling
  const response = yield* Effect.tryPromise({
    try: () =>
      client.{{betterAuthMethod}}({
        ...encodedPayload,
        fetchOptions: params.fetchOptions,
      }),
    catch: Common.IamError.fromUnknown,
  });

  // 3. Check for Better Auth error response
  // Better Auth returns { data, error } where error may contain failure info
  if (P.isNotNullable(response.error)) {
    return yield* Effect.fail(
      new Common.IamError({
        cause: response.error,
        message: response.error.message ?? "Unknown error",
      })
    );
  }

  // 4. Decode the success response
  const result = yield* S.decodeUnknown(Contract.Success)(response.data);

  // 5. Notify session signal for handlers that mutate session state
  // This is CRITICAL for auth guards to react to session changes
  // Remove this line for read-only handlers (e.g., getSession)
  client.$store.notify("$sessionSignal");

  return result;
});

/**
 * Alternative: No-payload handler
 *
 * For handlers that don't require a payload (e.g., getSession):
 *
 * export const Handler = Effect.fn("{{domain}}/{{method}}/handler")(function* (
 *   params?: { readonly fetchOptions?: Common.ClientFetchOption | undefined }
 * ) {
 *   const response = yield* Effect.tryPromise({
 *     try: () => client.{{betterAuthMethod}}({ fetchOptions: params?.fetchOptions }),
 *     catch: Common.IamError.fromUnknown,
 *   });
 *
 *   return yield* S.decodeUnknown(Contract.Success)(response.data);
 * });
 */
