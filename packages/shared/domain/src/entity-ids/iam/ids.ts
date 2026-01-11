import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity-ids/iam/ids");
const make = EntityId.builder("iam");
export const AccountId = make("account", {
  brand: "AccountId",
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

export const OAuthAccessTokenId = make("oauth_access_token", {
  brand: "OAuthAccessTokenId",
}).annotations(
  $I.annotations("OAuthAccessTokenId", {
    description: "A unique identifier for an oauth access token",
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

export const OAuthApplicationId = make("oauth_application", {
  brand: "OAuthApplicationId",
}).annotations(
  $I.annotations("OAuthApplicationId", {
    description: "A unique identifier for an oauth application",
  })
);

export declare namespace OAuthApplicationId {
  export type Type = S.Schema.Type<typeof OAuthApplicationId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthApplicationId>;
  export namespace RowId {
    export type Type = typeof OAuthApplicationId.privateSchema.Type;
    export type Encoded = typeof OAuthApplicationId.privateSchema.Encoded;
  }
}

export const OAuthConsentId = make("oauth_consent", {
  brand: "OAuthConsentId",
}).annotations(
  $I.annotations("OAuthConsentId", {
    description: "A unique identifier for an oauth consent",
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

export const PasskeyId = make("passkey", {
  brand: "PasskeyId",
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
