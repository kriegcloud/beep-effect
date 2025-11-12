import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  RecoverContractKit,
  RequestResetPasswordContract,
  ResetPasswordContract,
} from "@beep/iam-sdk/clients/recover/recover.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const metadataFactory = new MetadataFactory("recover");

const ResetPasswordMetadata = metadataFactory.make("resetPassword");
const RequestResetPasswordMetadata = metadataFactory.make("requestResetPassword");

const ResetPasswordHandler = ResetPasswordContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: ResetPasswordContract.name,
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
          ResetPasswordMetadata()
        )
      );
    }

    const encoded = yield* ResetPasswordContract.encodeUnknownPayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.resetPassword({
        newPassword: encoded.newPassword,
        token: tokenOption.value,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const RequestPasswordResetHandler = RequestResetPasswordContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: RequestResetPasswordContract.name,
      metadata: RequestResetPasswordMetadata,
    });

    const encoded = yield* RequestResetPasswordContract.encodeUnknownPayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.requestPasswordReset({
        ...encoded,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

export const RecoverImplementations = RecoverContractKit.of({
  ResetPassword: ResetPasswordHandler,
  RequestResetPassword: RequestPasswordResetHandler,
});
