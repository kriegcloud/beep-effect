import { $SharedDomainId } from "@beep/identity";
import { EntityId } from "./internal/index.js";

const $I = $SharedDomainId.create("entity-ids/Shared");
const make = EntityId.factory("shared", $I);
export const OrganizationId = make("OrganizationId", {
  tableName: "organization",
});

export type OrganizationId = typeof OrganizationId.Type;

export const SessionId = make("SessionId", {
  tableName: "session",
});

export type SessionId = typeof SessionId.Type;
