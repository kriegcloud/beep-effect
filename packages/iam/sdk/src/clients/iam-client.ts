import type { AuthProviderNameValue } from "@beep/constants";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import type { IamEntityIds } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import { client } from "../adapters";

export class SignInEmailContract extends S.Struct({
  email: BS.Email,
  password: BS.Password,
  rememberMe: BS.BoolWithDefault(false),
}) {}

export namespace SignInEmailContract {
  export type Type = typeof SignInEmailContract.Type;
  export type Encoded = typeof SignInEmailContract.Encoded;
}

const signInEmail = Effect.fn("signInEmail")(
  function* (params: SignInEmailContract.Type) {
    const result = yield* F.pipe(
      params,
      S.encode(SignInEmailContract),
      Effect.flatMap((encoded) => Effect.tryPromise(() => client.signIn.email(encoded)))
    );

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: O.match({
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const signInSocial = Effect.fn("signInSocial")(
  function* (provider: AuthProviderNameValue.Type) {
    const result = yield* Effect.tryPromise(() =>
      client.signIn.social({
        provider,
      })
    );

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: O.match({
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const signInPasskey = Effect.fn("signInPasskey")(
  function* ({ onSuccess }: { onSuccess: () => void }) {
    const result = yield* Effect.tryPromise({
      try: () =>
        client.signIn.passkey({
          fetchOptions: {
            onSuccess() {
              onSuccess();
            },
            onError(context) {
              console.error(context.error);
              throw context.error;
            },
          },
        }),
      catch: IamError.match,
    });

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: "Failed to sign in",
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const signInOneTap = Effect.fn("signInOneTap")(
  function* () {
    yield* Effect.tryPromise(() => client.oneTap());
  },
  withToast({
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: O.match({
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

export class ResetPasswordContract extends S.Struct({
  newPassword: BS.Password,
  confirmPassword: BS.Password,
}).pipe(
  S.filter(
    ({ newPassword, confirmPassword }) =>
      Equal.equals(
        Redacted.value<BS.Password.Encoded>(newPassword),
        Redacted.value<BS.Password.Encoded>(confirmPassword)
      ) || "Passwords do not match"
  )
) {}

export namespace ResetPasswordContract {
  export type Type = typeof ResetPasswordContract.Type;
  export type Encoded = typeof ResetPasswordContract.Encoded;
}
const resetPassword = Effect.fnUntraced(
  function* (params: ResetPasswordContract.Type) {
    const token = yield* F.pipe(
      new URLSearchParams(window.location.search).get("token"),
      O.fromNullable,
      O.match({
        onNone: () => Effect.fail(new Error("No token found")),
        onSome: (token) => Effect.succeed(Redacted.make(token)),
      })
    );

    const result = yield* F.pipe(
      params,
      S.encode(ResetPasswordContract),
      Effect.flatMap(({ newPassword }) =>
        Effect.tryPromise(() =>
          client.resetPassword({
            newPassword,
            token: Redacted.value(token),
          })
        )
      )
    );

    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Resetting password...",
    onSuccess: "Password reset successfully",
    onFailure: O.match({
      onNone: () => "Failed reset password",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const requestPasswordReset = Effect.fn("requestPasswordReset")(
  function* (email: BS.Email.Type) {
    const result = yield* Effect.tryPromise(() =>
      client.requestPasswordReset({
        email: Redacted.value(email),
        redirectTo: "/reset-password",
      })
    );

    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Requesting password reset...",
    onSuccess: "Password reset requested successfully",
    onFailure: O.match({
      onNone: () => "Failed to request password reset",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const sendOtp = Effect.fn("sendOTP")(
  function* () {
    const result = yield* Effect.tryPromise(() => client.twoFactor.sendOtp());
    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "sending Otp...",
    onSuccess: "Otp sent successfully",
    onFailure: O.match({
      onNone: () => "Failed to send one time password",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const verifyOtp = Effect.fn("verifyOtp")(
  function* (code: Redacted.Redacted<string>) {
    const result = yield* Effect.tryPromise(() =>
      client.twoFactor.verifyOtp({
        code: Redacted.value(code),
      })
    );

    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "verifying one time password...",
    onSuccess: "OTP verified successfully",
    onFailure: O.match({
      onNone: () => "Failed to verify one time password",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const verifyTotp = Effect.fn("verifyTotp")(
  function* (totpCode: Redacted.Redacted<string>) {
    const result = yield* Effect.tryPromise(() =>
      client.twoFactor.verifyTotp({
        code: Redacted.value(totpCode),
      })
    );
    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Verifying Totp",
    onSuccess: "Totp verified successfully",
    onFailure: O.match({
      onNone: () => "Failed to verify Totp",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const acceptInvitation = Effect.fn("acceptInvitation")(
  function* (invitationId: IamEntityIds.InvitationId.Type) {
    const result = yield* Effect.tryPromise(() =>
      client.organization.acceptInvitation({
        invitationId: invitationId,
      })
    );

    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Accepting invitation...",
    onSuccess: "Invitation accepted successfully",
    onFailure: O.match({
      onNone: () => "Failed accept invitation",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

const oauth2Register = Effect.fn("oauth2Register")(
  function* (clientName: string) {
    const result = yield* Effect.tryPromise(() =>
      client.oauth2.register({
        client_name: clientName,
        redirect_uris: [""],
      })
    );
    if (result.error) {
      yield* Console.error(result.error);
      return yield* Effect.fail(new IamError(result.error, result.error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Registering OAuth2 Application...",
    onSuccess: "Successfully registered OAuth2 Application",
    onFailure: O.match({
      onNone: () => "Failed register OAuth2  Application",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

export const iam = {
  signIn: {
    email: signInEmail,
    social: signInSocial,
    passkey: signInPasskey,
    oneTap: signInOneTap,
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
