import { BS } from "@beep/schema";
import * as PartyEntityIds from "@beep/shared-domain/entity-ids/party";
import type * as S from "effect/Schema";

export class PartyTableName extends BS.StringLiteralKit(
  PartyEntityIds.PartyId.tableName,
  PartyEntityIds.PartyGroupId.tableName,
  PartyEntityIds.PartyOrganizationId.tableName,
  PartyEntityIds.PersonId.tableName,
  PartyEntityIds.PartyRoleTypeId.tableName,
  PartyEntityIds.PartyRoleId.tableName,
  PartyEntityIds.PartyRelationshipTypeId.tableName,
  PartyEntityIds.PartyRelationshipId.tableName,
  PartyEntityIds.ContactPointId.tableName,
  PartyEntityIds.PartyContactPointId.tableName,
  PartyEntityIds.PartyIdentifierTypeId.tableName,
  PartyEntityIds.PartyIdentifierId.tableName
).annotations({
  schemaId: Symbol.for("@beep/shared/domain/EntityIds/party/PartyTableName"),
  description: "The set of table_names for entities within the party bounded context",
  identifier: "PartyTableName",
  title: "Party Table Name",
}) {
  static readonly Tagged = PartyTableName.toTagged("tableName");
}

export declare namespace PartyTableName {
  export type Type = S.Schema.Type<typeof PartyTableName>;
  export type Encoded = S.Schema.Encoded<typeof PartyTableName>;
}
