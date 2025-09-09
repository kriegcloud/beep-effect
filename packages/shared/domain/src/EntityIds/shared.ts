import { BS } from "@beep/schema";
//----------------------------------------------------------------------------------------------------------------------
// Shared ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------
export const OrganizationIdKit = new BS.EntityIdKit({
  tableName: "organization",
  brand: "OrganizationId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/OrganizationId"),
    description: "A unique identifier for an organization",
  },
});
export class OrganizationId extends OrganizationIdKit.Schema {
  static readonly tableName = OrganizationIdKit.tableName;
  static readonly create = OrganizationIdKit.create;
  static readonly make = OrganizationIdKit.make;
  static readonly is = OrganizationIdKit.is;
}

export namespace OrganizationId {
  export type Type = typeof OrganizationId.Type;
  export type Encoded = typeof OrganizationId.Encoded;
}
export const TeamIdKit = new BS.EntityIdKit({
  tableName: "team",
  brand: "TeamId",
  annotations: {
    schemaId: Symbol.for("@beep/shared/domain/EntityIds/shared/TeamId"),
    description: "A unique identifier for a team",
  },
});
export class TeamId extends TeamIdKit.Schema {
  static readonly tableName = TeamIdKit.tableName;
  static readonly create = TeamIdKit.create;
  static readonly make = TeamIdKit.make;
  static readonly is = TeamIdKit.is;
}

export namespace TeamId {
  export type Type = typeof TeamId.Type;
  export type Encoded = typeof TeamId.Encoded;
}
