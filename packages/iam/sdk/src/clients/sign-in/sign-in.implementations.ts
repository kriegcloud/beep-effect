import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
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

const metadataFactory = new MetadataFactory("sign-in");

const SignInEmailMetadata = metadataFactory.make("email");
const SignInUsernameMetadata = metadataFactory.make("username");
const SignInPhoneNumberMetadata = metadataFactory.make("phoneNumber");
const SignInOneTapMetadata = metadataFactory.make("oneTap");
const SignInPasskeyMetadata = metadataFactory.make("passkey");
const SignInOAuth2Metadata = metadataFactory.make("oauth2");

// =====================================================================================================================
// Sign In Social Handler
// =====================================================================================================================

const SignInSocialHandler = SignInSocialContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation(
      {
        contract: SignInSocialContract.name,
        metadata: metadataFactory.make("social"),
      },
      {
        supportsAbort: true,
      }
    );

    const result = yield* continuation.run((handlers) => client.signIn.social(payload, withFetchOptions(handlers)));

    yield* continuation.raiseResult(result);
  })
);

// =====================================================================================================================
// Sign In Email Handler
// =====================================================================================================================
const SignInEmailHandler = SignInEmailContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: SignInEmailContract.name,
      metadata: SignInEmailMetadata,
    });

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
  Effect.fn(function* (payload) {
    const { username, password, rememberMe, captchaResponse, callbackURL } = payload;

    const continuation = makeFailureContinuation({
      contract: SignInUsernameContract.name,
      metadata: SignInUsernameMetadata,
    });
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
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: SignInPhoneNumberContract.name,
      metadata: SignInPhoneNumberMetadata,
    });
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
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: SignInOneTapContract.name,
      metadata: SignInOneTapMetadata,
    });
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
  Effect.fn(function* () {
    const continuation = makeFailureContinuation({
      contract: SignInPasskeyContract.name,
      metadata: SignInPasskeyMetadata,
    });

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
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: SignInOAuth2Contract.name,
      metadata: SignInOAuth2Metadata,
    });
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
