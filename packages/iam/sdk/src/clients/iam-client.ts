import type { AuthProviderNameValue } from "@beep/constants";
import { IamError } from "@beep/iam-sdk/errors";
import type { BS } from "@beep/schema";
import type { IamEntityIds } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import { client } from "../adapters";

const signInEmail = Effect.fn("signInEmail")(
  function* (params: { email: BS.Email.Type; password: Redacted.Redacted<BS.Password.Type> }) {
    return yield* Effect.tryPromise({
      try: () =>
        client.signIn.email({
          email: Redacted.value(params.email),
          password: Redacted.value(params.password),
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Signing in...",
    onSuccess: () => "Signed in successfully",
    onFailure: () => "Failed to sign in",
  }),
  Effect.catchAll(Console.error)
);

const signInSocial = Effect.fn("signInSocial")(
  function* (provider: AuthProviderNameValue.Type) {
    return yield* Effect.tryPromise({
      try: () =>
        client.signIn.social({
          provider,
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Signing in...",
    onSuccess: () => "Signed in successfully",
    onFailure: () => "Failed to sign in",
  }),
  Effect.catchAll(Console.error)
);

const signInPasskey = Effect.fn("signInPasskey")(
  function* () {
    return yield* Effect.tryPromise({
      try: () => client.signIn.passkey(),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Signing in...",
    onSuccess: () => "Signed in successfully",
    onFailure: () => "Failed to sign in",
  }),
  Effect.catchAll(Console.error)
);

const oneTapSignIn = Effect.fn("oneTapSignIn")(
  function* () {
    return yield* Effect.tryPromise({
      try: () => client.oneTap(),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Signing in...",
    onSuccess: () => "Signed in successfully",
    onFailure: () => "Failed to sign in",
  }),
  Effect.catchAll(Console.error)
);

const resetPassword = Effect.fnUntraced(
  function* (newPassword: BS.Password.Type) {
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
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Resetting password...",
    onSuccess: () => "Password reset successfully",
    onFailure: () => "Failed to reset password",
  }),
  Effect.catchAll(Console.error)
);

const requestPasswordReset = Effect.fn("requestPasswordReset")(
  function* (email: BS.Email.Type) {
    return yield* Effect.tryPromise({
      try: () =>
        client.requestPasswordReset({
          email: Redacted.value(email),
          redirectTo: "/reset-password",
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Requesting password reset...",
    onSuccess: () => "Password reset requested successfully",
    onFailure: () => "Failed to request password reset",
  }),
  Effect.catchAll(Console.error)
);

const sendOtp = Effect.fn("sendOTP")(
  function* () {
    return yield* Effect.tryPromise({
      try: () => client.twoFactor.sendOtp(),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "sending Otp...",
    onSuccess: () => "Otp sent successfully",
    onFailure: () => "Failed to send Otp",
  }),
  Effect.catchAll(Console.error)
);

const verifyOtp = Effect.fn("verifyOtp")(
  function* (code: Redacted.Redacted<string>) {
    return yield* Effect.tryPromise({
      try: () =>
        client.twoFactor.verifyOtp({
          code: Redacted.value(code),
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Sending OTP...",
    onSuccess: () => "OTP sent successfully",
    onFailure: () => "Failed to send OTP",
  }),
  Effect.catchAll(Console.error)
);

const verifyTotp = Effect.fn("verifyTotp")(
  function* (totpCode: Redacted.Redacted<string>) {
    return yield* Effect.tryPromise({
      try: () =>
        client.twoFactor.verifyTotp({
          code: Redacted.value(totpCode),
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Verifying Totp",
    onSuccess: () => "Totp verified successfully",
    onFailure: () => "Failed to verify Totp",
  }),
  Effect.catchAll(Console.error)
);

const acceptInvitation = Effect.fn("acceptInvitation")(
  function* (invitationId: IamEntityIds.InvitationId.Type) {
    return yield* Effect.tryPromise({
      try: () =>
        client.organization.acceptInvitation({
          invitationId: invitationId,
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: () => "Accepting invitation...",
    onSuccess: () => "Invitation accepted successfully",
    onFailure: () => "Failed to accept invitation",
  }),
  Effect.catchAll(Console.error)
);

const oauth2Register = Effect.fn("oauth2Register")(
  function* (clientName: string) {
    return yield* Effect.tryPromise({
      try: () =>
        client.oauth2.register({
          client_name: clientName,
          redirect_uris: [""],
        }),
      catch: IamError.match,
    });
  },
  withToast({
    onWaiting: "Registering OAuth2 Application...",
    onSuccess: "Successfully registered OAuth2 Application",
    onFailure: "Failed to register OAuth2 Application",
  }),
  Effect.catchAll(Console.error)
);

export const iam = {
  signIn: {
    email: signInEmail,
    social: signInSocial,
    passkey: signInPasskey,
    oneTap: oneTapSignIn,
  },
  resetPassword,
  requestPasswordReset,
  sendOtp,
  twoFactor: {
    verifyOtp,
    verifyTotp,
  },
  organization: {
    acceptInvitation,
  },
  oauth2: {
    register: oauth2Register,
  },
} as const;
