import { client } from "@beep/iam-sdk/adapters";
import {
  type GetAccessTokenPayload,
  GetAccessTokenSuccess,
  type GetAccountInfoPayload,
  GetAccountInfoSuccess,
  LinkSocialContract,
  type LinkSocialPayload,
  OAuthContractKit,
  type RequestAdditionalScopesPayload,
  RequestAdditionalScopesSuccess,
} from "@beep/iam-sdk/clients/oauth/oauth.contracts";
import { makeFailureContinuation } from "@beep/iam-sdk/contract-kit";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { OAuthRegisterPayload } from "./oauth.contracts";

const OAuthRegisterMetadata = {
  plugin: "oauth2",
  method: "register",
} as const;

const LinkSocialMetadata = {
  plugin: "oauth2",
  method: "linkSocial",
} as const;

const GetAccessTokenMetadata = {
  plugin: "oauth2",
  method: "getAccessToken",
} as const;

const GetAccountInfoMetadata = {
  plugin: "oauth2",
  method: "getAccountInfo",
} as const;

const RequestAdditionalScopesMetadata = {
  plugin: "oauth2",
  method: "requestAdditionalScopes",
} as const;

// =====================================================================================================================
// OAuth Register Handler
// =====================================================================================================================
const OAuthRegisterHandler = Effect.fn("OAuthRegisterHandler")(function* (payload: OAuthRegisterPayload.Type) {
  const continuation = makeFailureContinuation({
    contract: "OAuthRegisterContract",
    metadata: () => OAuthRegisterMetadata,
  });

  const encoded = yield* S.encode(OAuthRegisterPayload)(payload).pipe(
    Effect.catchTag("ParseError", (error) => Effect.fail(IamError.match(error, OAuthRegisterMetadata)))
  );

  const result = yield* continuation.run(() => client.oauth2.register(encoded));

  yield* continuation.raiseResult(result);
});

// =====================================================================================================================
// Link Social Handler
// =====================================================================================================================
const LinkSocialHandler = Effect.fn("LinkSocial")(
  function* (payload: LinkSocialPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "LinkSocial",
      metadata: () => LinkSocialMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.linkSocial({
        provider: payload.provider,
        fetchOptions: handlers.signal
          ? {
              signal: handlers.signal,
              onError: handlers.onError,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    return yield* S.decode(LinkSocialContract.successSchema)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, LinkSocialMetadata)),
  })
);
// =====================================================================================================================
// Get Access Token Handler
// =====================================================================================================================
const GetAccessTokenHandler = Effect.fn("GetAccessTokenHandler")(
  function* (payload: GetAccessTokenPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "GetAccessToken",
      metadata: () => GetAccessTokenMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.getAccessToken({
        providerId: payload.providerId,
        accountId: payload.accountId,
        fetchOptions: handlers.signal
          ? {
              signal: handlers.signal,
              onError: handlers.onError,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data === null) {
      return yield* new IamError({}, "GetAccessTokenResult returned null");
    }

    return yield* S.decode(GetAccessTokenSuccess)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, GetAccessTokenMetadata)),
  })
);

// =====================================================================================================================
// Get Account Info Handler
// =====================================================================================================================
const GetAccountInfoHandler = Effect.fn("GetAccountInfoHandler")(
  function* (payload: GetAccountInfoPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "GetAccountInfo",
      metadata: () => GetAccountInfoMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.accountInfo({
        accountId: payload.accountId,
        fetchOptions: handlers.signal
          ? {
              signal: handlers.signal,
              onError: handlers.onError,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(GetAccountInfoSuccess)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, GetAccountInfoMetadata)),
  })
);

// =====================================================================================================================
// Request Additional Scopes Handler
// =====================================================================================================================
const RequestAdditionalScopesHandler = Effect.fn("RequestAdditionalScopesHandler")(
  function* (payload: RequestAdditionalScopesPayload.Type) {
    const continuation = makeFailureContinuation({
      contract: "RequestAdditionalScopes",
      metadata: () => RequestAdditionalScopesMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.linkSocial({
        provider: payload.provider,
        scopes: [...payload.scopes],
        fetchOptions: handlers.signal
          ? {
              signal: handlers.signal,
              onError: handlers.onError,
            }
          : {
              onError: handlers.onError,
            },
      })
    );

    yield* continuation.raiseResult(result);

    return yield* S.decodeUnknown(RequestAdditionalScopesSuccess)(result.data);
  },
  Effect.catchTags({
    ParseError: (error) => Effect.fail(IamError.match(error, RequestAdditionalScopesMetadata)),
  })
);

// =====================================================================================================================
// OAuthImplementations Service
// =====================================================================================================================

export const OAuthImplementations = OAuthContractKit.of({
  OAuthRegister: OAuthRegisterHandler,
  LinkSocial: LinkSocialHandler,
  GetAccessToken: GetAccessTokenHandler,
  GetAccountInfo: GetAccountInfoHandler,
  RequestAdditionalScopes: RequestAdditionalScopesHandler,
});
