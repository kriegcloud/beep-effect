import { client } from "@beep/iam-sdk/adapters";
import { withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  OAuth2AuthorizeContract,
  OAuth2ClientContract,
  OAuth2ConsentContract,
  OAuth2RegisterContract,
  OAuth2TokenContract,
  OAuth2UserInfoContract,
  OidcContractKit,
} from "@beep/iam-sdk/clients/oidc/oidc.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const OAuth2AuthorizeHandler = OAuth2AuthorizeContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.authorize({
        query: {
          ...payload,
        },
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "OAuth2AuthorizeHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    return yield* OAuth2AuthorizeContract.decodeUnknownSuccess(result.data);
  })
);

const OAuth2ConsentHandler = OAuth2ConsentContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.consent({
        accept: payload.accept,
        ...(payload.consent_code === undefined ? {} : { consent_code: payload.consent_code }),
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "OAuth2ConsentHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    return yield* OAuth2ConsentContract.decodeUnknownSuccess(result.data);
  })
);

const OAuth2TokenHandler = OAuth2TokenContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.token({
        ...payload,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2TokenHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* OAuth2TokenContract.decodeUnknownSuccess(result.data);
  })
);

const OAuth2UserInfoHandler = OAuth2UserInfoContract.implement(
  Effect.fn(function* (_, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.userinfo({
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "OAuth2UserInfoHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    return yield* OAuth2UserInfoContract.decodeUnknownSuccess(result.data);
  })
);

const OAuth2RegisterHandler = OAuth2RegisterContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.register({
        ...payload,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError(
        {},
        "OAuth2RegisterHandler returned no payload from Better Auth",
        continuation.metadata
      );
    }

    return yield* OAuth2RegisterContract.decodeUnknownSuccess(result.data);
  })
);

const OAuth2ClientHandler = OAuth2ClientContract.implement(
  Effect.fn(function* (payload, { continuation }) {
    const result = yield* continuation.run((handlers) =>
      client.oauth2.client[":id"]({
        query: {
          id: payload.id,
        },
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2ClientHandler returned no payload from Better Auth", continuation.metadata);
    }

    return yield* OAuth2ClientContract.decodeUnknownSuccess(result.data);
  })
);

export const OidcImplementations = OidcContractKit.of({
  OAuth2Authorize: OAuth2AuthorizeHandler,
  OAuth2Consent: OAuth2ConsentHandler,
  OAuth2Token: OAuth2TokenHandler,
  OAuth2UserInfo: OAuth2UserInfoHandler,
  OAuth2Register: OAuth2RegisterHandler,
  OAuth2Client: OAuth2ClientHandler,
});

export const oidcLayer = OidcContractKit.toLayer(OidcImplementations);
