import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/iam/ids");
const make = EntityId.builder("iam");
export const AccountId = make("account", {
  brand: "AccountId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("AccountId", {
    description: "A unique identifier for an account",
  })
);

export declare namespace AccountId {
  export type Type = S.Schema.Type<typeof AccountId>;
  export type Encoded = S.Schema.Encoded<typeof AccountId>;

  export namespace RowId {
    export type Type = typeof AccountId.privateSchema.Type;
    export type Encoded = typeof AccountId.privateSchema.Encoded;
  }
}

export const ScimProviderId = make("scim_provider", {
  brand: "ScimProviderId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("ScimProviderId", {
    description: "A unique identifier for an ScimProvider",
  })
);

export declare namespace ScimProviderId {
  export type Type = S.Schema.Type<typeof ScimProviderId>;
  export type Encoded = S.Schema.Encoded<typeof ScimProviderId>;

  export namespace RowId {
    export type Type = typeof ScimProviderId.privateSchema.Type;
    export type Encoded = typeof ScimProviderId.privateSchema.Encoded;
  }
}

export const ApiKeyId = make("apikey", {
  brand: "ApiKeyId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("ApiKeyId", {
    description: "A unique identifier for an api key",
  })
);

export declare namespace ApiKeyId {
  export type Type = S.Schema.Type<typeof ApiKeyId>;
  export type Encoded = S.Schema.Encoded<typeof ApiKeyId>;

  export namespace RowId {
    export type Type = typeof ApiKeyId.privateSchema.Type;
    export type Encoded = typeof ApiKeyId.privateSchema.Encoded;
  }
}

export const InvitationId = make("invitation", {
  brand: "InvitationId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("InvitationId", {
    description: "A unique identifier for an invitation",
  })
);

export declare namespace InvitationId {
  export type Type = S.Schema.Type<typeof InvitationId>;
  export type Encoded = S.Schema.Encoded<typeof InvitationId>;

  export namespace RowId {
    export type Type = typeof InvitationId.privateSchema.Type;
    export type Encoded = typeof InvitationId.privateSchema.Encoded;
  }
}

export const JwksId = make("jwks", {
  brand: "JwksId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("JwksId", {
    description: "A unique identifier for a jwks",
  })
);

export declare namespace JwksId {
  export type Type = S.Schema.Type<typeof JwksId>;
  export type Encoded = S.Schema.Encoded<typeof JwksId>;
  export namespace RowId {
    export type Type = typeof JwksId.privateSchema.Type;
    export type Encoded = typeof JwksId.privateSchema.Encoded;
  }
}

export const MemberId = make("member", {
  brand: "MemberId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("MemberId", {
    description: "A unique identifier for a member",
  })
);

export declare namespace MemberId {
  export type Type = S.Schema.Type<typeof MemberId>;
  export type Encoded = S.Schema.Encoded<typeof MemberId>;
  export namespace RowId {
    export type Type = typeof MemberId.privateSchema.Type;
    export type Encoded = typeof MemberId.privateSchema.Encoded;
  }
}

export const PasskeyId = make("passkey", {
  brand: "PasskeyId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("PasskeyId", {
    description: "A unique identifier for a passkey",
  })
);

export declare namespace PasskeyId {
  export type Type = S.Schema.Type<typeof PasskeyId>;
  export type Encoded = S.Schema.Encoded<typeof PasskeyId>;
  export namespace RowId {
    export type Type = typeof PasskeyId.privateSchema.Type;
    export type Encoded = typeof PasskeyId.privateSchema.Encoded;
  }
}

export const RateLimitId = make("rate_limit", {
  brand: "RateLimitId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("RateLimitId", {
    description: "A unique identifier for a rate limit",
  })
);

export declare namespace RateLimitId {
  export type Type = S.Schema.Type<typeof RateLimitId>;
  export type Encoded = S.Schema.Encoded<typeof RateLimitId>;
  export namespace RowId {
    export type Type = typeof RateLimitId.privateSchema.Type;
    export type Encoded = typeof RateLimitId.privateSchema.Encoded;
  }
}

export const SsoProviderId = make("sso_provider", {
  brand: "SsoProviderId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("SsoProviderId", {
    description: "A unique identifier for an sso provider",
  })
);

export declare namespace SsoProviderId {
  export type Type = S.Schema.Type<typeof SsoProviderId>;
  export type Encoded = S.Schema.Encoded<typeof SsoProviderId>;
  export namespace RowId {
    export type Type = typeof SsoProviderId.privateSchema.Type;
    export type Encoded = typeof SsoProviderId.privateSchema.Encoded;
  }
}

export const SubscriptionId = make("subscription", {
  brand: "SubscriptionId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("SubscriptionId", {
    description: "A unique identifier for a subscription",
  })
);

export declare namespace SubscriptionId {
  export type Type = S.Schema.Type<typeof SubscriptionId>;
  export type Encoded = S.Schema.Encoded<typeof SubscriptionId>;
  export namespace RowId {
    export type Type = typeof SubscriptionId.privateSchema.Type;
    export type Encoded = typeof SubscriptionId.privateSchema.Encoded;
  }
}

export const TeamMemberId = make("team_member", {
  brand: "TeamMemberId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("TeamMemberId", {
    description: "A unique identifier for a team member",
  })
);

export declare namespace TeamMemberId {
  export type Type = S.Schema.Type<typeof TeamMemberId>;
  export type Encoded = S.Schema.Encoded<typeof TeamMemberId>;
  export namespace RowId {
    export type Type = typeof TeamMemberId.privateSchema.Type;
    export type Encoded = typeof TeamMemberId.privateSchema.Encoded;
  }
}

export const TwoFactorId = make("two_factor", {
  brand: "TwoFactorId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("TwoFactorId", {
    description: "A unique identifier for a two factor",
  })
);

export declare namespace TwoFactorId {
  export type Type = S.Schema.Type<typeof TwoFactorId>;
  export type Encoded = S.Schema.Encoded<typeof TwoFactorId>;
  export namespace RowId {
    export type Type = typeof TwoFactorId.privateSchema.Type;
    export type Encoded = typeof TwoFactorId.privateSchema.Encoded;
  }
}

export const VerificationId = make("verification", {
  brand: "VerificationId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("VerificationId", {
    description: "A unique identifier for a verification",
  })
);

export declare namespace VerificationId {
  export type Type = S.Schema.Type<typeof VerificationId>;
  export type Encoded = S.Schema.Encoded<typeof VerificationId>;
  export namespace RowId {
    export type Type = typeof VerificationId.privateSchema.Type;
    export type Encoded = typeof VerificationId.privateSchema.Encoded;
  }
}

export const WalletAddressId = make("wallet_address", {
  brand: "WalletAddressId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("WalletAddressId", {
    description: "A unique identifier for a wallet address",
  })
);

export declare namespace WalletAddressId {
  export type Type = S.Schema.Type<typeof WalletAddressId>;
  export type Encoded = S.Schema.Encoded<typeof WalletAddressId>;
  export namespace RowId {
    export type Type = typeof WalletAddressId.privateSchema.Type;
    export type Encoded = typeof WalletAddressId.privateSchema.Encoded;
  }
}

export const OrganizationRoleId = make("organization_role", {
  brand: "OrganizationRoleId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("OrganizationRoleId", {
    description: "A unique identifier for an organization role",
  })
);

export declare namespace OrganizationRoleId {
  export type Type = S.Schema.Type<typeof OrganizationRoleId>;
  export type Encoded = S.Schema.Encoded<typeof OrganizationRoleId>;
  export namespace RowId {
    export type Type = typeof OrganizationRoleId.privateSchema.Type;
    export type Encoded = typeof OrganizationRoleId.privateSchema.Encoded;
  }
}

export const DeviceCodeId = make("device_code", {
  brand: "DeviceCodeId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("DeviceCodeId", {
    description: "A unique identifier for a device code",
  })
);

export declare namespace DeviceCodeId {
  export type Type = S.Schema.Type<typeof DeviceCodeId>;
  export type Encoded = S.Schema.Encoded<typeof DeviceCodeId>;
  export namespace RowId {
    export type Type = typeof DeviceCodeId.privateSchema.Type;
    export type Encoded = typeof DeviceCodeId.privateSchema.Encoded;
  }
}

export const OAuthClientId = make("oauth_client", {
  brand: "OAuthClientId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("OAuthClientId", {
    description: "A unique identifier for an OAuth client",
  })
);

export declare namespace OAuthClientId {
  export type Type = S.Schema.Type<typeof OAuthClientId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthClientId>;
  export namespace RowId {
    export type Type = typeof OAuthClientId.privateSchema.Type;
    export type Encoded = typeof OAuthClientId.privateSchema.Encoded;
  }
}

export const OAuthAccessTokenId = make("oauth_access_token", {
  brand: "OAuthAccessTokenId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("OAuthAccessTokenId", {
    description: "A unique identifier for an OAuth access token",
  })
);

export declare namespace OAuthAccessTokenId {
  export type Type = S.Schema.Type<typeof OAuthAccessTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthAccessTokenId>;
  export namespace RowId {
    export type Type = typeof OAuthAccessTokenId.privateSchema.Type;
    export type Encoded = typeof OAuthAccessTokenId.privateSchema.Encoded;
  }
}

export const OAuthRefreshTokenId = make("oauth_refresh_token", {
  brand: "OAuthRefreshTokenId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("OAuthRefreshTokenId", {
    description: "A unique identifier for an OAuth refresh token",
  })
);

export declare namespace OAuthRefreshTokenId {
  export type Type = S.Schema.Type<typeof OAuthRefreshTokenId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthRefreshTokenId>;
  export namespace RowId {
    export type Type = typeof OAuthRefreshTokenId.privateSchema.Type;
    export type Encoded = typeof OAuthRefreshTokenId.privateSchema.Encoded;
  }
}

export const OAuthConsentId = make("oauth_consent", {
  brand: "OAuthConsentId",
  actions: ["create", "read", "update", "delete", "*"],
}).annotations(
  $I.annotations("OAuthConsentId", {
    description: "A unique identifier for an OAuth consent record",
  })
);

export declare namespace OAuthConsentId {
  export type Type = S.Schema.Type<typeof OAuthConsentId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthConsentId>;
  export namespace RowId {
    export type Type = typeof OAuthConsentId.privateSchema.Type;
    export type Encoded = typeof OAuthConsentId.privateSchema.Encoded;
  }
}

export const Ids = {
  AccountId,
  ScimProviderId,
  ApiKeyId,
  InvitationId,
  JwksId,
  MemberId,
  PasskeyId,
  RateLimitId,
  SsoProviderId,
  SubscriptionId,
  TeamMemberId,
  TwoFactorId,
  VerificationId,
  WalletAddressId,
  OrganizationRoleId,
  DeviceCodeId,
  OAuthClientId,
  OAuthAccessTokenId,
  OAuthRefreshTokenId,
  OAuthConsentId,
} as const;
