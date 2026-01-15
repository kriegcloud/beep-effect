import {client} from "@beep/iam-client/adapters";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as Common from "../../_common";
import * as Contract from "./sign-in-email.contract";
import * as P from "effect/Predicate";

export const Handler = Effect.fn("sign-in/email/handler")(function* ({
                                                                       payload,
                                                                       fetchOptions,
                                                                     }: {
  payload: Contract.Payload;
  fetchOptions: Common.ClientFetchOption;
}) {
  const payloadEncoded = yield* S.encode(Contract.Payload)(payload);
  const response = yield* Effect.tryPromise({
    try: () =>
      client.signIn.email({
        ...payloadEncoded,
        fetchOptions,
      }),
    catch: Common.IamError.fromUnknown,
  });
  if (P.isNullable(response.error)) {
    client.$store.notify("$sessionSignal");
  }
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
