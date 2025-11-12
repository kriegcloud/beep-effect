import { client } from "@beep/iam-sdk/adapters";
import { MetadataFactory, makeFailureContinuation, withFetchOptions } from "@beep/iam-sdk/clients/_internal";
import {
  GetAccessTokenContract,
  GetAccountInfoContract,
  LinkSocialContract,
  OAuthContractKit,
  OAuthRegisterContract,
  RequestAdditionalScopesContract,
} from "@beep/iam-sdk/clients/oauth/oauth.contracts";
import { IamError } from "@beep/iam-sdk/errors";
import * as Effect from "effect/Effect";

const metadataFactory = new MetadataFactory("oauth2");

const OAuthRegisterMetadata = metadataFactory.make("register");
const LinkSocialMetadata = metadataFactory.make("linkSocial");
const GetAccessTokenMetadata = metadataFactory.make("getAccessToken");
const GetAccountInfoMetadata = metadataFactory.make("getAccountInfo");
const RequestAdditionalScopesMetadata = metadataFactory.make("requestAdditionalScopes");

// =====================================================================================================================
// OAuth Register Handler
// =====================================================================================================================
const OAuthRegisterHandler = OAuthRegisterContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: OAuthRegisterContract.name,
      metadata: OAuthRegisterMetadata,
    });

    const encoded = yield* OAuthRegisterContract.encodePayload(payload);

    const result = yield* continuation.run((handlers) =>
      client.oauth2.register({
        ...encoded,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);
  })
);

// =====================================================================================================================
// Link Social Handler
// =====================================================================================================================
const LinkSocialHandler = LinkSocialContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: LinkSocialContract.name,
      metadata: LinkSocialMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.linkSocial({
        provider: payload.provider,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    return yield* LinkSocialContract.decodeUnknownSuccess(result.data);
  })
);
// =====================================================================================================================
// Get Access Token Handler
// =====================================================================================================================
const GetAccessTokenHandler = GetAccessTokenContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: GetAccessTokenContract.name,
      metadata: GetAccessTokenMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.getAccessToken({
        providerId: payload.providerId,
        accountId: payload.accountId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    if (result.data === null) {
      return yield* new IamError({}, "GetAccessTokenResult returned null");
    }

    return yield* GetAccessTokenContract.decodeUnknownSuccess(result.data);
  })
);

// =====================================================================================================================
// Get Account Info Handler
// =====================================================================================================================
const GetAccountInfoHandler = GetAccountInfoContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: GetAccountInfoContract.name,
      metadata: GetAccountInfoMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.accountInfo({
        accountId: payload.accountId,
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    return yield* GetAccountInfoContract.decodeUnknownSuccess(result.data);
  })
);

// =====================================================================================================================
// Request Additional Scopes Handler
// =====================================================================================================================
const RequestAdditionalScopesHandler = RequestAdditionalScopesContract.implement(
  Effect.fn(function* (payload) {
    const continuation = makeFailureContinuation({
      contract: RequestAdditionalScopesContract.name,
      metadata: RequestAdditionalScopesMetadata,
    });

    const result = yield* continuation.run((handlers) =>
      client.linkSocial({
        provider: payload.provider,
        scopes: [...payload.scopes],
        fetchOptions: withFetchOptions(handlers),
      })
    );

    yield* continuation.raiseResult(result);

    return yield* RequestAdditionalScopesContract.decodeUnknownSuccess(result.data);
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
