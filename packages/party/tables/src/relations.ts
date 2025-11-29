import { relations } from "drizzle-orm";
import {
  contactPoint,
  organization,
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

export const partyRoleTypeRelations = relations(partyRoleType, ({ one, many }) => ({
  organization: one(organization, {
    fields: [partyRoleType.organizationId],
    references: [organization.id],
  }),
  partyRoles: many(partyRole),
  fromRoleRelationships: many(partyRelationship, { relationName: "fromRoleTypeRelations" }),
  toRoleRelationships: many(partyRelationship, { relationName: "toRoleTypeRelations" }),
}));

export const partyRoleRelations = relations(partyRole, ({ one }) => ({
  organization: one(organization, {
    fields: [partyRole.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [partyRole.partyId],
    references: [party.id],
  }),
  roleType: one(partyRoleType, {
    fields: [partyRole.roleTypeId],
    references: [partyRoleType.id],
  }),
}));

export const contactPointRelations = relations(contactPoint, ({ one, many }) => ({
  organization: one(organization, {
    fields: [contactPoint.organizationId],
    references: [organization.id],
  }),
  partyContactPoints: many(partyContactPoint),
}));

export const partyContactPointRelations = relations(partyContactPoint, ({ one }) => ({
  organization: one(organization, {
    fields: [partyContactPoint.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [partyContactPoint.partyId],
    references: [party.id],
  }),
  contactPoint: one(contactPoint, {
    fields: [partyContactPoint.contactPointId],
    references: [contactPoint.id],
  }),
}));

export const partyIdentifierRelations = relations(partyIdentifier, ({ one }) => ({
  organization: one(organization, {
    fields: [partyIdentifier.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [partyIdentifier.partyId],
    references: [party.id],
  }),
  partyIdentifierType: one(partyIdentifierType, {
    fields: [partyIdentifier.identifierTypeId],
    references: [partyIdentifierType.id],
  }),
}));

export const partyRelationshipRelations = relations(partyRelationship, ({ one }) => ({
  organization: one(organization, {
    fields: [partyRelationship.organizationId],
    references: [organization.id],
  }),
  fromParty: one(party, {
    fields: [partyRelationship.fromPartyId],
    references: [party.id],
    relationName: "partyRelationshipFrom",
  }),
  toParty: one(party, {
    fields: [partyRelationship.toPartyId],
    references: [party.id],
    relationName: "partyRelationshipTo",
  }),
  partyRelationshipType: one(partyRelationshipType, {
    fields: [partyRelationship.relationshipTypeId],
    references: [partyRelationshipType.id],
  }),
  fromRoleType: one(partyRoleType, {
    fields: [partyRelationship.fromRoleTypeId],
    references: [partyRoleType.id],
    relationName: "fromRoleTypeRelations",
  }),
  toRoleType: one(partyRoleType, {
    fields: [partyRelationship.toRoleTypeId],
    references: [partyRoleType.id],
    relationName: "toRoleTypeRelations",
  }),
}));

export const partyRelations = relations(party, ({ one, many }) => ({
  tenantOrganization: one(organization, {
    fields: [party.organizationId],
    references: [organization.id],
  }),
  person: one(person, {
    fields: [party.id],
    references: [person.partyId],
  }),
  partyOrganization: one(partyOrganization, {
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
  organization: one(organization, {
    fields: [person.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [person.partyId],
    references: [party.id],
  }),
}));

export const partyOrganizationRelations = relations(partyOrganization, ({ one }) => ({
  organization: one(organization, {
    fields: [partyOrganization.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [partyOrganization.partyId],
    references: [party.id],
  }),
}));

export const partyGroupRelations = relations(partyGroup, ({ one }) => ({
  organization: one(organization, {
    fields: [partyGroup.organizationId],
    references: [organization.id],
  }),
  party: one(party, {
    fields: [partyGroup.partyId],
    references: [party.id],
  }),
}));

export const partyRelationshipTypeRelations = relations(partyRelationshipType, ({ one, many }) => ({
  organization: one(organization, {
    fields: [partyRelationshipType.organizationId],
    references: [organization.id],
  }),
  partyRelationships: many(partyRelationship),
}));

export const partyIdentifierTypeRelations = relations(partyIdentifierType, ({ one, many }) => ({
  organization: one(organization, {
    fields: [partyIdentifierType.organizationId],
    references: [organization.id],
  }),
  partyIdentifiers: many(partyIdentifier),
}));

// Organization relations for party slice
export const partySliceOrganizationRelations = relations(organization, ({ many }) => ({
  parties: many(party),
  persons: many(person),
  partyOrganizations: many(partyOrganization),
  partyGroups: many(partyGroup),
  partyRoles: many(partyRole),
  partyRoleTypes: many(partyRoleType),
  partyRelationships: many(partyRelationship),
  partyRelationshipTypes: many(partyRelationshipType),
  contactPoints: many(contactPoint),
  partyContactPoints: many(partyContactPoint),
  partyIdentifiers: many(partyIdentifier),
  partyIdentifierTypes: many(partyIdentifierType),
}));
