import { client } from "@beep/iam-sdk/adapters";
import {
  OAuth2AuthorizeContract,
  type OAuth2AuthorizePayload,
  OAuth2ClientContract,
  type OAuth2ClientPayload,
  OAuth2ConsentContract,
  type OAuth2ConsentPayload,
  OAuth2RegisterContract,
  type OAuth2RegisterPayload,
  OAuth2TokenContract,
  type OAuth2TokenPayload,
  OAuth2UserInfoContract,
  OidcContractSet,
} from "@beep/iam-sdk/clients/oidc/oidc.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

const OAuth2AuthorizeMetadata = {
  plugin: "oidc-provider",
  method: "authorize",
} as const;

const OAuth2ConsentMetadata = {
  plugin: "oidc-provider",
  method: "consent",
} as const;

const OAuth2TokenMetadata = {
  plugin: "oidc-provider",
  method: "token",
} as const;

const OAuth2UserInfoMetadata = {
  plugin: "oidc-provider",
  method: "userinfo",
} as const;

const OAuth2RegisterMetadata = {
  plugin: "oidc-provider",
  method: "register",
} as const;

const OAuth2ClientMetadata = {
  plugin: "oidc-provider",
  method: "client",
} as const;

const OAuth2AuthorizeHandler = Effect.fn("OAuth2AuthorizeHandler")(
  function* (payload: OAuth2AuthorizePayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OAuth2Authorize",
      metadata: () => OAuth2AuthorizeMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.authorize({
        query: {
          ...payload,
        },
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2AuthorizeHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "authorize",
      });
    }

    return yield* S.decodeUnknown(OAuth2AuthorizeContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2AuthorizeMetadata)),
  })
);

const OAuth2ConsentHandler = Effect.fn("OAuth2ConsentHandler")(
  function* (payload: OAuth2ConsentPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OAuth2Consent",
      metadata: () => OAuth2ConsentMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.consent({
        accept: payload.accept,
        ...(payload.consent_code === undefined ? {} : { consent_code: payload.consent_code }),
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2ConsentHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "consent",
      });
    }

    return yield* S.decodeUnknown(OAuth2ConsentContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2ConsentMetadata)),
  })
);

const OAuth2TokenHandler = Effect.fn("OAuth2TokenHandler")(
  function* (payload: OAuth2TokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OAuth2Token",
      metadata: () => OAuth2TokenMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.token({
        ...payload,
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2TokenHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "token",
      });
    }

    return yield* S.decodeUnknown(OAuth2TokenContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2TokenMetadata)),
  })
);

const OAuth2UserInfoHandler = Effect.fn("OAuth2UserInfoHandler")(
  function* () {
    const continuation = makeFailureContinuation({
      contract: "OAuth2UserInfo",
      metadata: () => OAuth2UserInfoMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.userinfo({
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2UserInfoHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "userinfo",
      });
    }

    return yield* S.decodeUnknown(OAuth2UserInfoContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2UserInfoMetadata)),
  })
);

const OAuth2RegisterHandler = Effect.fn("OAuth2RegisterHandler")(
  function* (payload: OAuth2RegisterPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OAuth2Register",
      metadata: () => OAuth2RegisterMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.register({
        ...payload,
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2RegisterHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "register",
      });
    }

    return yield* S.decodeUnknown(OAuth2RegisterContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2RegisterMetadata)),
  })
);

const OAuth2ClientHandler = Effect.fn("OAuth2ClientHandler")(
  function* (payload: OAuth2ClientPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "OAuth2Client",
      metadata: () => OAuth2ClientMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.oauth2.client[":id"]({
        query: {
          id: payload.id,
        },
        fetchOptions: handlers.signal
          ? { onError: handlers.onError, signal: handlers.signal }
          : { onError: handlers.onError },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data == null) {
      return yield* new IamError({}, "OAuth2ClientHandler returned no payload from Better Auth", {
        plugin: "oidc-provider",
        method: "client",
      });
    }

    return yield* S.decodeUnknown(OAuth2ClientContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, OAuth2ClientMetadata)),
  })
);

export const OidcImplementations = OidcContractSet.of({
  OAuth2Authorize: OAuth2AuthorizeHandler,
  OAuth2Consent: OAuth2ConsentHandler,
  OAuth2Token: OAuth2TokenHandler,
  OAuth2UserInfo: OAuth2UserInfoHandler,
  OAuth2Register: OAuth2RegisterHandler,
  OAuth2Client: OAuth2ClientHandler,
});
