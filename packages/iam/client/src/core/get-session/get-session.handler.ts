import {client} from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./get-session.contract.ts";

export const Handler = Effect.fn("core/get-session")(function* () {
  const response = yield* Effect.tryPromise({
    try: () => client.getSession(),
    catch: Common.IamError.fromUnknown,
  });

  return yield* S.decodeUnknown(Contract.Success)(response);
});