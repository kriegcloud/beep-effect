import { client } from "@beep/iam-sdk/adapters";
import { SignInContractKit } from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type {
  SignInEmailPayload,
  SignInPhoneNumberPayload,
  SignInSocialPayload,
  SignInUsernamePayload,
} from "./sign-in.contracts";

// =====================================================================================================================
// Sign In Social Handler
// =====================================================================================================================
const SignInSocialHandler = Effect.fn("SignInSocialHandler")(function* (payload: SignInSocialPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignInSocial",
    metadata: () => ({
      plugin: "signIn",
      method: "social",
    }),
  });
  yield* Effect.flatMap(
    continuation.run((handlers) =>
      client.signIn.social(
        {
          provider: payload.provider,
          callbackURL: payload.callbackURL,
        },
        handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              onError: handlers.onError,
            }
      )
    ),
    continuation.raiseResult
  );
});
// =====================================================================================================================
// Sign In Email Handler
// =====================================================================================================================
const SignInEmailHandler = Effect.fn("SignInEmailHandler")(function* (payload: SignInEmailPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignInEmail",
    metadata: () => ({
      plugin: "signIn",
      method: "email",
    }),
  });

  const result = yield* continuation.run((handlers) =>
    client.signIn.email({
      email: Redacted.value(payload.email),
      password: Redacted.value(payload.password),
      rememberMe: payload.rememberMe,
      fetchOptions: handlers.signal
        ? {
            headers: {
              "x-captcha-response": Redacted.value(payload.captchaResponse),
            },
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : {
            headers: {
              "x-captcha-response": Redacted.value(payload.captchaResponse),
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
// =====================================================================================================================
// Sign In Username Handler
// =====================================================================================================================
const SignInUsernameHandler = Effect.fn("SignInUsernameHandler")(function* (payload: SignInUsernamePayload.Type) {
  const { username, password, rememberMe, captchaResponse, callbackURL } = payload;

  const continuation = makeFailureContinuation({
    contract: "SignInUsername",
    metadata: () => ({
      plugin: "signIn",
      method: "username",
    }),
  });
  yield* Effect.flatMap(
    continuation.run((handlers) =>
      client.signIn.username({
        username: username,
        password: Redacted.value(password),
        rememberMe: rememberMe,
        callbackURL: callbackURL,
        fetchOptions: handlers.signal
          ? {
              headers: {
                "x-captcha-response": Redacted.value(captchaResponse),
              },
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              headers: {
                "x-captcha-response": Redacted.value(captchaResponse),
              },
              onError: handlers.onError,
            },
      })
    ),
    (result) => {
      if (result.error == null) {
        client.$store.notify("$sessionSignal");
      }
      return continuation.raiseResult(result);
    }
  );
});

// =====================================================================================================================
// Sign In Phone Number Handler
// =====================================================================================================================
const SignInPhoneNumberHandler = Effect.fn("SignInPhoneNumberHandler")(function* (
  payload: SignInPhoneNumberPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "SignInPhoneNumber",
    metadata: () => ({
      plugin: "signIn",
      method: "phoneNumber",
    }),
  });
  yield* Effect.flatMap(
    continuation.run((handlers) =>
      client.signIn.phoneNumber({
        phoneNumber: Redacted.value(payload.phoneNumber),
        password: Redacted.value(payload.password),
        rememberMe: payload.rememberMe,
        fetchOptions: handlers.signal
          ? {
              headers: {
                "x-captcha-response": Redacted.value(payload.captchaResponse),
              },
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : {
              headers: {
                "x-captcha-response": Redacted.value(payload.captchaResponse),
              },
              onError: handlers.onError,
            },
      })
    ),
    (result) => {
      if (result.error == null) {
        client.$store.notify("$sessionSignal");
      }
      return continuation.raiseResult(result);
    }
  );
});
// =====================================================================================================================
// Sign In One Tap Handler
// =====================================================================================================================
const SignInOneTapHandler = Effect.fn("SignInOneTapHandler")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SignInOneTap",
    metadata: () => ({
      plugin: "oneTap",
      method: "signIn",
    }),
  });
  yield* continuation.run((handlers) =>
    client.oneTap({
      fetchOptions: handlers.signal
        ? {
            onError: handlers.onError,
            signal: handlers.signal,
          }
        : { onError: handlers.onError },
    })
  );
});
// =====================================================================================================================
// Sign In Passkey Handler
// =====================================================================================================================
const SignInPasskeyHandler = Effect.fn("SignInPasskey")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SignInPasskey",
    metadata: () => ({
      plugin: "signIn",
      method: "passkey",
    }),
  });

  yield* Effect.flatMap(
    continuation.run((handlers) =>
      client.signIn.passkey({
        fetchOptions: handlers.signal
          ? {
              onError: handlers.onError,
              signal: handlers.signal,
            }
          : { onError: handlers.onError },
      })
    ),
    (result) => {
      if (result.error == null) {
        client.$store.notify("$sessionSignal");
      }
      return continuation.raiseResult(result);
    }
  );
});
// =====================================================================================================================
// Sign In Implementations Service
// =====================================================================================================================
export const SignInImplementations = SignInContractKit.of({
  SignInEmail: SignInEmailHandler,
  SignInSocial: SignInSocialHandler,
  SignInPhoneNumber: SignInPhoneNumberHandler,
  SignInUsername: SignInUsernameHandler,
  SignInPasskey: SignInPasskeyHandler,
  SignInOneTap: SignInOneTapHandler,
});
