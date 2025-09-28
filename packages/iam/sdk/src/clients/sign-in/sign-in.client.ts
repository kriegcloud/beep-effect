import { withToast } from "@beep/ui/common/with-toast";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { client } from "../../adapters";
import { IamError } from "../../errors";
import {
  SignInEmailContract,
  SignInPhoneNumberContract,
  type SignInSocialContract,
  SignInUsernameContract,
} from "./sign-in.contract";

const signInEmail = Effect.fn("signInEmail")(
  function* (params: SignInEmailContract.Type) {
    const result = yield* F.pipe(
      params,
      S.encode(SignInEmailContract),
      Effect.flatMap((encoded) => Effect.tryPromise(() => client.signIn.email(encoded)))
    );

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

const signInUsername = Effect.fn("signInUsername")(
  function* (params: SignInUsernameContract.Type) {
    const result = yield* F.pipe(
      params,
      S.encode(SignInUsernameContract),
      Effect.flatMap((encoded) => Effect.tryPromise(() => client.signIn.username(encoded)))
    );

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

const signInPhoneNumber = Effect.fn("signInPhoneNumber")(
  function* (params: SignInPhoneNumberContract.Type) {
    const result = yield* F.pipe(
      params,
      S.encode(SignInPhoneNumberContract),
      Effect.flatMap((encoded) => Effect.tryPromise(() => client.signIn.phoneNumber(encoded)))
    );

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

const signInSocial = Effect.fn("signInSocial")(
  function* ({ provider }: SignInSocialContract.Type) {
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

export const signInClient = {
  email: signInEmail,
  username: signInUsername,
  phoneNumber: signInPhoneNumber,
  social: signInSocial,
  passkey: signInPasskey,
  oneTap: signInOneTap,
} as const;
