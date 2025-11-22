import { Contract, ContractKit } from "@beep/contract";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { IamError } from "../../errors";

const ResponseSchema = S.instanceOf(Response);

const OAuth2AuthorizeResponseSchema = S.Struct({
  redirect: S.Boolean,
  url: BS.URLString,
}).annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizeRedirect"),
  identifier: "OAuth2AuthorizeRedirect",
  title: "OAuth2 Authorize Redirect",
  description: "Redirect directive for OAuth2 authorization requests.",
});

export class OAuth2AuthorizeResponseType extends BS.StringLiteralKit("code", "token").annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizeResponseType"),
  identifier: "OAuth2AuthorizeResponseType",
  title: "OAuth2 Authorize Response Type",
  description: "Response type for OAuth2 authorization requests.",
}) {}

export declare namespace OAuth2AuthorizeResponseType {
  export type Type = typeof OAuth2AuthorizeResponseType.Type;
  export type Encoded = typeof OAuth2AuthorizeResponseType.Encoded;
}

export class OAuth2AuthorizePrompt extends BS.StringLiteralKit(
  "none",
  "consent",
  "login",
  "select_account"
).annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizePrompt"),
  identifier: "OAuth2AuthorizePrompt",
  title: "OAuth2 Authorize Prompt",
  description: "Prompt parameter for OAuth2 authorization requests.",
}) {}

export declare namespace OAuthAuthorizePrompt {
  export type Type = typeof OAuth2AuthorizePrompt.Type;
  export type Encoded = typeof OAuth2AuthorizePrompt.Encoded;
}

export class OAuth2AuthorizeDisplay extends BS.StringLiteralKit("page", "popup", "touch", "wap").annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizeDisplay"),
  identifier: "OAuth2AuthorizeDisplay",
  title: "OAuth2 Authorize Display",
  description: "Display parameter for OAuth2 authorization requests.",
}) {}

export declare namespace OAuth2AuthorizeDisplay {
  export type Type = typeof OAuth2AuthorizeDisplay.Type;
  export type Encoded = typeof OAuth2AuthorizeDisplay.Encoded;
}

export class OAuth2AuthorizeCodeChallengeMethod extends BS.StringLiteralKit("plain", "S256").annotations({
  schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizeCodeChallengeMethod"),
  identifier: "OAuth2AuthorizeCodeChallengeMethod",
  title: "OAuth2 Authorize Code Challenge Method",
  description: "Code challenge method for OAuth2 authorization requests.",
}) {}

export declare namespace OAuth2AuthorizeCodeChallengeMethod {
  export type Type = typeof OAuth2AuthorizeCodeChallengeMethod.Type;
  export type Encoded = typeof OAuth2AuthorizeCodeChallengeMethod.Encoded;
}

export class OAuth2AuthorizePayload extends S.Class<OAuth2AuthorizePayload>("OAuth2AuthorizePayload")(
  {
    response_type: OAuth2AuthorizeResponseType,
    client_id: S.String,
    state: S.String,
    redirect_uri: S.optional(BS.URLString),
    scope: S.optional(S.String),
    prompt: S.optional(OAuth2AuthorizePrompt),
    display: S.optional(OAuth2AuthorizeDisplay),
    ui_locales: S.optional(S.String),
    max_age: S.optional(S.Number),
    acr_values: S.optional(S.String),
    login_hint: S.optional(S.String),
    id_token_hint: S.optional(S.String),
    code_challenge: S.optional(S.String),
    code_challenge_method: S.optional(OAuth2AuthorizeCodeChallengeMethod),
    nonce: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2AuthorizePayload"),
    identifier: "OAuth2AuthorizePayload",
    title: "OAuth2 Authorize Payload",
    description: "Query parameters permitted for OAuth2 authorization requests.",
  }
) {}

export declare namespace OAuth2AuthorizePayload {
  export type Type = S.Schema.Type<typeof OAuth2AuthorizePayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2AuthorizePayload>;
}

export class OAuth2ConsentPayload extends S.Class<OAuth2ConsentPayload>("OAuth2ConsentPayload")(
  {
    accept: S.Boolean,
    consent_code: S.optional(S.NullOr(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2ConsentPayload"),
    identifier: "OAuth2ConsentPayload",
    title: "OAuth2 Consent Payload",
    description: "Payload for submitting user consent decisions.",
  }
) {}

export declare namespace OAuth2ConsentPayload {
  export type Type = S.Schema.Type<typeof OAuth2ConsentPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2ConsentPayload>;
}

export class OAuth2ConsentSuccess extends S.Class<OAuth2ConsentSuccess>("OAuth2ConsentSuccess")(
  {
    redirectURI: BS.URLString,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2ConsentSuccess"),
    identifier: "OAuth2ConsentSuccess",
    title: "OAuth2 Consent Success",
    description: "Redirect destination after recording consent.",
  }
) {}

export declare namespace OAuth2ConsentSuccess {
  export type Type = S.Schema.Type<typeof OAuth2ConsentSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2ConsentSuccess>;
}

export class OAuth2TokenPayload extends S.Class<OAuth2TokenPayload>("OAuth2TokenPayload")(
  {
    grant_type: S.String,
    code: S.optional(S.String),
    redirect_uri: S.optional(BS.URLString),
    code_verifier: S.optional(S.String),
    client_id: S.optional(S.String),
    client_secret: S.optional(S.String),
    refresh_token: S.optional(S.String),
    scope: S.optional(S.String),
    username: S.optional(S.String),
    password: S.optional(S.String),
    device_code: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2TokenPayload"),
    identifier: "OAuth2TokenPayload",
    title: "OAuth2 Token Payload",
    description: "Payload for exchanging authorization codes, refresh tokens, or device codes.",
  }
) {}

export declare namespace OAuth2TokenPayload {
  export type Type = S.Schema.Type<typeof OAuth2TokenPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2TokenPayload>;
}

export class OAuth2TokenSuccess extends S.Class<OAuth2TokenSuccess>("OAuth2TokenSuccess")(
  {
    access_token: S.Redacted(S.String),
    token_type: S.String,
    expires_in: S.Number,
    scope: S.String,
    refresh_token: S.optional(S.Redacted(S.String)),
    id_token: S.optional(S.Redacted(S.String)),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2TokenSuccess"),
    identifier: "OAuth2TokenSuccess",
    title: "OAuth2 Token Success",
    description: "Tokens returned from the OAuth2 token exchange endpoint.",
  }
) {}

export declare namespace OAuth2TokenSuccess {
  export type Type = S.Schema.Type<typeof OAuth2TokenSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2TokenSuccess>;
}

export class OAuth2UserInfoSuccess extends S.Class<OAuth2UserInfoSuccess>("OAuth2UserInfoSuccess")(
  {
    sub: S.String,
    email: S.optional(S.String),
    name: S.optional(S.String),
    picture: S.optional(S.NullOr(BS.URLString)),
    given_name: S.optional(S.String),
    family_name: S.optional(S.String),
    email_verified: S.optional(S.Boolean),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2UserInfoSuccess"),
    identifier: "OAuth2UserInfoSuccess",
    title: "OAuth2 UserInfo Success",
    description: "Claims returned from the OAuth2 userinfo endpoint.",
  }
) {}

export declare namespace OAuth2UserInfoSuccess {
  export type Type = S.Schema.Type<typeof OAuth2UserInfoSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2UserInfoSuccess>;
}

const TokenEndpointAuthMethod = S.Literal("none", "client_secret_basic", "client_secret_post");

const GrantTypeSchema = S.Literal(
  "authorization_code",
  "refresh_token",
  "client_credentials",
  "password",
  "implicit",
  "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "urn:ietf:params:oauth:grant-type:saml2-bearer"
);

const ResponseTypeSchema = S.Literal("code", "token");

export class OAuth2RegisterPayload extends S.Class<OAuth2RegisterPayload>("OAuth2RegisterPayload")(
  {
    redirect_uris: S.mutable(S.NonEmptyArray(BS.URLString)),
    token_endpoint_auth_method: S.optional(TokenEndpointAuthMethod),
    grant_types: S.optional(S.mutable(S.Array(GrantTypeSchema))),
    response_types: S.optional(S.mutable(S.Array(ResponseTypeSchema))),
    client_name: S.optional(S.String),
    client_uri: S.optional(BS.URLString),
    logo_uri: S.optional(BS.URLString),
    scope: S.optional(S.String),
    contacts: S.optional(S.mutable(S.Array(S.String))),
    tos_uri: S.optional(BS.URLString),
    policy_uri: S.optional(BS.URLString),
    jwks_uri: S.optional(BS.URLString),
    jwks: S.optional(S.Record({ key: S.String, value: S.Unknown })),
    metadata: S.optional(S.Record({ key: S.String, value: S.Unknown })),
    software_id: S.optional(S.String),
    software_version: S.optional(S.String),
    software_statement: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2RegisterPayload"),
    identifier: "OAuth2RegisterPayload",
    title: "OAuth2 Dynamic Client Registration Payload",
    description: "Payload accepted by the OAuth2 dynamic client registration endpoint.",
  }
) {}

export declare namespace OAuth2RegisterPayload {
  export type Type = S.Schema.Type<typeof OAuth2RegisterPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2RegisterPayload>;
}

export class OAuth2RegisterSuccess extends S.Class<OAuth2RegisterSuccess>("OAuth2RegisterSuccess")(
  {
    client_id: S.String,
    client_secret: S.optional(S.Redacted(S.String)),
    client_id_issued_at: S.Number,
    client_secret_expires_at: S.Number,
    redirect_uris: S.mutable(S.Array(BS.URLString)),
    token_endpoint_auth_method: TokenEndpointAuthMethod,
    grant_types: S.mutable(S.Array(S.String)),
    response_types: S.mutable(S.Array(S.String)),
    client_name: S.optional(S.String),
    client_uri: S.optional(BS.URLString),
    logo_uri: S.optional(BS.URLString),
    scope: S.optional(S.String),
    contacts: S.optional(S.mutable(S.Array(S.String))),
    tos_uri: S.optional(BS.URLString),
    policy_uri: S.optional(BS.URLString),
    jwks_uri: S.optional(BS.URLString),
    jwks: S.optional(S.Record({ key: S.String, value: S.Unknown })),
    metadata: S.optional(S.Record({ key: S.String, value: S.Unknown })),
    software_id: S.optional(S.String),
    software_version: S.optional(S.String),
    software_statement: S.optional(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2RegisterSuccess"),
    identifier: "OAuth2RegisterSuccess",
    title: "OAuth2 Dynamic Client Registration Success",
    description: "Response data after successfully registering an OAuth2 client.",
  }
) {}

export declare namespace OAuth2RegisterSuccess {
  export type Type = S.Schema.Type<typeof OAuth2RegisterSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2RegisterSuccess>;
}

export class OAuth2ClientPayload extends S.Class<OAuth2ClientPayload>("OAuth2ClientPayload")(
  {
    id: S.String,
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2ClientPayload"),
    identifier: "OAuth2ClientPayload",
    title: "OAuth2 Client Payload",
    description: "Payload for retrieving the metadata of a registered OAuth2 client.",
  }
) {}

export declare namespace OAuth2ClientPayload {
  export type Type = S.Schema.Type<typeof OAuth2ClientPayload>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2ClientPayload>;
}

export class OAuth2ClientSuccess extends S.Class<OAuth2ClientSuccess>("OAuth2ClientSuccess")(
  {
    clientId: S.String,
    name: S.String,
    icon: S.NullOr(S.String),
  },
  {
    schemaId: Symbol.for("@beep/iam-sdk/clients/oidc/OAuth2ClientSuccess"),
    identifier: "OAuth2ClientSuccess",
    title: "OAuth2 Client Success",
    description: "Registered OAuth2 client metadata.",
  }
) {}

export declare namespace OAuth2ClientSuccess {
  export type Type = S.Schema.Type<typeof OAuth2ClientSuccess>;
  export type Encoded = S.Schema.Encoded<typeof OAuth2ClientSuccess>;
}

export const OAuth2AuthorizeContract = Contract.make("OAuth2Authorize", {
  description: "Handles OAuth2/OIDC authorization requests.",
  payload: OAuth2AuthorizePayload.fields,
  failure: IamError,
  success: S.Union(ResponseSchema, OAuth2AuthorizeResponseSchema),
})
  .annotate(Contract.Title, "OAuth2 Authorize Contract")
  .annotate(Contract.Domain, "oidc")
  .annotate(Contract.Method, "authorize");

export const OAuth2ConsentContract = Contract.make("OAuth2Consent", {
  description: "Processes the end-user consent decision.",
  payload: OAuth2ConsentPayload.fields,
  failure: IamError,
  success: OAuth2ConsentSuccess,
})
  .annotate(Contract.Title, "OAuth2 Consent Contract")
  .annotate(Contract.Domain, "oidc")
  .annotate(Contract.Method, "consent");

export const OAuth2TokenContract = Contract.make("OAuth2Token", {
  description: "Performs OAuth2 token exchanges.",
  payload: OAuth2TokenPayload.fields,
  failure: IamError,
  success: OAuth2TokenSuccess,
})
  .annotate(Contract.Title, "OAuth2 Token Contract")
  .annotate(Contract.Domain, "oidc")
  .annotate(Contract.Method, "token");

export const OAuth2RegisterContract = Contract.make("OAuth2Register", {
  description: "Registers an OAuth2 client using dynamic registration.",
  payload: OAuth2RegisterPayload.fields,
  failure: IamError,
  success: OAuth2RegisterSuccess,
})
  .annotate(Contract.Title, "OAuth2 Register Contract")
  .annotate(Contract.Domain, "oidc")
  .annotate(Contract.Method, "register");

export const OAuth2ClientContract = Contract.make("OAuth2Client", {
  description: "Fetches metadata for a registered OAuth2 client.",
  payload: OAuth2ClientPayload.fields,
  failure: IamError,
  success: OAuth2ClientSuccess,
})
  .annotate(Contract.Title, "OAuth2 Client Contract")
  .annotate(Contract.Domain, "oidc")
  .annotate(Contract.Method, "client");

export const OidcContractKit = ContractKit.make(
  OAuth2AuthorizeContract,
  OAuth2ConsentContract,
  OAuth2TokenContract,
  OAuth2RegisterContract,
  OAuth2ClientContract
);
