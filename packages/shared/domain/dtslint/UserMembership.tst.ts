import type * as Membership from "@beep/shared-domain/entities/Membership";
import type * as User from "@beep/shared-domain/entities/User";
import type * as Shared from "@beep/shared-domain/identity/Shared";
import { describe, expect, it } from "tstyche";

describe("User and Membership types", () => {
  it("preserves User entity metadata", () => {
    expect<typeof User.Model.definition.entityId>().type.toBe<typeof Shared.UserId>();
    expect<typeof User.Model.definition.entityId.tableName>().type.toBe<"shared_user">();
    expect<typeof User.Model.definition.entityId.entityType>().type.toBe<"SharedUser">();
    expect<typeof User.Model.definition.persisted.displayName.columnName>().type.toBe<"display_name">();
    expect<User.Model["displayName"]>().type.toBe<string>();
  });

  it("preserves Membership entity metadata and vocabulary", () => {
    expect<typeof Membership.Model.definition.entityId>().type.toBe<typeof Shared.MembershipId>();
    expect<typeof Membership.Model.definition.entityId.tableName>().type.toBe<"shared_membership">();
    expect<typeof Membership.Model.definition.entityId.entityType>().type.toBe<"SharedMembership">();
    expect<typeof Membership.Model.definition.fields.userId.Type>().type.toBe<Shared.UserId>();
    expect<typeof Membership.Model.definition.fields.role.Type>().type.toBe<"owner" | "member">();
    expect<typeof Membership.Model.definition.fields.status.Type>().type.toBe<"active">();
    expect<typeof Membership.Model.definition.persisted.userId.columnName>().type.toBe<"user_id">();
    expect<Membership.Model["orgId"]>().type.toBe<Shared.OrganizationId>();
    expect<Membership.Model["userId"]>().type.toBe<Shared.UserId>();
  });
});
