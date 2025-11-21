import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  ChangeEmailContract,
  ChangePasswordContract,
  UpdatePhoneNumberContract,
  UpdateUserIdentityContract,
  UpdateUserInformationContract,
  UpdateUsernameContract,
  UserContractKit,
} from "@beep/iam-sdk/clients/user/user.contracts";
import * as Console from "effect/Console";
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
    yield* Console.log("ChangePasswordHandler Payload: ", JSON.stringify(payload, null, 2));
    const encoded = yield* ChangePasswordContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.changePassword({
        newPassword: encoded.password,
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

const UpdateUserIdentityHandler = UpdateUserIdentityContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.updateUser({
        name: `${payload.firstName} ${payload.lastName}`,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const UpdateUsernameHandler = UpdateUsernameContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encodedPayload = yield* UpdateUsernameContract.encodePayload(payload);
    const result = yield* continuation.run((handlers) =>
      client.updateUser({
        username: encodedPayload.username,
        displayUsername: encodedPayload.displayUsername,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

const UpdatePhoneNumberHandler = UpdatePhoneNumberContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const encodedPayload = yield* UpdatePhoneNumberContract.encodePayload(payload);
    const result = yield* continuation.run((handlers) =>
      client.updateUser({
        phoneNumber: encodedPayload.phoneNumber,
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
  UpdateUserIdentity: UpdateUserIdentityHandler,
  UpdateUsername: UpdateUsernameHandler,
  UpdatePhoneNumber: UpdatePhoneNumberHandler,
});

export const userLayer = UserContractKit.toLayer(UserImplementations);
