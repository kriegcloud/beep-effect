import { client } from "@beep/iam-client/adapters";
import { addFetchOptions, withFetchOptions } from "@beep/iam-client/clients/_internal";
import {
  RecoverContractKit,
  RequestResetPasswordContract,
  ResetPasswordContract,
} from "@beep/iam-client/clients/recover/recover.contracts";
import { IamError } from "@beep/iam-client/errors";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const ResetPasswordHandler = ResetPasswordContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const token = new URLSearchParams(window.location.search).get("token");
    const tokenOption = O.fromNullable(token);

    if (O.isNone(tokenOption)) {
      return yield* Effect.fail(
        IamError.new(
          {
            id: "reset-password-token",
            resource: "reset-password-token",
          },
          "No token found",
          continuation.metadata
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
  Effect.fn(function* (payload, { continuation }) {
    const encoded = yield* RequestResetPasswordContract.encodeUnknownPayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.requestPasswordReset(addFetchOptions(handlers, encoded))
    );

    yield* continuation.raiseResult(result);
  })
);

export const RecoverImplementations = RecoverContractKit.of({
  ResetPassword: ResetPasswordHandler,
  RequestResetPassword: RequestPasswordResetHandler,
});

export const recoverLayer = RecoverContractKit.toLayer(RecoverImplementations);
