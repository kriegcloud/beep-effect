import { EntityId } from "@beep/schema/identity";
import type * as S from "effect/Schema";
export const PartyId = EntityId.make("party", {
  brand: "PartyId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/Party"),
    description: "A unique identifier for a Party",
  },
});

export declare namespace PartyId {
  export type Type = S.Schema.Type<typeof PartyId>;
  export type Encoded = S.Schema.Encoded<typeof PartyId>;
}

export const PersonId = EntityId.make("person", {
  brand: "PersonId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/Person"),
    description: "A unique identifier for a Person",
  },
});

export declare namespace PersonId {
  export type Type = S.Schema.Type<typeof PersonId>;
  export type Encoded = S.Schema.Encoded<typeof PersonId>;
}

export const PartyOrganizationId = EntityId.make("party_organization", {
  brand: "PartyOrganizationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyOrganization"),
    description: "A unique identifier for a PartyOrganization",
  },
});

export declare namespace PartyOrganizationId {
  export type Type = S.Schema.Type<typeof PartyOrganizationId>;
  export type Encoded = S.Schema.Encoded<typeof PartyOrganizationId>;
}

export const PartyGroupId = EntityId.make("party_group", {
  brand: "PartyGroupId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyGroupId"),
    description: "A unique identifier for a PartyGroup",
  },
});

export declare namespace PartyGroupId {
  export type Type = S.Schema.Type<typeof PartyGroupId>;
  export type Encoded = S.Schema.Encoded<typeof PartyGroupId>;
}

export const PartyRoleTypeId = EntityId.make("party_role_type", {
  brand: "PartyRoleTypeId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyRoleTypeId"),
    description: "A unique identifier for a PartyRoleType",
  },
});

export declare namespace PartyRoleTypeId {
  export type Type = S.Schema.Type<typeof PartyRoleTypeId>;
  export type Encoded = S.Schema.Encoded<typeof PartyRoleTypeId>;
}

export const PartyRoleId = EntityId.make("party_role", {
  brand: "PartyRoleId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyRoleId"),
    description: "A unique identifier for a PartyRole",
  },
});

export declare namespace PartyRoleId {
  export type Type = S.Schema.Type<typeof PartyRoleId>;
  export type Encoded = S.Schema.Encoded<typeof PartyRoleId>;
}

export const PartyRelationshipTypeId = EntityId.make("party_relationship_type", {
  brand: "PartyRelationShipTypeId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyRelationshipTypeId"),
    description: "A unique identifier for a PartyRelationshipType",
  },
});

export declare namespace PartyRelationshipTypeId {
  export type Type = S.Schema.Type<typeof PartyRelationshipTypeId>;
  export type Encoded = S.Schema.Encoded<typeof PartyRelationshipTypeId>;
}

export const PartyRelationshipId = EntityId.make("party_relationship", {
  brand: "PartyRelationshipId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyRelationshipId"),
    description: "A unique identifier for a PartyRelationShipType",
  },
});

export declare namespace PartyRelationshipId {
  export type Type = S.Schema.Type<typeof PartyRelationshipId>;
  export type Encoded = S.Schema.Encoded<typeof PartyRelationshipId>;
}

export const ContactPointId = EntityId.make("contact_point", {
  brand: "ContactPointId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/ContactPointId"),
    description: "A unique identifier for a ContactPointId",
  },
});

export declare namespace ContactPointId {
  export type Type = S.Schema.Type<typeof ContactPointId>;
  export type Encoded = S.Schema.Encoded<typeof ContactPointId>;
}

export const PartyContactPointId = EntityId.make("party_contact_point", {
  brand: "PartyContactPointId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyContactPointId"),
    description: "A unique identifier for a PartyContactPointId",
  },
});

export declare namespace PartyContactPointId {
  export type Type = S.Schema.Type<typeof PartyContactPointId>;
  export type Encoded = S.Schema.Encoded<typeof PartyContactPointId>;
}

export const PartyIdentifierTypeId = EntityId.make("party_identifier_type", {
  brand: "PartyIdentifierTypeId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyIdentifierTypeId"),
    description: "A unique identifier for a PartyIdentifierType",
  },
});

export declare namespace PartyIdentifierTypeId {
  export type Type = S.Schema.Type<typeof PartyIdentifierTypeId>;
  export type Encoded = S.Schema.Encoded<typeof PartyIdentifierTypeId>;
}

export const PartyIdentifierId = EntityId.make("party_identifier", {
  brand: "PartyIdentifierId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyIdentifierId"),
    description: "A unique identifier for a PartyIdentifier",
  },
});

export declare namespace PartyIdentifierId {
  export type Type = S.Schema.Type<typeof PartyIdentifierId>;
  export type Encoded = S.Schema.Encoded<typeof PartyIdentifierId>;
}
