import {client} from "@beep/iam-sdk/adapters";
import {MetadataFactory, withFetchOptions} from "@beep/iam-sdk/clients/_internal";
import {
  SignInContractKit,
  type SignInOAuth2Payload,
  SignInSocialContract, SignInUsernameContract
} from "@beep/iam-sdk/clients/sign-in/sign-in.contracts";
import {makeFailureContinuation} from "@beep/iam-sdk/contract-kit";
import * as Effect from "effect/Effect";
import * as Redacted from "effect/Redacted";
import type {
  SignInEmailPayload,
  SignInPhoneNumberPayload,
} from "./sign-in.contracts";
import {Handler} from "../_internal";

const metadataFactory = new MetadataFactory("sign-in");

const SignInSocialMetadata = metadataFactory.make("social");
const SignInEmailMetadata = metadataFactory.make("email");
const SignInUsernameMetadata = metadataFactory.make("username");
const SignInPhoneNumberMetadata = metadataFactory.make("phoneNumber");
const SignInOneTapMetadata = metadataFactory.make("oneTap");
const SignInPasskeyMetadata = metadataFactory.make("passkey");
const SignInOAuth2Metadata = metadataFactory.make("oauth2");

// =====================================================================================================================
// Sign In Social Handler
// =====================================================================================================================
const SignInSocialHandler = Handler.make({
   metadata: {
     domain: "sign-in",
     method: "social"
   },
  contract: SignInSocialContract,
  effect: (payload) => Effect.gen(function* () {
    const continuation = makeFailureContinuation({
      contract: "SignInSocial",
      metadata: SignInSocialMetadata,
    });
    yield* Effect.flatMap(
      continuation.run((handlers) =>
        client.signIn.social(
          {
            provider: payload.provider,
            callbackURL: payload.callbackURL,
          },
          withFetchOptions(handlers)
        )
      ),
      continuation.raiseResult
    );
  })
});
// =====================================================================================================================
// Sign In Email Handler
// =====================================================================================================================
const SignInEmailHandler = Effect.fn("SignInEmailHandler")(function* (payload: SignInEmailPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignInEmail",
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
});
// =====================================================================================================================
// Sign In Username Handler
// =====================================================================================================================
const SignInUsernameHandler = Effect.fn("SignInUsernameHandler")(function* (payload: typeof SignInUsernameContract.parametersSchema.Type) {
  const {username, password, rememberMe, captchaResponse, callbackURL} = payload;

  const continuation = makeFailureContinuation({
    contract: "SignInUsername",
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
});

// =====================================================================================================================
// Sign In Phone Number Handler
// =====================================================================================================================
const SignInPhoneNumberHandler = Effect.fn("SignInPhoneNumberHandler")(function* (
  payload: SignInPhoneNumberPayload.Type
) {
  const continuation = makeFailureContinuation({
    contract: "SignInPhoneNumber",
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
});
// =====================================================================================================================
// Sign In One Tap Handler
// =====================================================================================================================
const SignInOneTapHandler = Effect.fn("SignInOneTapHandler")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SignInOneTap",
    metadata: SignInOneTapMetadata,
  });
  yield* continuation.run((handlers) =>
    client.oneTap({
      fetchOptions: withFetchOptions(handlers),
    })
  );
});
// =====================================================================================================================
// Sign In Passkey Handler
// =====================================================================================================================
const SignInPasskeyHandler = Effect.fn("SignInPasskey")(function* () {
  const continuation = makeFailureContinuation({
    contract: "SignInPasskey",
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
});

// =====================================================================================================================
// Sign In OAuth 2 Handler
// =====================================================================================================================
const SignInOAuth2Handler = Effect.fn("SignInOAuth2Handler")(function* (payload: SignInOAuth2Payload.Type) {
  const continuation = makeFailureContinuation({
    contract: "SignInOAuth2",
    metadata: SignInOAuth2Metadata,
  });
  const result = yield* continuation.run((handlers) =>
    client.signIn.oauth2({
      ...payload,
      fetchOptions: withFetchOptions(handlers),
    })
  );

  yield* continuation.raiseResult(result);
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
  SignInOAuth2: SignInOAuth2Handler,
});
