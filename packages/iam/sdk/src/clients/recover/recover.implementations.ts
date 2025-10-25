import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import { RecoverContractKit } from "@beep/iam-sdk/clients/recover/recover.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { RequestResetPasswordPayload, ResetPasswordPayload } from "./recover.contracts";

const metadataFactory = new MetadataFactory("recover");

const ResetPasswordMetadata = metadataFactory.make("resetPassword");
const RequestResetPasswordMetadata = metadataFactory.make("requestResetPassword");

const ResetPasswordHandler = Effect.fn("ResetPasswordHandler")(function* (payload: ResetPasswordPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "ResetPasswordContract",
    metadata: ResetPasswordMetadata,
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
    Effect.catchTag("ParseError", (error) => Effect.fail(IamError.match(error, ResetPasswordMetadata())))
  );

  const result = yield* continuation.run((handlers) =>
    client.resetPassword({
      newPassword: encoded.newPassword,
      token: tokenOption.value,
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

const RequestPasswordResetHandler = Effect.fn("RequestPasswordResetHandler")(function* (
  payload: RequestResetPasswordPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "RequestResetPasswordContract",
    metadata: RequestResetPasswordMetadata,
  });

  const encoded = yield* S.encode(RequestResetPasswordPayload)(payload).pipe(
    Effect.catchTag("ParseError", (error) => Effect.fail(IamError.match(error, RequestResetPasswordMetadata())))
  );

  const result = yield* continuation.run((handlers) =>
    client.requestPasswordReset({
      ...encoded,
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
});

export const RecoverImplementations = RecoverContractKit.of({
  ResetPassword: ResetPasswordHandler,
  RequestResetPassword: RequestPasswordResetHandler,
});
