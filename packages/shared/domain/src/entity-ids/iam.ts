import { EntityId } from "@beep/schema/identity";
import * as V2 from "@beep/schema/identity/entity-id/e-id";
import type * as S from "effect/Schema";
export const AccountId = V2.make("account", {
  brand: "AccountId",
  annotations: {
    description: "A unique identifier for an account",
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/AccountId"),
  },
});

export declare namespace AccountId {
  export type Type = S.Schema.Type<typeof AccountId>;
  export type Encoded = S.Schema.Encoded<typeof AccountId>;
}

export const ScimProviderId = EntityId.make("scim_provider", {
  brand: "ScimProviderId",
  annotations: {
    description: "A unique identifier for an ScimProvider",
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/ScimProviderId"),
  },
});

export declare namespace ScimProviderId {
  export type Type = S.Schema.Type<typeof ScimProviderId>;
  export type Encoded = S.Schema.Encoded<typeof ScimProviderId>;
}

export const ApiKeyId = EntityId.make("apikey", {
  brand: "ApiKeyId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/ApiKey"),
    description: "A unique identifier for an api key",
  },
});

export declare namespace ApiKeyId {
  export type Type = S.Schema.Type<typeof ApiKeyId>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyId>;
}

export const InvitationId = EntityId.make("invitation", {
  brand: "InvitationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/InvitationId"),
    description: "A unique identifier for an invitation",
  },
});

export declare namespace InvitationId {
  export type Type = S.Schema.Type<typeof InvitationId>;
  export type Encoded = S.Schema.Encoded<typeof InvitationId>;
}

export const JwksId = EntityId.make("jwks", {
  brand: "JwksId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/JwksId"),
    description: "A unique identifier for a jwks",
  },
});

export declare namespace JwksId {
  export type Type = S.Schema.Type<typeof JwksId>;
  export type Encoded = S.Schema.Encoded<typeof JwksId>;
}

export const MemberId = EntityId.make("member", {
  brand: "MemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/MemberId"),
    description: "A unique identifier for a member",
  },
});

export declare namespace MemberId {
  export type Type = S.Schema.Type<typeof MemberId>;
  export type Encoded = S.Schema.Encoded<typeof MemberId>;
}

export const OAuthAccessTokenId = EntityId.make("oauth_access_token", {
  brand: "OAuthAccessTokenId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthAccessTokenId"),
    description: "A unique identifier for an oauth access token",
  },
});

export declare namespace OAuthAccessTokenId {
  export type Type = S.Schema.Type<typeof OAuthAccessTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthAccessTokenId>;
}

export const OAuthApplicationId = EntityId.make("oauth_application", {
  brand: "OAuthApplicationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthApplicationId"),
    description: "A unique identifier for an oauth application",
  },
});

export declare namespace OAuthApplicationId {
  export type Type = S.Schema.Type<typeof OAuthApplicationId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthApplicationId>;
}

export const OAuthConsentId = EntityId.make("oauth_consent", {
  brand: "OAuthConsentId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OAuthConsentId"),
    description: "A unique identifier for an oauth consent",
  },
});

export declare namespace OAuthConsentId {
  export type Type = S.Schema.Type<typeof OAuthConsentId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthConsentId>;
}

export const PasskeyId = EntityId.make("passkey", {
  brand: "Passkey",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/PasskeyId"),
    description: "A unique identifier for a passkey",
  },
});

export declare namespace PasskeyId {
  export type Type = S.Schema.Type<typeof PasskeyId>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyId>;
}

export const RateLimitId = EntityId.make("rate_limit", {
  brand: "RateLimitId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/RateLimitId"),
    description: "A unique identifier for a rate limit",
  },
});

export declare namespace RateLimitId {
  export type Type = S.Schema.Type<typeof RateLimitId>;
  export type Encoded = S.Schema.Encoded<typeof RateLimitId>;
}

export declare namespace SsoProviderId {
  export type Type = S.Schema.Type<typeof SsoProviderId>;
  export type Encoded = S.Schema.Encoded<typeof SsoProviderId>;
}

export const SsoProviderId = EntityId.make("sso_provider", {
  brand: "SsoProviderId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SsoProviderId"),
    description: "A unique identifier for an sso provider",
  },
});

export declare namespace SubscriptionId {
  export type Type = S.Schema.Type<typeof SubscriptionId>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionId>;
}

export const SubscriptionId = EntityId.make("subscription", {
  brand: "SubscriptionId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/SubscriptionId"),
    description: "A unique identifier for a subscription",
  },
});

export declare namespace TeamMemberId {
  export type Type = S.Schema.Type<typeof TeamMemberId>;
  export type Encoded = S.Schema.Encoded<typeof TeamMemberId>;
}

export const TeamMemberId = EntityId.make("team_member", {
  brand: "TeamMemberId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TeamMemberId"),
    description: "A unique identifier for a team member",
  },
});

export declare namespace TwoFactorId {
  export type Type = S.Schema.Type<typeof TwoFactorId>;
  export type Encoded = S.Schema.Encoded<typeof TwoFactorId>;
}

export const TwoFactorId = EntityId.make("two_factor", {
  brand: "TwoFactorId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/TwoFactorId"),
    description: "A unique identifier for a two factor",
  },
});

export const VerificationId = EntityId.make("verification", {
  brand: "VerificationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/VerificationId"),
    description: "A unique identifier for a verification",
  },
});

export declare namespace VerificationId {
  export type Type = S.Schema.Type<typeof VerificationId>;
  export type Encoded = S.Schema.Encoded<typeof VerificationId>;
}

export const WalletAddressId = EntityId.make("wallet_address", {
  brand: "WalletAddressId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/WalletAddressId"),
    description: "A unique identifier for a wallet address",
  },
});

export declare namespace WalletAddressId {
  export type Type = S.Schema.Type<typeof WalletAddressId>;
  export type Encoded = S.Schema.Encoded<typeof WalletAddressId>;
}

export const OrganizationRoleId = EntityId.make("organization_role", {
  brand: "OrganizationRoleId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/OrganizationRoleId"),
    description: "A unique identifier for an organization role",
  },
});

export declare namespace OrganizationRoleId {
  export type Type = S.Schema.Type<typeof OrganizationRoleId>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleId>;
}

export const DeviceCodeId = EntityId.make("device_code", {
  brand: "OrganizationRoleId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/iam/DeviceCodeId"),
    description: "A unique identifier for a device code",
  },
});

export declare namespace DeviceCodeId {
  export type Type = S.Schema.Type<typeof DeviceCodeId>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeId>;
}
