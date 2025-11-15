import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  ChangeEmailContract,
  ChangePasswordContract,
  UpdateUserInformationContract,
  UserContractKit,
} from "@beep/iam-sdk/clients/user/user.contracts";
import * as Effect from "effect/Effect";

const ChangeEmailHandler = ChangeEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encoded = yield* ChangeEmailContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.changeEmail({
        newEmail: encoded.newEmail,
        callbackURL: encoded.callbackURL,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const ChangePasswordHandler = ChangePasswordContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encoded = yield* ChangePasswordContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.changePassword({
        newPassword: encoded.newPassword,
        currentPassword: encoded.currentPassword,
        revokeOtherSessions: encoded.revokeOtherSessions,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const UpdateUserInformationHandler = UpdateUserInformationContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encoded = yield* UpdateUserInformationContract.encodePayload(payload);
    const result = yield* continuation.run((handlers) =>
      client.updateUser({
        image: encoded.image,
        name: `${encoded.firstName} ${encoded.lastName}`,
        username: encoded.username,
        displayUsername: encoded.displayUsername,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

export const UserImplementations = UserContractKit.of({
  UpdateUserInformation: UpdateUserInformationHandler,
  ChangeEmail: ChangeEmailHandler,
  ChangePassword: ChangePasswordHandler,
});

export const userLayer = UserContractKit.toLayer(UserImplementations);
