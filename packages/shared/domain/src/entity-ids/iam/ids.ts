import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/iam/ids");

export const AccountId = EntityId.make("account", {
  brand: "AccountId",
}).annotations(
  $I.annotations("AccountId", {
    description: "A unique identifier for an account",
  })
);

export declare namespace AccountId {
  export type Type = S.Schema.Type<typeof AccountId>;
  export type Encoded = S.Schema.Encoded<typeof AccountId>;
}

export const ScimProviderId = EntityId.make("scim_provider", {
  brand: "ScimProviderId",
}).annotations(
  $I.annotations("ScimProviderId", {
    description: "A unique identifier for an ScimProvider",
  })
);

export declare namespace ScimProviderId {
  export type Type = S.Schema.Type<typeof ScimProviderId>;
  export type Encoded = S.Schema.Encoded<typeof ScimProviderId>;
}

export const ApiKeyId = EntityId.make("apikey", {
  brand: "ApiKeyId",
}).annotations(
  $I.annotations("ApiKeyId", {
    description: "A unique identifier for an api key",
  })
);

export declare namespace ApiKeyId {
  export type Type = S.Schema.Type<typeof ApiKeyId>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyId>;
}

export const InvitationId = EntityId.make("invitation", {
  brand: "InvitationId",
}).annotations(
  $I.annotations("InvitationId", {
    description: "A unique identifier for an invitation",
  })
);

export declare namespace InvitationId {
  export type Type = S.Schema.Type<typeof InvitationId>;
  export type Encoded = S.Schema.Encoded<typeof InvitationId>;
}

export const JwksId = EntityId.make("jwks", {
  brand: "JwksId",
}).annotations(
  $I.annotations("JwksId", {
    description: "A unique identifier for a jwks",
  })
);

export declare namespace JwksId {
  export type Type = S.Schema.Type<typeof JwksId>;
  export type Encoded = S.Schema.Encoded<typeof JwksId>;
}

export const MemberId = EntityId.make("member", {
  brand: "MemberId",
}).annotations(
  $I.annotations("MemberId", {
    description: "A unique identifier for a member",
  })
);

export declare namespace MemberId {
  export type Type = S.Schema.Type<typeof MemberId>;
  export type Encoded = S.Schema.Encoded<typeof MemberId>;
}

export const OAuthAccessTokenId = EntityId.make("oauth_access_token", {
  brand: "OAuthAccessTokenId",
}).annotations(
  $I.annotations("OAuthAccessTokenId", {
    description: "A unique identifier for an oauth access token",
  })
);

export declare namespace OAuthAccessTokenId {
  export type Type = S.Schema.Type<typeof OAuthAccessTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthAccessTokenId>;
}

export const OAuthApplicationId = EntityId.make("oauth_application", {
  brand: "OAuthApplicationId",
}).annotations(
  $I.annotations("OAuthApplicationId", {
    description: "A unique identifier for an oauth application",
  })
);

export declare namespace OAuthApplicationId {
  export type Type = S.Schema.Type<typeof OAuthApplicationId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthApplicationId>;
}

export const OAuthConsentId = EntityId.make("oauth_consent", {
  brand: "OAuthConsentId",
}).annotations(
  $I.annotations("OAuthConsentId", {
    description: "A unique identifier for an oauth consent",
  })
);

export declare namespace OAuthConsentId {
  export type Type = S.Schema.Type<typeof OAuthConsentId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthConsentId>;
}

export const PasskeyId = EntityId.make("passkey", {
  brand: "PasskeyId",
}).annotations(
  $I.annotations("PasskeyId", {
    description: "A unique identifier for a passkey",
  })
);

export declare namespace PasskeyId {
  export type Type = S.Schema.Type<typeof PasskeyId>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyId>;
}

export const RateLimitId = EntityId.make("rate_limit", {
  brand: "RateLimitId",
}).annotations(
  $I.annotations("RateLimitId", {
    description: "A unique identifier for a rate limit",
  })
);

export declare namespace RateLimitId {
  export type Type = S.Schema.Type<typeof RateLimitId>;
  export type Encoded = S.Schema.Encoded<typeof RateLimitId>;
}

export const SsoProviderId = EntityId.make("sso_provider", {
  brand: "SsoProviderId",
}).annotations(
  $I.annotations("SsoProviderId", {
    description: "A unique identifier for an sso provider",
  })
);

export declare namespace SsoProviderId {
  export type Type = S.Schema.Type<typeof SsoProviderId>;
  export type Encoded = S.Schema.Encoded<typeof SsoProviderId>;
}

export const SubscriptionId = EntityId.make("subscription", {
  brand: "SubscriptionId",
}).annotations(
  $I.annotations("SubscriptionId", {
    description: "A unique identifier for a subscription",
  })
);

export declare namespace SubscriptionId {
  export type Type = S.Schema.Type<typeof SubscriptionId>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionId>;
}

export const TeamMemberId = EntityId.make("team_member", {
  brand: "TeamMemberId",
}).annotations(
  $I.annotations("TeamMemberId", {
    description: "A unique identifier for a team member",
  })
);

export declare namespace TeamMemberId {
  export type Type = S.Schema.Type<typeof TeamMemberId>;
  export type Encoded = S.Schema.Encoded<typeof TeamMemberId>;
}

export const TwoFactorId = EntityId.make("two_factor", {
  brand: "TwoFactorId",
}).annotations(
  $I.annotations("TwoFactorId", {
    description: "A unique identifier for a two factor",
  })
);

export declare namespace TwoFactorId {
  export type Type = S.Schema.Type<typeof TwoFactorId>;
  export type Encoded = S.Schema.Encoded<typeof TwoFactorId>;
}

export const VerificationId = EntityId.make("verification", {
  brand: "VerificationId",
}).annotations(
  $I.annotations("VerificationId", {
    description: "A unique identifier for a verification",
  })
);

export declare namespace VerificationId {
  export type Type = S.Schema.Type<typeof VerificationId>;
  export type Encoded = S.Schema.Encoded<typeof VerificationId>;
}

export const WalletAddressId = EntityId.make("wallet_address", {
  brand: "WalletAddressId",
}).annotations(
  $I.annotations("WalletAddressId", {
    description: "A unique identifier for a wallet address",
  })
);

export declare namespace WalletAddressId {
  export type Type = S.Schema.Type<typeof WalletAddressId>;
  export type Encoded = S.Schema.Encoded<typeof WalletAddressId>;
}

export const OrganizationRoleId = EntityId.make("organization_role", {
  brand: "OrganizationRoleId",
}).annotations(
  $I.annotations("OrganizationRoleId", {
    description: "A unique identifier for an organization role",
  })
);

export declare namespace OrganizationRoleId {
  export type Type = S.Schema.Type<typeof OrganizationRoleId>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleId>;
}

export const DeviceCodeId = EntityId.make("device_code", {
  brand: "DeviceCodeId",
}).annotations(
  $I.annotations("DeviceCodeId", {
    description: "A unique identifier for a device code",
  })
);

export declare namespace DeviceCodeId {
  export type Type = S.Schema.Type<typeof DeviceCodeId>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeId>;
}
