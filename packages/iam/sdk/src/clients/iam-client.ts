import { type AuthProviderNameValue, paths } from "@beep/constants";
import { createBetterAuthHandler } from "@beep/iam-sdk/better-auth/handler";
import { IamError } from "@beep/iam-sdk/errors";
import { BS } from "@beep/schema";
import type { IamEntityIds } from "@beep/shared-domain";
import { withToast } from "@beep/ui/common";
import * as Effect from "effect/Effect";
import * as Equal from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
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

export const mapBetterAuthResult = <Output>(
  result:
    | { readonly data: Output; readonly error: null }
    | {
        readonly data: null;
        readonly error: NonNullable<unknown>;
      }
) => (result.error ? { error: result.error } : ({ data: result.data } as const));

const signInEmail = createBetterAuthHandler<SignInEmailContract.Type, SignInEmailContract.Encoded>({
  name: "signInEmail",
  plugin: "sign-in",
  method: "email",
  schema: SignInEmailContract,
  run: async (encoded) => mapBetterAuthResult(await client.signIn.email(encoded)),
  toast: {
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: {
      onNone: () => "Failed to signin",
      onSome: (e) => e.message,
    },
  },
  defaultErrorMessage: "Failed to signin",
});
/**
 * onFailure: (error) => ({
 *   onNone: () => "Failed to signin",
 *   onSome: (e) => e.message,
 * })
 */
const signInSocial = Effect.fn("signInSocial")(
  function* (provider: AuthProviderNameValue.Type) {
    const result = yield* Effect.tryPromise({
      try: () =>
        client.signIn.social({
          provider,
        }),
      catch: IamError.match,
    });

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to signin"));
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
    let error: Record<string, any> & {
      message: string;
    } = {
      message: "failed to sign in with passkey",
    };
    const result = yield* Effect.tryPromise({
      try: () =>
        client.signIn.passkey({
          fetchOptions: {
            onSuccess() {
              onSuccess();
            },
            onError(context) {
              error = context.error;
              throw context.error;
            },
          },
        }),
      catch: (e) => new IamError(e, error.message),
    });

    if (result.error) {
      yield* Effect.logError(JSON.stringify(result.error, null, 2));
      return yield* Effect.fail(new IamError(result.error, error.message));
    }

    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Signing in...",
    onSuccess: "Signed in successfully",
    onFailure: O.match({
      onNone: () => "Failed to sign in with passkey.",
      onSome: (e) => e.customMessage,
    }),
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
  password: BS.Password,
  passwordConfirm: BS.Password,
}).pipe(
  S.filter(
    ({ password, passwordConfirm }) =>
      Equal.equals(
        Redacted.value<BS.Password.Encoded>(password),
        Redacted.value<BS.Password.Encoded>(passwordConfirm)
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
        onNone: () =>
          Effect.fail(
            new IamError(
              {
                id: "reset-password-token",
                resource: "reset-password-token",
              },
              "No token found"
            )
          ),
        onSome: (token) => Effect.succeed(Redacted.make(token)),
      })
    );

    const result = yield* F.pipe(
      params,
      S.encode(ResetPasswordContract),
      Effect.flatMap(({ password }) =>
        Effect.tryPromise(() =>
          client.resetPassword({
            newPassword: password,
            token: Redacted.value(token),
          })
        )
      )
    );

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to reset password"));
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

export class RequestPasswordResetContract extends BS.Class<ResetPasswordContract>("RequestPasswordResetContract")({
  email: BS.Email,
  redirectTo: BS.StringWithDefault(paths.auth.requestResetPassword),
}) {}

export namespace RequestPasswordResetContract {
  export type Type = typeof RequestPasswordResetContract.Type;
  export type Encoded = typeof RequestPasswordResetContract.Encoded;
}

const requestPasswordReset = Effect.fn("requestPasswordReset")(
  function* (value: RequestPasswordResetContract.Type) {
    const result = yield* Effect.flatMap(S.encode(RequestPasswordResetContract)(value), (encoded) =>
      Effect.tryPromise({
        try: () => client.requestPasswordReset(encoded),
        catch: IamError.match,
      })
    );

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to request password reset"));
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
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to send one time password"));
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
      return yield* Effect.fail(
        new IamError(result.error, result.error.message ?? "Failed to verify one time password")
      );
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
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to verify Totp"));
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
    const result = yield* Effect.tryPromise({
      try: () =>
        client.organization.acceptInvitation({
          invitationId: invitationId,
        }),
      catch: IamError.match,
    });

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to accept invitation"));
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
    const result = yield* Effect.tryPromise({
      try: () =>
        client.oauth2.register({
          client_name: clientName,
          redirect_uris: [""],
        }),
      catch: IamError.match,
    });
    if (result.error) {
      return yield* Effect.fail(
        new IamError(result.error, result.error.message ?? "Failed to register OAuth2 Application")
      );
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
const formSchema = S.Struct({
  email: BS.Email,
  rememberMe: BS.BoolWithDefault(false),
  redirectTo: BS.StringWithDefault(paths.root),
  password: BS.Password,
  passwordConfirm: BS.Password,
  firstName: S.NonEmptyTrimmedString,
  lastName: S.NonEmptyTrimmedString,
});
const withName = S.Struct({ ...formSchema.fields, name: S.String });
export const SignupContract = S.transformOrFail(formSchema, withName, {
  strict: true,
  decode: (value, _, ast) =>
    ParseResult.try({
      try: () => {
        const name = `${value.firstName} ${value.lastName}`;
        return S.encodeSync(withName)({ ...value, name });
      },
      catch: () => new ParseResult.Type(ast, value, "could not decode signup"),
    }),
  encode: (value, _, ast) =>
    ParseResult.try({
      try: () => {
        return S.decodeSync(formSchema)(Struct.omit(value, "name"));
      },
      catch: () => new ParseResult.Type(ast, value, "could not encode signup"),
    }),
});

export namespace SignupContract {
  export type Type = typeof SignupContract.Type;
  export type Encoded = typeof SignupContract.Encoded;
}

const signUpEmail = Effect.fn("signUpEmail")(
  function* (value: SignupContract.Type) {
    const result = yield* F.pipe(
      value,
      S.encode(SignupContract),
      Effect.flatMap((encoded) =>
        Effect.tryPromise({
          try: () => client.signUp.email({ ...encoded, name: value.name }),
          catch: IamError.match,
        })
      )
    );

    if (result.error) {
      return yield* Effect.fail(new IamError(result.error, result.error.message ?? "Failed to signup"));
    }
    return result.data;
  },
  withToast({
    onWaiting: "Signing up...",
    onSuccess: "Welcome to traveler.",
    onFailure: O.match({
      onNone: () => "Failed to signup for unknown reason",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

export class VerifyEmailContract extends BS.Class<VerifyEmailContract>("VerifyEmailContract")({
  email: BS.Email,
}) {}

export namespace VerifyEmailContract {
  export type Type = typeof VerifyEmailContract.Type;
  export type Encoded = typeof RequestPasswordResetContract.Encoded;
}

const verifyEmail = Effect.fn("verifyEmail")(
  function* (value: VerifyEmailContract.Type) {
    const result = yield* Effect.flatMap(S.encode(VerifyEmailContract)(value), (encoded) =>
      Effect.tryPromise({
        try: () => client.sendVerificationEmail(encoded),
        catch: IamError.match,
      })
    ).pipe(
      Effect.catchTag("ParseError", () => Effect.dieMessage(`Failed to encode from ${JSON.stringify(value, null, 2)}`))
    );

    if (result.error) {
      return yield* Effect.fail(
        new IamError(result.error, result.error.message ?? "Failed to send verification email")
      );
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Sending verification email...",
    onSuccess: "Email verification sent successfully",
    onFailure: O.match({
      onNone: () => "Failed to send verification email",
      onSome: (e) => e.message,
    }),
  }),
  Effect.catchAll(() => Effect.succeed(undefined)),
  Effect.asVoid
);

export class VerifyPhoneContract extends BS.Class<VerifyPhoneContract>("VerifyPhoneContract")({
  phoneNumber: BS.Phone,
  code: S.Redacted(S.NonEmptyTrimmedString),
  updatePhoneNumber: BS.BoolWithDefault(true),
}) {}

export namespace VerifyPhoneContract {
  export type Type = typeof VerifyPhoneContract.Type;
  export type Encoded = typeof RequestPasswordResetContract.Encoded;
}

const verifyPhone = Effect.fn("verifyPhone")(
  function* (value: VerifyPhoneContract.Type) {
    const result = yield* Effect.flatMap(S.encode(VerifyPhoneContract)(value), (encoded) =>
      Effect.tryPromise({
        try: () => client.phoneNumber.verify(encoded),
        catch: IamError.match,
      })
    ).pipe(
      Effect.catchTag("ParseError", () => Effect.dieMessage(`Failed to encode from ${JSON.stringify(value, null, 2)}`))
    );

    if (result.error) {
      return yield* Effect.fail(
        new IamError(result.error, result.error.message ?? "Failed to send phone number verification")
      );
    }
    return yield* Effect.succeed(result.data);
  },
  withToast({
    onWaiting: "Sending phone number verification...",
    onSuccess: "Phone number verification sent successfully",
    onFailure: O.match({
      onNone: () => "Failed to send phone number verification for an unknown reason",
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
  signUp: {
    email: signUpEmail,
  },
  verify: {
    email: verifyEmail,
    phone: verifyPhone,
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
