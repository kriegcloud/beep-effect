/**
 * Wealth Management entity IDs
 *
 * Defines branded entity identifiers for the wealth-management slice.
 *
 * @module wealth-management/entity-ids/ids
 * @since 0.1.0
 */
import { $SharedDomainId } from "@beep/identity/packages";
import { EntityId as EntityIdBuilder } from "@beep/schema/identity";
import type * as S from "effect/Schema";

const make = EntityIdBuilder.builder("wm");
const $I = $SharedDomainId.create("entity-ids/wealth-management/ids");

/**
 * Wealth Management Client entity ID.
 *
 * Identifier for individual or entity clients in wealth management.
 *
 * @since 0.1.0
 * @category ids
 */
export const WmClientId = make("client", {
  brand: "WmClientId",
}).annotations(
  $I.annotations("WmClientId", {
    description: "A unique identifier for a wealth management client",
  })
);

export declare namespace WmClientId {
  export type Type = S.Schema.Type<typeof WmClientId>;
  export type Encoded = S.Schema.Encoded<typeof WmClientId>;

  export namespace RowId {
    export type Type = typeof WmClientId.privateSchema.Type;
    export type Encoded = typeof WmClientId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Account entity ID.
 *
 * Identifier for investment and custody accounts.
 *
 * @since 0.1.0
 * @category ids
 */
export const WmAccountId = make("account", {
  brand: "WmAccountId",
}).annotations(
  $I.annotations("WmAccountId", {
    description: "A unique identifier for a wealth management account",
  })
);

export declare namespace WmAccountId {
  export type Type = S.Schema.Type<typeof WmAccountId>;
  export type Encoded = S.Schema.Encoded<typeof WmAccountId>;

  export namespace RowId {
    export type Type = typeof WmAccountId.privateSchema.Type;
    export type Encoded = typeof WmAccountId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Investment entity ID.
 *
 * Identifier for investment positions (securities, private funds, real estate, alternatives).
 *
 * @since 0.1.0
 * @category ids
 */
export const WmInvestmentId = make("investment", {
  brand: "WmInvestmentId",
}).annotations(
  $I.annotations("WmInvestmentId", {
    description: "A unique identifier for a wealth management investment",
  })
);

export declare namespace WmInvestmentId {
  export type Type = S.Schema.Type<typeof WmInvestmentId>;
  export type Encoded = S.Schema.Encoded<typeof WmInvestmentId>;

  export namespace RowId {
    export type Type = typeof WmInvestmentId.privateSchema.Type;
    export type Encoded = typeof WmInvestmentId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Trust entity ID.
 *
 * Identifier for trust structures (revocable, irrevocable, charitable).
 *
 * @since 0.1.0
 * @category ids
 */
export const WmTrustId = make("trust", {
  brand: "WmTrustId",
}).annotations(
  $I.annotations("WmTrustId", {
    description: "A unique identifier for a wealth management trust",
  })
);

export declare namespace WmTrustId {
  export type Type = S.Schema.Type<typeof WmTrustId>;
  export type Encoded = S.Schema.Encoded<typeof WmTrustId>;

  export namespace RowId {
    export type Type = typeof WmTrustId.privateSchema.Type;
    export type Encoded = typeof WmTrustId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Household entity ID.
 *
 * Identifier for household groupings of clients.
 *
 * @since 0.1.0
 * @category ids
 */
export const WmHouseholdId = make("household", {
  brand: "WmHouseholdId",
}).annotations(
  $I.annotations("WmHouseholdId", {
    description: "A unique identifier for a wealth management household",
  })
);

export declare namespace WmHouseholdId {
  export type Type = S.Schema.Type<typeof WmHouseholdId>;
  export type Encoded = S.Schema.Encoded<typeof WmHouseholdId>;

  export namespace RowId {
    export type Type = typeof WmHouseholdId.privateSchema.Type;
    export type Encoded = typeof WmHouseholdId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Beneficiary entity ID.
 *
 * Identifier for beneficiary designations on accounts and trusts.
 *
 * @since 0.1.0
 * @category ids
 */
export const WmBeneficiaryId = make("beneficiary", {
  brand: "WmBeneficiaryId",
}).annotations(
  $I.annotations("WmBeneficiaryId", {
    description: "A unique identifier for a wealth management beneficiary",
  })
);

export declare namespace WmBeneficiaryId {
  export type Type = S.Schema.Type<typeof WmBeneficiaryId>;
  export type Encoded = S.Schema.Encoded<typeof WmBeneficiaryId>;

  export namespace RowId {
    export type Type = typeof WmBeneficiaryId.privateSchema.Type;
    export type Encoded = typeof WmBeneficiaryId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Custodian entity ID.
 *
 * Identifier for custodian institutions holding assets.
 *
 * @since 0.1.0
 * @category ids
 */
export const WmCustodianId = make("custodian", {
  brand: "WmCustodianId",
}).annotations(
  $I.annotations("WmCustodianId", {
    description: "A unique identifier for a wealth management custodian",
  })
);

export declare namespace WmCustodianId {
  export type Type = S.Schema.Type<typeof WmCustodianId>;
  export type Encoded = S.Schema.Encoded<typeof WmCustodianId>;

  export namespace RowId {
    export type Type = typeof WmCustodianId.privateSchema.Type;
    export type Encoded = typeof WmCustodianId.privateSchema.Encoded;
  }
}

/**
 * Wealth Management Legal Entity entity ID.
 *
 * Identifier for legal entities (LLCs, partnerships, corporations).
 *
 * @since 0.1.0
 * @category ids
 */
export const WmLegalEntityId = make("entity", {
  brand: "WmLegalEntityId",
}).annotations(
  $I.annotations("WmLegalEntityId", {
    description: "A unique identifier for a wealth management legal entity",
  })
);

export declare namespace WmLegalEntityId {
  export type Type = S.Schema.Type<typeof WmLegalEntityId>;
  export type Encoded = S.Schema.Encoded<typeof WmLegalEntityId>;

  export namespace RowId {
    export type Type = typeof WmLegalEntityId.privateSchema.Type;
    export type Encoded = typeof WmLegalEntityId.privateSchema.Encoded;
  }
}
