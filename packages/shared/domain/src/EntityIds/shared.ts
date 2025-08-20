import { BS } from "@beep/schema";
//----------------------------------------------------------------------------------------------------------------------
// Shared ENTITY IDS
//----------------------------------------------------------------------------------------------------------------------

export const OrganizationId = BS.EntityId.make("OrganizationId")({
  identifier: "OrganizationId",
  description: "A unique identifier for an organization",
  title: "Organization Id",
});

export namespace OrganizationId {
  export type Type = typeof OrganizationId.Type;
  export type Encoded = typeof OrganizationId.Encoded;
}

export const TeamId = BS.EntityId.make("TeamId")({
  identifier: "TeamId",
  description: "A unique identifier for a team",
  title: "Team Id",
});

export namespace TeamId {
  export type Type = typeof TeamId.Type;
  export type Encoded = typeof TeamId.Encoded;
}
