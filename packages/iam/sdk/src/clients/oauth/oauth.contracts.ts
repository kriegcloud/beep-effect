import { AuthProviderNameValue } from "@beep/constants";
import { Account } from "@beep/iam-domain/entities";
import { Contract, ContractKit } from "@beep/iam-sdk/contract-kit";
import { BS } from "@beep/schema";
import { IamEntityIds } from "@beep/shared-domain";
import * as S from "effect/Schema";
import { IamError } from "../../errors";
// =====================================================================================================================
// OAuth Register Contract
// =====================================================================================================================
export class OAuthRegisterPayload extends BS.Class<OAuthRegisterPayload>("OAuthRegisterPayload")(
  {
    client_name: S.NonEmptyTrimmedString,
    redirect_uris: S.mutable(S.Array(BS.Url)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/OAuthRegisterPayload"),
    identifier: "OAuthRegisterPayload",
    description: "Payload for registering a new OAuth2 client.",
  }
) {}

export declare namespace OAuthRegisterPayload {
  export type Type = S.Schema.Type<typeof OAuthRegisterPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuthRegisterPayload>;
}

export const OAuthRegisterContract = Contract.make("OAuthRegister", {
  description: "Registers a new OAuth2 application.",
  parameters: OAuthRegisterPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.Void,
});

// =====================================================================================================================
// Link Social Contract
// =====================================================================================================================
export class LinkSocialPayload extends BS.Class<LinkSocialPayload>("LinkSocialPayload")(
  {
    provider: AuthProviderNameValue,
  },
  {
    schemaId: "@beep/iam-sdk/clients/oauth/LinkSocialPayload",
    identifier: "LinkSocialPayload",
    title: "Link Social Payload",
    description: "Payload for linking a users account to a social provider.",
  }
) {}

export declare namespace LinkSocialPayload {
  export type Type = S.Schema.Type<typeof LinkSocialPayload>;
  export type Encoded = S.Schema.Encoded<typeof LinkSocialPayload>;
}

export class LinkSocialSuccess extends BS.Class<LinkSocialSuccess>("LinkSocialSuccess")(
  {
    url: BS.Url,
    redirect: S.Boolean,
  },
  {
    schemaId: "@beep/iam-sdk/clients/oauth/LinkSocialSuccess",
    identifier: "LinkSocialSuccess",
    title: "Link Social Success",
    description: "Success response for linking a users account to a social provider.",
  }
) {}

export declare namespace LinkSocialSuccess {
  export type Type = S.Schema.Type<typeof LinkSocialSuccess>;
  export type Encoded = S.Schema.Encoded<typeof LinkSocialSuccess>;
}

export const LinkSocialContract = Contract.make("LinkSocial", {
  description: "Links a users account to a social provider.",
  parameters: LinkSocialPayload.fields,
  failure: S.instanceOf(IamError),
  success: S.NullOr(LinkSocialSuccess),
});

// =====================================================================================================================
// Get Access Token Contract
// =====================================================================================================================

export class GetAccessTokenPayload extends BS.Class<GetAccessTokenPayload>("GetAccessTokenPayload")(
  {
    providerId: AuthProviderNameValue,
    accountId: Account.Model.select.fields.id,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/GetAccessTokenPayload"),
    identifier: "GetAccessTokenPayload",
    title: "Get AccessToken Payload",
    description: "Payload for getting an access token for a social provider.",
  }
) {}

export declare namespace GetAccessTokenPayload {
  export type Type = S.Schema.Type<typeof GetAccessTokenPayload>;
  export type Encoded = S.Schema.Encoded<typeof GetAccessTokenPayload>;
}

export class GetAccessTokenSuccess extends BS.Class<GetAccessTokenSuccess>("GetAccessTokenSuccess")(
  {
    accessToken: S.Redacted(S.String),
    accessTokenExpiresAt: S.UndefinedOr(S.DateFromSelf),
    scopes: S.Array(S.String),
    idToken: S.UndefinedOr(S.Redacted(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/GetAccessTokenSuccess"),
    identifier: "GetAccessTokenSuccess",
    title: "Get AccessToken Success",
    description: "Success response for getting an access token for a social provider.",
  }
) {}

export declare namespace GetAccessTokenSuccess {
  export type Type = S.Schema.Type<typeof GetAccessTokenSuccess>;
  export type Encoded = S.Schema.Encoded<typeof GetAccessTokenSuccess>;
}

export const GetAccessTokenContract = Contract.make("GetAccessToken", {
  description: "Gets an access token for a social provider.",
  parameters: GetAccessTokenPayload.fields,
  failure: S.instanceOf(IamError),
  success: GetAccessTokenSuccess,
});

// =====================================================================================================================
// Get Account Info Contract
// =====================================================================================================================
export class GetAccountInfoPayload extends BS.Class<GetAccountInfoPayload>("GetAccountInfoPayload")(
  {
    accountId: IamEntityIds.AccountId,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/GetAccountInfoPayload"),
    identifier: "GetAccountInfoPayload",
    title: "Get Account Info Payload",
    description: "Payload for getting an account info for a social provider.",
  }
) {}

export declare namespace GetAccountInfoPayload {
  export type Type = S.Schema.Type<typeof GetAccountInfoPayload>;
  export type Encoded = S.Schema.Encoded<typeof GetAccountInfoPayload>;
}

export class GetAccountInfoSuccess extends BS.Class<GetAccountInfoSuccess>("GetAccountInfoSuccess")(
  {
    user: S.Record({ key: S.String, value: S.Unknown }),
    data: S.Record({ key: S.String, value: S.Unknown }),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/GetAccountInfoSuccess"),
    identifier: "GetAccountInfoSuccess",
    title: "Get Account Info Success",
    description: "Success response for getting an account info for a social provider.",
  }
) {}

export declare namespace GetAccountInfoSuccess {
  export type Type = S.Schema.Type<typeof GetAccountInfoSuccess>;
  export type Encoded = S.Schema.Encoded<typeof GetAccountInfoSuccess>;
}

export const GetAccountInfoContract = Contract.make("GetAccountInfo", {
  description: "Gets an account info for a social provider.",
  parameters: GetAccountInfoPayload.fields,
  failure: S.instanceOf(IamError),
  success: GetAccountInfoSuccess,
});

// =====================================================================================================================
// Request Additional Scopes Contract
// =====================================================================================================================
export class RequestAdditionalScopesPayload extends BS.Class<RequestAdditionalScopesPayload>(
  "RequestAdditionalScopesPayload"
)(
  {
    provider: AuthProviderNameValue,
    scopes: S.NonEmptyArray(S.NonEmptyTrimmedString),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/RequestAdditionalScopesPayload"),
    identifier: "RequestAdditionalScopesPayload",
    title: "Request Additional Scopes Payload",
    description: "Payload for requesting additional scopes for a social provider.",
  }
) {}

export declare namespace RequestAdditionalScopesPayload {
  export type Type = S.Schema.Type<typeof RequestAdditionalScopesPayload>;
  export type Encoded = S.Schema.Encoded<typeof RequestAdditionalScopesPayload>;
}

export class RequestAdditionalScopesSuccess extends BS.Class<RequestAdditionalScopesSuccess>(
  "RequestAdditionalScopesSuccess"
)(
  {
    url: BS.URLString,
    redirect: S.Boolean,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oauth/RequestAdditionalScopesSuccess"),
    identifier: "RequestAdditionalScopesSuccess",
    title: "Request Additional Scopes Success",
    description: "Success response for requesting additional scopes for a social provider.",
  }
) {}

export declare namespace RequestAdditionalScopesSuccess {
  export type Type = S.Schema.Type<typeof RequestAdditionalScopesSuccess>;
  export type Encoded = S.Schema.Encoded<typeof RequestAdditionalScopesSuccess>;
}

export const RequestAdditionalScopesContract = Contract.make("RequestAdditionalScopes", {
  description: "Requests additional scopes for a social provider.",
  parameters: RequestAdditionalScopesPayload.fields,
  failure: S.instanceOf(IamError),
  success: RequestAdditionalScopesSuccess,
});

// =====================================================================================================================
// OAuth Contract Set
// =====================================================================================================================
export const OAuthContractKit = ContractKit.make(
  OAuthRegisterContract,
  LinkSocialContract,
  GetAccessTokenContract,
  GetAccountInfoContract,
  RequestAdditionalScopesContract
);
