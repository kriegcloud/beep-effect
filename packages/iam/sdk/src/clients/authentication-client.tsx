import type { AuthProviderNameValue } from "@beep/constants";
import type { BS } from "@beep/schema";
import type { IamEntityIds } from "@beep/shared-domain";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import { client } from "../adapters";

export const signInEmail = Effect.tryPromise({
  try: () =>
    client.signIn.email({
      email: "",
      password: "",
    }),
  catch: (e) => {},
});

export const signInSocial = Effect.fn("signInSocial")(function* (provider: AuthProviderNameValue.Type) {
  return yield* Effect.tryPromise({
    try: () =>
      client.signIn.social({
        provider,
      }),
    catch: (e) => {},
  });
});

export const signInPasskey = Effect.fn("signInPasskey")(function* () {
  return yield* Effect.tryPromise({
    try: () => client.signIn.passkey(),
    catch: (e) => {},
  });
});

export const oneTapSignIn = Effect.fn("oneTapSignIn")(function* () {
  return yield* Effect.tryPromise({
    try: () => client.oneTap(),
    catch: (e) => {},
  });
});

export const resetPassword = Effect.fnUntraced(function* (newPassword: BS.Password.Type) {
  const token = yield* F.pipe(
    new URLSearchParams(window.location.search).get("token"),
    O.fromNullable,
    O.match({
      onNone: () => Effect.fail(new Error("No token found")),
      onSome: (token) => Effect.succeed(token),
    })
  );

  return yield* Effect.tryPromise({
    try: () =>
      client.resetPassword({
        newPassword,
        token,
      }),
    catch: (e) => {},
  });
});

export const requestPasswordReset = Effect.fn("requestPasswordReset")(function* (email: BS.Email.Type) {
  return yield* Effect.tryPromise({
    try: () =>
      client.requestPasswordReset({
        email: Redacted.value(email),
        redirectTo: "/reset-password",
      }),
    catch: (e) => {},
  });
});

export const sendOtp = Effect.fn("sendOTP")(function* () {
  return yield* Effect.tryPromise({
    try: () => client.twoFactor.sendOtp(),
    catch: (e) => {},
  });
});

export const verifyOtp = Effect.fn("verifyOtp")(function* (code: Redacted.Redacted<string>) {
  return yield* Effect.tryPromise({
    try: () =>
      client.twoFactor.verifyOtp({
        code: Redacted.value(code),
      }),
    catch: (e) => {},
  });
});

export const verifyTotp = Effect.fn("verifyTotp")(function* (totpCode: Redacted.Redacted<string>) {
  return yield* Effect.tryPromise({
    try: () =>
      client.twoFactor.verifyTotp({
        code: Redacted.value(totpCode),
      }),
    catch: (e) => {},
  });
});

export const acceptInvitation = Effect.fn("acceptInvitation")(function* (invitationId: IamEntityIds.InvitationId.Type) {
  return yield* Effect.tryPromise({
    try: () =>
      client.organization.acceptInvitation({
        invitationId: invitationId,
      }),
    catch: (e) => {},
  });
});

export const oauth2Register = Effect.fn("oauth2Register")(function* (clientName: string) {
  return yield* Effect.tryPromise({
    try: () =>
      client.oauth2.register({
        client_name: clientName,
        redirect_uris: [""],
      }),
    catch: (e) => {},
  });
});
