import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { IamError } from "../../_common/errors.ts";
import * as Contract from "./get-session.contract.ts";

/**
 * Handler for getting the current session.
 *
 * NOTE: This handler doesn't use the factory pattern because:
 * 1. client.getSession() returns `{ data: { session, user } | null }` directly
 *    (not the `{ data, error }` dual-channel like other endpoints)
 * 2. The Success schema expects `{ data: ... }` as input, not just the inner data
 *
 * Features:
 * - Decodes response with Success schema (handles null → Option.none())
 * - Does NOT notify $sessionSignal (read-only operation)
 * - Uses consistent span naming: "core/get-session/handler"
 */
export const Handler = Effect.fn("core/get-session/handler")(function* () {
  const response = yield* Effect.tryPromise({
    try: () => client.getSession(),
    catch: IamError.fromUnknown,
  });

  return yield* S.decodeUnknown(Contract.Success)(response);
});
