import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  SignInContractKit,
  SignInEmailContract,
  SignInOAuth2Contract,
  SignInOneTapContract,
  SignInPasskeyContract,
  SignInPhoneNumberContract,
  SignInSocialContract,
  SignInUsernameContract,
} from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";

// =====================================================================================================================
// Sign In Social Handler
// =====================================================================================================================

const SignInSocialHandler = SignInSocialContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) => client.signIn.social(payload, withFetchOptions(handlers)));

    yield* continuation.raiseResult(result);
  })
);

// =====================================================================================================================
// Sign In Email Handler
// =====================================================================================================================
const SignInEmailHandler = SignInEmailContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.signIn.email({
        email: Redacted.value(payload.email),
        password: Redacted.value(payload.password),
        rememberMe: payload.rememberMe,
        fetchOptions: withFetchOptions(handlers, {
          headers: {
            "x-captcha-response": Redacted.value(payload.captchaResponse),
          },
        }),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.error == null) {
      client.$store.notify("$sessionSignal");
    }
  })
);

// =====================================================================================================================
// Sign In Username Handler
// =====================================================================================================================
const SignInUsernameHandler = SignInUsernameContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const { username, password, rememberMe, captchaResponse, callbackURL } = payload;
    yield* Effect.flatMap(
      continuation.run((handlers) =>
        client.signIn.username({
          username: username,
          password: Redacted.value(password),
          rememberMe: rememberMe,
          callbackURL: callbackURL,
          fetchOptions: withFetchOptions(handlers, {
            headers: {
              "x-captcha-response": Redacted.value(captchaResponse),
            },
          }),
        })
      ),
      (result) => {
        if (result.error == null) {
          client.$store.notify("$sessionSignal");
        }
        return continuation.raiseResult(result);
      }
    );
  })
);

// =====================================================================================================================
// Sign In Phone Number Handler
// =====================================================================================================================
const SignInPhoneNumberHandler = SignInPhoneNumberContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    yield* Effect.flatMap(
      continuation.run((handlers) =>
        client.signIn.phoneNumber({
          phoneNumber: Redacted.value(payload.phoneNumber),
          password: Redacted.value(payload.password),
          rememberMe: payload.rememberMe,
          fetchOptions: withFetchOptions(handlers, {
            headers: {
              "x-captcha-response": Redacted.value(payload.captchaResponse),
            },
          }),
        })
      ),
      (result) => {
        if (result.error == null) {
          client.$store.notify("$sessionSignal");
        }
        return continuation.raiseResult(result);
      }
    );
  })
);
// =====================================================================================================================
// Sign In One Tap Handler
// =====================================================================================================================
const SignInOneTapHandler = SignInOneTapContract.implement(
  Effect.fn(function* (_, { continuation }) {
    yield* continuation.run((handlers) =>
      client.oneTap({
        fetchOptions: withFetchOptions(handlers),
      })
    );
  })
);
// =====================================================================================================================
// Sign In Passkey Handler
// =====================================================================================================================
const SignInPasskeyHandler = SignInPasskeyContract.implement(
  Effect.fn(function* (_, { continuation }) {
    yield* Effect.flatMap(
      continuation.run((handlers) =>
        client.signIn.passkey({
          fetchOptions: withFetchOptions(handlers),
        })
      ),
      (result) => {
        if (result.error == null) {
          client.$store.notify("$sessionSignal");
        }
        return continuation.raiseResult(result);
      }
    );
  })
);

// =====================================================================================================================
// Sign In OAuth 2 Handler
// =====================================================================================================================
const SignInOAuth2Handler = SignInOAuth2Contract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.signIn.oauth2({
        ...payload,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);
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
  SignInOAuth2: SignInOAuth2Handler,
});

// =====================================================================================================================
// Sign In Layer
// =====================================================================================================================
export const signInLayer = SignInContractKit.toLayer(SignInImplementations);
