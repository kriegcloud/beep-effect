import type { ClientFetchOption } from "@beep/iam-client/_common";
import { extractBetterAuthErrorMessage } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { BetterAuthResponseError, IamError } from "../../_common/errors.ts";
import * as Contract from "./sign-up-email.contract.ts";

/**
 * Handler for signing up with email and password.
 *
 * NOTE: This handler doesn't use the factory pattern because:
 * 1. The Payload contract uses transformOrFailFrom, meaning the encoded output
 *    doesn't include the computed `name` field
 * 2. Better Auth requires `name`, so we manually add it from the decoded payload
 *
 * Features:
 * - Encodes payload and manually adds computed `name` field
 * - Properly checks for Better Auth errors before decoding response (FIXED)
 * - Notifies `$sessionSignal` after successful sign-up (FIXED)
 * - Uses consistent span naming: "sign-up/email/handler"
 */
export const Handler = Effect.fn("sign-up/email/handler")(function* (params: {
  readonly payload: Contract.Payload;
  readonly fetchOptions?: ClientFetchOption;
}) {
  // 1. Encode payload (produces PayloadFrom shape without `name`)
  const encodedPayload = yield* S.encode(Contract.Payload)(params.payload);

  // 2. Execute Better Auth call with manually added `name`
  const response = yield* Effect.tryPromise({
    try: () =>
      client.signUp.email({
        ...encodedPayload,
        name: params.payload.name, // Add computed name from decoded payload
        fetchOptions: params.fetchOptions,
      }),
    catch: IamError.fromUnknown,
  });

  // 3. Check Better Auth error (CRITICAL - was missing before)
  if (response.error !== null) {
    return yield* new BetterAuthResponseError({
      message: extractBetterAuthErrorMessage(response.error),
      code: response.error.code,
      status: response.error.status,
    });
  }

  // 4. Notify session signal (CRITICAL - was missing before)
  client.$store.notify("$sessionSignal");

  // 5. Decode and return success
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
