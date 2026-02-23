/**
 * OrganizationMembership - User membership in an organization
 *
 * Represents a user's membership in an organization, including their base role,
 * functional roles, status, and audit fields for removal/reinstatement tracking.
 *
 * @module membership/OrganizationMembership
 */

import { BS } from "@beep/schema";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import { BaseRole } from "../authorization/BaseRole.ts";
import { MembershipStatus } from "./MembershipStatus.ts";
import { OrganizationMembershipId } from "./OrganizationMembershipId.ts";

/**
 * OrganizationMembership - A user's membership in an organization
 *
 * Tracks:
 * - Base role (owner, admin, member, viewer)
 * - Functional roles (controller, finance_manager, accountant, period_admin, consolidation_manager)
 * - Status with soft delete support (active, suspended, removed)
 * - Removal and reinstatement history
 */
export class OrganizationMembership extends S.Class<OrganizationMembership>("OrganizationMembership")({
  /**
   * Unique identifier for this membership record
   */
  id: OrganizationMembershipId,

  /**
   * The user who is a member
   */
  userId: SharedEntityIds.UserId,

  /**
   * The organization the user is a member of
   */
  organizationId: SharedEntityIds.OrganizationId,

  /**
   * Base role determining default permission set
   */
  role: BaseRole,

  /**
   * Functional role: controller - Period lock/unlock, consolidation oversight
   */
  isController: S.Boolean,

  /**
   * Functional role: finance_manager - Account management, exchange rates
   */
  isFinanceManager: S.Boolean,

  /**
   * Functional role: accountant - Journal entry operations
   */
  isAccountant: S.Boolean,

  /**
   * Functional role: period_admin - Period open/close operations
   */
  isPeriodAdmin: S.Boolean,

  /**
   * Functional role: consolidation_manager - Consolidation group management
   */
  isConsolidationManager: S.Boolean,

  /**
   * Current membership status
   */
  status: MembershipStatus,

  /**
   * When the member was removed (if status is 'removed')
   */
  removedAt: S.OptionFromNullOr(BS.DateTimeUtcFromAllAcceptable),

  /**
   * Who removed the member
   */
  removedBy: S.OptionFromNullOr(SharedEntityIds.UserId),

  /**
   * Reason for removal
   */
  removalReason: S.OptionFromNullOr(S.String),

  /**
   * When the member was reinstated (if previously removed)
   */
  reinstatedAt: S.OptionFromNullOr(BS.DateTimeUtcFromAllAcceptable),

  /**
   * Who reinstated the member
   */
  reinstatedBy: S.OptionFromNullOr(SharedEntityIds.UserId),

  /**
   * When the membership was created
   */
  createdAt: BS.DateTimeUtcFromAllAcceptable,

  /**
   * When the membership was last updated
   */
  updatedAt: BS.DateTimeUtcFromAllAcceptable,

  /**
   * Who invited this member (if invited via invitation flow)
   */
  invitedBy: S.OptionFromNullOr(SharedEntityIds.UserId),
}) {
  /**
   * Check if the member has a specific functional role
   */
  hasFunctionalRole(
    role: "controller" | "finance_manager" | "accountant" | "period_admin" | "consolidation_manager"
  ): boolean {
    switch (role) {
      case "controller":
        return this.isController;
      case "finance_manager":
        return this.isFinanceManager;
      case "accountant":
        return this.isAccountant;
      case "period_admin":
        return this.isPeriodAdmin;
      case "consolidation_manager":
        return this.isConsolidationManager;
    }
  }

  /**
   * Get all functional roles as an array
   */
  getFunctionalRoles(): Array<
    "controller" | "finance_manager" | "accountant" | "period_admin" | "consolidation_manager"
  > {
    const roles: Array<"controller" | "finance_manager" | "accountant" | "period_admin" | "consolidation_manager"> = [];
    if (this.isController) roles.push("controller");
    if (this.isFinanceManager) roles.push("finance_manager");
    if (this.isAccountant) roles.push("accountant");
    if (this.isPeriodAdmin) roles.push("period_admin");
    if (this.isConsolidationManager) roles.push("consolidation_manager");
    return roles;
  }

  /**
   * Check if the membership is active
   */
  isActive(): boolean {
    return this.status === "active";
  }

  /**
   * Check if the user is the organization owner
   */
  isOwner(): boolean {
    return this.role === "owner";
  }

  /**
   * Check if the user is an admin (owner or admin role)
   */
  isAdmin(): boolean {
    return this.role === "owner" || this.role === "admin";
  }
}

/**
 * Type guard for OrganizationMembership using S.is
 */
export const isOrganizationMembership = S.is(OrganizationMembership);
