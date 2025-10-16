import { client } from "@beep/iam-sdk/adapters";
import { RecoverContractSet } from "@beep/iam-sdk/clients/recover/recover.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contractkit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RequestResetPasswordPayload, ResetPasswordPayload } from "./recover.contracts";

const ResetPasswordHandler = Effect.fn("ResetPasswordHandler")(function* (payload: ResetPasswordPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "ResetPasswordContract",
    metadata: () => ({
      plugin: "reset-password",
      method: "submit",
    }),
  });

  const token = new URLSearchParams(window.location.search).get("token");
  const tokenOption = O.fromNullable(token);

  if (O.isNone(tokenOption)) {
    return yield* Effect.fail(
      new IamError(
        {
          id: "reset-password-token",
          resource: "reset-password-token",
        },
        "No token found",
        {
          plugin: "reset-password",
          method: "submit",
        }
      )
    );
  }

  const encoded = yield* S.encode(ResetPasswordPayload)(payload).pipe(
    Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))
  );

  const result = yield* continuation.run(() =>
    client.resetPassword({
      newPassword: encoded.newPassword,
      token: tokenOption.value,
    })
  );

  yield* continuation.raiseResult(result);
});

const RequestPasswordResetHandler = Effect.fn("RequestPasswordResetHandler")(function* (
  payload: RequestResetPasswordPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "RequestResetPasswordContract",
    metadata: () => ({
      plugin: "reset-password",
      method: "request",
    }),
  });

  const encoded = yield* S.encode(RequestResetPasswordPayload)(payload).pipe(
    Effect.catchTag("ParseError", (e) => Effect.dieMessage(e.message))
  );

  const result = yield* continuation.run(() => client.requestPasswordReset(encoded));

  yield* continuation.raiseResult(result);
});

export const RecoverImplementations = RecoverContractSet.of({
  ResetPasswordContract: ResetPasswordHandler,
  RequestResetPasswordContract: RequestPasswordResetHandler,
});
