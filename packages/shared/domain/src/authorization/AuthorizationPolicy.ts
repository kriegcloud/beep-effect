/**
 * AuthorizationPolicy - ABAC policy for fine-grained access control
 *
 * Represents an authorization policy that defines access rules based on
 * subject, resource, action, and optional environment conditions.
 *
 * Policies are evaluated in order of priority, with deny policies taking
 * precedence over allow policies at the same priority level.
 *
 * @module authorization/AuthorizationPolicy
 */

import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { SharedEntityIds } from "../entity-ids";
import { ActionCondition, EnvironmentCondition, ResourceCondition, SubjectCondition } from "./PolicyConditions.ts";
import { PolicyEffect } from "./PolicyEffect.ts";
import { PolicyId } from "./PolicyId.ts";

/**
 * AuthorizationPolicy - An ABAC policy for controlling access
 *
 * A policy consists of:
 * - Conditions: subject, resource, action, environment
 * - Effect: allow or deny
 * - Priority: higher priority policies are evaluated first
 * - System flag: system policies cannot be modified or deleted
 */
export class AuthorizationPolicy extends S.Class<AuthorizationPolicy>("AuthorizationPolicy")({
  /**
   * Unique identifier for this policy
   */
  id: PolicyId,

  /**
   * The organization this policy belongs to
   */
  organizationId: SharedEntityIds.OrganizationId,

  /**
   * Human-readable name for the policy
   */
  name: S.NonEmptyTrimmedString.annotations({
    title: "Name",
    description: "Human-readable name for the policy",
  }),

  /**
   * Optional description of what this policy does
   */
  description: S.OptionFromNullOr(S.String).annotations({
    title: "Description",
    description: "Optional description of what this policy does",
  }),

  /**
   * Subject condition - defines who this policy applies to
   */
  subject: SubjectCondition.annotations({
    title: "Subject",
    description: "Conditions that define who this policy applies to",
  }),

  /**
   * Resource condition - defines what resources this policy applies to
   */
  resource: ResourceCondition.annotations({
    title: "Resource",
    description: "Conditions that define what resources this policy applies to",
  }),

  /**
   * Action condition - defines what actions this policy applies to
   */
  action: ActionCondition.annotations({
    title: "Action",
    description: "Conditions that define what actions this policy applies to",
  }),

  /**
   * Environment condition - optional contextual conditions
   */
  environment: S.OptionFromNullOr(EnvironmentCondition).annotations({
    title: "Environment",
    description: "Optional contextual conditions (time, IP, etc.)",
  }),

  /**
   * Effect when this policy matches
   */
  effect: PolicyEffect.annotations({
    title: "Effect",
    description: "Whether to allow or deny when this policy matches",
  }),

  /**
   * Priority for conflict resolution (higher = evaluated first)
   * Default: 500, System policies use 900-1000
   */
  priority: S.Number.pipe(S.int(), S.between(0, 1000)).annotations({
    title: "Priority",
    description: "Priority for conflict resolution (higher = evaluated first)",
  }),

  /**
   * Whether this is a system-managed policy (cannot be modified/deleted)
   */
  isSystemPolicy: S.Boolean.annotations({
    title: "Is System Policy",
    description: "System policies cannot be modified or deleted",
  }),

  /**
   * Whether this policy is active
   */
  isActive: S.Boolean.annotations({
    title: "Is Active",
    description: "Whether this policy is currently active",
  }),

  /**
   * When the policy was created
   */
  createdAt: BS.DateTimeUtcFromAllAcceptable,

  /**
   * When the policy was last updated
   */
  updatedAt: BS.DateTimeUtcFromAllAcceptable,

  /**
   * Who created the policy
   */
  createdBy: S.OptionFromNullOr(SharedEntityIds.UserId),
}) {
  /**
   * Check if this policy can be modified
   */
  canModify(): boolean {
    return !this.isSystemPolicy;
  }

  /**
   * Check if this policy can be deleted
   */
  canDelete(): boolean {
    return !this.isSystemPolicy;
  }

  /**
   * Check if this is a deny policy
   */
  isDeny(): boolean {
    return this.effect === "deny";
  }

  /**
   * Check if this is an allow policy
   */
  isAllow(): boolean {
    return this.effect === "allow";
  }
}

/**
 * Type guard for AuthorizationPolicy using S.is
 */
export const isAuthorizationPolicy = S.is(AuthorizationPolicy);

/**
 * Default priority for user-created policies
 */
export const DEFAULT_POLICY_PRIORITY = 500;

/**
 * System policy priority levels
 *
 * Higher priority = evaluated first.
 * Deny policies at the same priority as allow policies will block access.
 *
 * Order of evaluation:
 * 1000 - Platform Admin Override (highest, allows anything)
 *  999 - Period Protection (deny policies for locked/closed/future periods)
 *  998 - SoftClose Controller Access (allow for controller roles)
 *  997 - SoftClose Default Deny (deny for everyone else in soft-close)
 *  900 - Owner Full Access
 *  500 - Custom policies (default)
 *  100 - Viewer Read-Only (lowest)
 */
export const SYSTEM_POLICY_PRIORITIES = {
  PLATFORM_ADMIN_OVERRIDE: 1000,
  LOCKED_PERIOD_PROTECTION: 999,
  CLOSED_PERIOD_PROTECTION: 999,
  FUTURE_PERIOD_PROTECTION: 999,
  SOFTCLOSE_CONTROLLER_ACCESS: 998,
  SOFTCLOSE_DEFAULT_DENY: 997,
  OWNER_FULL_ACCESS: 900,
  VIEWER_READ_ONLY: 100,
} as const;
