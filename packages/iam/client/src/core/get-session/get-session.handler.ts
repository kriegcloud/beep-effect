import { IamError } from "@beep/iam-client/_common";
import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Contract from "./get-session.contract.ts";

/**
 * Handler for getting the current session.
 *
 * NOTE: This handler does NOT use the factory pattern because:
 * 1. client.getSession() returns `{ data: { session, user } | null }` directly
 *    (not the `{ data, error }` dual-channel like other endpoints)
 * 2. The Success schema expects `{ data: ... }` as input, not just the inner data
 *
 * The factory pattern extracts `response.data` before decoding, but here we need
 * to pass the entire response to the schema since Success expects `{ data: ... }`.
 *
 * Features:
 * - Decodes response with Success schema (handles null → Option.none())
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "core/get-session/handler"
 */
export const Handler = Effect.fn("core/get-session/handler")(function* () {
  // 1. Execute Better Auth call
  const response = yield* Effect.tryPromise({
    try: () => client.getSession(),
    catch: IamError.fromUnknown,
  });

  // 2. Decode the WHOLE response (not response.data) since getSession
  // returns { data: ... | null } directly without error channel
  return yield* S.decodeUnknown(Contract.Success)(response);
});
