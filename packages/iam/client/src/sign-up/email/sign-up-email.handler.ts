import { client } from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./sign-up-email.contract.ts";

export const Handler = Effect.fn("signUp.email.handler")(function* (params: {
  readonly payload: Contract.Payload;
  readonly fetchOptions: Common.ClientFetchOption;
}) {
  const encodedPayload = yield* S.encode(Contract.Payload)(params.payload);

  const response = yield* Effect.tryPromise({
    try: () =>
      client.signUp.email({
        ...encodedPayload,
        name: params.payload.name,
        fetchOptions: params.fetchOptions,
      }),
    catch: Common.IamError.fromUnknown,
  });

  return yield* S.decodeUnknown(Contract.Success)(response);
});
