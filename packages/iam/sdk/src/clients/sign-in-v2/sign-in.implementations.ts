import {client} from "@beep/iam-sdk/adapters";
import {makeFailureContinuation} from "@beep/iam-sdk/contractkit";
import {IamError} from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import {SignInContractSet} from "@beep/iam-sdk/clients/sign-in-v2/sign-in.contracts";
import type {
  SignInEmailPayload,
  SignInSocialPayload,
  SignInPhoneNumberPayload,
  SignInUsernamePayload,
} from "./sign-in.contracts";

const SignInSocialHandler = Effect.fn("SignInSocialHandler")(function* (payload: SignInSocialPayload.Type) {
  let error: IamError | undefined = undefined;

  const result = yield* Effect.tryPromise({
    try: () =>
      client.signIn.social({
        provider: payload.provider,
        callbackURL: payload.callbackURL,
      }, {
        onError: (ctx) => {
          error = IamError.match(ctx.error);
        }
      }),
    catch: (e) =>
      new IamError(e, "Some error occurred while making the request", {
        plugin: "sign-in",
        method: "email",
      }),
  });

  if (error) {
    return yield* Effect.fail(error);
  }

  if (result.error) {
    return yield* Effect.fail(IamError.match(result.error));
  }
});

const SignInEmailHandler = Effect.fn("SignInEmailHandler")(function* (args: SignInEmailPayload.Type) {
  let captchaToken: string | null = null;
  if (Str.isString(args.captchaResponse)) {
    captchaToken = args.captchaResponse;
  } else if (args.captchaResponse) {
    captchaToken = Redacted.value(args.captchaResponse);
  }

  if (!captchaToken) {
    return yield* new IamError("MissingCaptchaResponse", "Captcha verification failed", {
      plugin: "sign-in",
      method: "email",
    });
  }

  const continuation = makeFailureContinuation({
    contract: "SignInEmailContract",
    metadata: () => ({
      plugin: "sign-in",
      method: "email",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.signIn.email({
      email: Redacted.value(args.email),
      password: Redacted.value(args.password),
      rememberMe: args.rememberMe,
      fetchOptions: handlers.signal
        ? {
            headers: {
              "x-captcha-response": captchaToken,
            },
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            headers: {
              "x-captcha-response": captchaToken,
            },
            onError: handlers.onError,
          },
    })
  );

  yield* continuation.raiseResult(result);

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }
});

const SignInUsernameHandler = Effect.fn("SignInUsernameHandler")(function* (payload: SignInUsernamePayload.Type) {
  const {username, password, rememberMe, captchaResponse, callbackURL} = payload;
  let error: IamError | undefined = undefined;

  const result = yield* Effect.tryPromise({
    try: () =>
      client.signIn.username({
        username: username,
        password: Redacted.value(password),
        rememberMe: rememberMe,
        callbackURL: callbackURL,
        fetchOptions: {
          headers: {
            "x-captcha-response": Redacted.value(captchaResponse),
          },
          onError: (ctx) => {
            error = IamError.match(ctx.error);
          },
        },
      }),
    catch: (e) =>
      new IamError(e, "Some error occurred while making the request", {
        plugin: "sign-in",
        method: "email",
      }),
  });

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  if (error) {
    return yield* Effect.fail(error);
  }
});

const SignInPhoneNumberHandler = Effect.fn("SignInPhoneNumberHandler")(function* (payload: SignInPhoneNumberPayload.Type) {
  let error: undefined | IamError = undefined;
  const result = yield* Effect.tryPromise({
    try: () => client.signIn.phoneNumber({
      phoneNumber: Redacted.value(payload.phoneNumber),
      password: Redacted.value(payload.password),
      rememberMe: payload.rememberMe,
      fetchOptions: {
        headers: {
          "x-captcha-response": Redacted.value(payload.captchaResponse),
        },
        onError: (ctx) => {
          error = IamError.match(ctx.error);
        },
      },
    }),
    catch: (e) => new IamError(e, "Some error occurred while making the request", {
      plugin: "sign-in",
      method: "email",
    }),
  });

  if (result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  if (error) {
    return yield* Effect.fail(error);
  }
});

const SignInOneTapHandler = Effect.fn("SignInOneTapHandler")(function* () {
  let error: undefined | IamError = undefined;
  yield* Effect.tryPromise({
    try: () => client.oneTap({
      fetchOptions: {
        onError: (ctx) => {
          error = IamError.match(ctx.error);
        }
      }
    }),
    catch: (e) => new IamError(e, "Some error occurred while making the request", {
      plugin: "sign-in",
      method: "email",
    }),
  });

  if (!error) {
    client.$store.notify("$sessionSignal");
  }

  if (error) {
    return yield* Effect.fail(error);
  }
});

const SignInPasskeyHandler = Effect.fn("SignInPasskey")(function* () {
  let error: undefined | IamError = undefined;
  const result = yield* Effect.tryPromise({
    try: () => client.signIn.passkey({
      fetchOptions: {
        onError: (ctx) => {
          error = IamError.match(ctx.error);
        }
      }
    }),
    catch: (e) => new IamError(e, "Some error occurred while making the request", {
      plugin: "sign-in",
      method: "email",
    }),
  });

  if (!error && result.error == null) {
    client.$store.notify("$sessionSignal");
  }

  if (error) {
    return yield* Effect.fail(error);
  }

  if (result.error) {
    return yield* Effect.fail(IamError.match(result.error));
  }
}, Effect.asVoid);


export const SignInImplementations = SignInContractSet.of({
  SignInEmailContract: SignInEmailHandler,
  SignInSocialContract: SignInSocialHandler,
  SignInPhoneNumberContract: SignInPhoneNumberHandler,
  SignInUsernameContract: SignInUsernameHandler,
  SignInPasskeyContract: SignInPasskeyHandler,
  SignInOneTapContract: SignInOneTapHandler,
});
