import { relations } from "drizzle-orm";
import {
  contactPoint,
  party,
  partyContactPoint,
  partyGroup,
  partyIdentifier,
  partyIdentifierType,
  partyOrganization,
  partyRelationship,
  partyRelationshipType,
  partyRole,
  partyRoleType,
  person,
} from "./tables";

export const partyRoleTypeRelations = relations(partyRoleType, ({ one }) => ({
  partyRole: one(partyRole, {
    fields: [partyRoleType.id],
    references: [partyRole.id],
  }),
}));

export const contactPointRelations = relations(contactPoint, ({ one }) => ({
  partyContactPoint: one(partyContactPoint, {
    fields: [contactPoint.id],
    references: [partyContactPoint.contactPointId],
  }),
}));

export const partyContactPointRelations = relations(partyContactPoint, ({ one }) => ({
  contactPoint: one(contactPoint, {
    fields: [partyContactPoint.contactPointId],
    references: [contactPoint.id],
  }),
}));

export const partyIdentifierRelations = relations(partyIdentifier, ({ one }) => ({
  partyIdentifierType: one(partyIdentifierType, {
    fields: [partyIdentifier.identifierTypeId],
    references: [partyIdentifierType.id],
  }),
}));

export const partyRelationshipRelations = relations(partyRelationship, ({ one }) => ({
  partyRelationshipType: one(partyRelationshipType, {
    fields: [partyRelationship.relationshipTypeId],
    references: [partyRelationshipType.id],
  }),
}));

export const partyRelations = relations(party, ({ one, many }) => ({
  person: one(person, {
    fields: [party.id],
    references: [person.partyId],
  }),
  organization: one(partyOrganization, {
    fields: [party.id],
    references: [partyOrganization.partyId],
  }),
  group: one(partyGroup, {
    fields: [party.id],
    references: [partyGroup.partyId],
  }),
  roles: many(partyRole),
  relationshipsFrom: many(partyRelationship, {
    relationName: "partyRelationshipFrom",
  }),
  relationshipsTo: many(partyRelationship, {
    relationName: "partyRelationshipTo",
  }),
  identifiers: many(partyIdentifier),
  contactPoint: many(partyContactPoint),
}));

export const personRelations = relations(person, ({ one }) => ({
  party: one(party, {
    fields: [person.partyId],
    references: [party.id],
  }),
}));
