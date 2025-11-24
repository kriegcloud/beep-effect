import type * as Entities from "@beep/party-domain/entities";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import type * as tables from "./schema";

export const _checkSelectContactPoint: typeof Entities.ContactPoint.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.contactPoint
>;

export const _checkInsertContactPoint: typeof Entities.ContactPoint.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.contactPoint
>;

export const _checkSelectParty: typeof Entities.Party.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.party
>;
export const _checkInsertParty: typeof Entities.Party.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.party
>;

export const _checkSelectPartyContactPoint: typeof Entities.PartyContactPoint.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.partyContactPoint>;

export const _checkInsertPartyContactPoint: typeof Entities.PartyContactPoint.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.partyContactPoint>;

export const _checkSelectPartyGroup: typeof Entities.PartyGroup.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.partyGroup
>;

export const _checkInsertPartyGroup: typeof Entities.PartyGroup.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.partyGroup
>;

export const _checkSelectPartyIdentifier: typeof Entities.PartyIdentifier.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.partyIdentifier
>;

export const _checkInsertPartyIdentifier: typeof Entities.PartyIdentifier.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.partyIdentifier
>;
export const _checkSelectPartyIdentifierType: typeof Entities.PartyIdentifierType.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.partyIdentifierType>;

export const _checkInsertPartyIdentifierType: typeof Entities.PartyIdentifierType.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.partyIdentifierType>;

export const _checkSelectPartyOrganization: typeof Entities.PartyOrganization.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.partyOrganization>;

export const _checkInsertPartyOrganization: typeof Entities.PartyOrganization.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.partyOrganization>;

export const _checkSelectPartyRelationship: typeof Entities.PartyRelationship.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.partyRelationship>;

export const _checkInsertPartyRelationship: typeof Entities.PartyRelationship.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.partyRelationship>;

export const _checkSelectPartyRelationshipType: typeof Entities.PartyRelationshipType.Model.select.Encoded =
  {} as InferSelectModel<typeof tables.partyRelationshipType>;

export const _checkInsertPartyRelationshipType: typeof Entities.PartyRelationshipType.Model.insert.Encoded =
  {} as InferInsertModel<typeof tables.partyRelationshipType>;
