import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./sign-out.contract";
export const Handler = Effect.fn("core/sign-out/handler")(function* (
  payload?:
    | undefined
    | {
        readonly fetchOptions?: undefined | Common.ClientFetchOption;
      }
) {
  const response = yield* Effect.tryPromise({
    try: () =>
      client.signOut({
        fetchOptions: payload?.fetchOptions,
      }),
    catch: Common.IamError.fromUnknown,
  });

  return yield* S.decodeUnknown(Contract.Success)(response.data);
});

