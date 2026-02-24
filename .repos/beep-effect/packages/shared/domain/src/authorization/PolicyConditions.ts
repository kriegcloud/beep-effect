/**
 * PolicyConditions - ABAC policy condition schemas
 *
 * Defines the condition schemas used in ABAC (Attribute-Based Access Control) policies.
 * These conditions determine when a policy applies based on:
 * - Subject: Who is making the request (roles, users)
 * - Resource: What resource is being accessed (type, attributes)
 * - Action: What action is being performed
 * - Environment: Contextual conditions (time, IP)
 *
 * @module authorization/PolicyConditions
 */

import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import { Action, SharedEntityIds } from "../entity-ids";
import { BaseRole } from "./BaseRole.ts";
import { FunctionalRole } from "./FunctionalRole.ts";

// =============================================================================
// Subject Conditions
// =============================================================================

/**
 * SubjectCondition - Defines who a policy applies to
 *
 * All fields are optional and combined with AND logic:
 * - If roles is specified, the user must have one of the specified roles
 * - If functionalRoles is specified, the user must have one of the specified functional roles
 * - If userIds is specified, the user must be in the list
 * - If isPlatformAdmin is specified, the user must match that platform admin status
 */
export const SubjectCondition = S.Struct({
  /**
   * Match users with any of these base roles
   */
  roles: S.optional(S.Array(BaseRole)).annotations({
    title: "Roles",
    description: "Match users with any of these base roles",
  }),

  /**
   * Match users with any of these functional roles
   */
  functionalRoles: S.optional(S.Array(FunctionalRole)).annotations({
    title: "Functional Roles",
    description: "Match users with any of these functional roles",
  }),

  /**
   * Match specific users by ID
   */
  userIds: S.optional(S.Array(SharedEntityIds.UserId)).annotations({
    title: "User IDs",
    description: "Match specific users by their ID",
  }),

  /**
   * Match by platform admin status
   */
  isPlatformAdmin: S.optional(S.Boolean).annotations({
    title: "Is Platform Admin",
    description: "Match users by their platform admin status",
  }),
}).annotations({
  identifier: "SubjectCondition",
  title: "Subject Condition",
  description: "Conditions that determine which users a policy applies to",
});

/**
 * The SubjectCondition type
 */
export type SubjectCondition = typeof SubjectCondition.Type;

/**
 * Type guard for SubjectCondition using S.is
 */
export const isSubjectCondition = S.is(SubjectCondition);

// =============================================================================
// Resource Conditions
// =============================================================================

/**
 * AccountNumberCondition - Conditions based on account number
 */
export const AccountNumberCondition = S.Struct({
  /**
   * Account number must be within this range [min, max]
   */
  range: S.optional(S.Tuple(S.Number, S.Number)).annotations({
    title: "Range",
    description: "Account number range [min, max]",
  }),

  /**
   * Account number must be one of these specific values
   */
  in: S.optional(S.Array(S.Number)).annotations({
    title: "In",
    description: "Specific account numbers to match",
  }),
}).annotations({
  identifier: "AccountNumberCondition",
  title: "Account Number Condition",
  description: "Conditions based on account number",
});

/**
 * Account types for resource conditions
 */
export const AccountTypeCondition = BS.StringLiteralKit("Asset", "Liability", "Equity", "Revenue", "Expense");

/**
 * Journal entry types for resource conditions
 */
export const JournalEntryTypeCondition = BS.StringLiteralKit(
  "Standard",
  "Adjusting",
  "Closing",
  "Reversing",
  "Elimination",
  "Consolidation",
  "Intercompany"
);

/**
 * Period status for resource conditions
 * Matches the FiscalPeriodStatus domain type
 */
export const PeriodStatusCondition = BS.StringLiteralKit("Future", "Open", "SoftClose", "Closed", "Locked");

/**
 * ResourceAttributes - Additional attributes for resource matching
 */
export const ResourceAttributes = S.Struct({
  /**
   * Account number conditions
   */
  accountNumber: S.optional(AccountNumberCondition).annotations({
    title: "Account Number",
    description: "Conditions based on account number",
  }),

  /**
   * Match accounts of these types
   */
  accountType: S.optional(S.Array(AccountTypeCondition)).annotations({
    title: "Account Type",
    description: "Match accounts of these types",
  }),

  /**
   * Match intercompany-related resources
   */
  isIntercompany: S.optional(S.Boolean).annotations({
    title: "Is Intercompany",
    description: "Match intercompany-related resources",
  }),

  /**
   * Match journal entries of these types
   */
  entryType: S.optional(S.Array(JournalEntryTypeCondition)).annotations({
    title: "Entry Type",
    description: "Match journal entries of these types",
  }),

  /**
   * Match journal entries created by the requesting user
   */
  isOwnEntry: S.optional(S.Boolean).annotations({
    title: "Is Own Entry",
    description: "Match journal entries created by the requesting user",
  }),

  /**
   * Match fiscal periods with these statuses
   */
  periodStatus: S.optional(S.Array(PeriodStatusCondition)).annotations({
    title: "Period Status",
    description: "Match fiscal periods with these statuses",
  }),

  /**
   * Match adjustment periods
   */
  isAdjustmentPeriod: S.optional(S.Boolean).annotations({
    title: "Is Adjustment Period",
    description: "Match adjustment periods",
  }),
}).annotations({
  identifier: "ResourceAttributes",
  title: "Resource Attributes",
  description: "Attribute conditions for resource matching",
});

/**
 * The ResourceAttributes type
 */
export type ResourceAttributes = typeof ResourceAttributes.Type;

/**
 * ResourceType for policy conditions
 */
export const PolicyResourceType = BS.StringLiteralKit(
  "organization",
  "company",
  "account",
  "journal_entry",
  "fiscal_period",
  "consolidation_group",
  "report",
  "*"
).annotations({
  identifier: "PolicyResourceType",
  title: "Policy Resource Type",
  description: "The type of resource in a policy condition",
});

/**
 * ResourceCondition - Defines what resources a policy applies to
 */
export const ResourceCondition = S.Struct({
  /**
   * The type of resource (use "*" to match all resource types)
   */
  type: PolicyResourceType.annotations({
    title: "Resource Type",
    description: "The type of resource this policy applies to",
  }),

  /**
   * Additional attribute conditions for finer-grained matching
   */
  attributes: S.optional(ResourceAttributes).annotations({
    title: "Attributes",
    description: "Additional attribute conditions for resource matching",
  }),
}).annotations({
  identifier: "ResourceCondition",
  title: "Resource Condition",
  description: "Conditions that determine which resources a policy applies to",
});

/**
 * The ResourceCondition type
 */
export type ResourceCondition = typeof ResourceCondition.Type;

/**
 * Type guard for ResourceCondition using S.is
 */
export const isResourceCondition = S.is(ResourceCondition);

// =============================================================================
// Action Conditions
// =============================================================================

/**
 * ActionCondition - Defines what actions a policy applies to
 *
 * The actions array supports:
 * - Exact match: "journal_entry:create" matches "journal_entry:create"
 * - Wildcard: "*" matches any action
 * - Prefix wildcard: "journal_entry:*" matches all journal_entry actions
 */
export const ActionCondition = S.Struct({
  /**
   * Actions this policy applies to
   */
  actions: S.Array(Action).annotations({
    title: "Actions",
    description: "The actions this policy applies to",
  }),
}).annotations({
  identifier: "ActionCondition",
  title: "Action Condition",
  description: "Conditions that determine which actions a policy applies to",
});

/**
 * The ActionCondition type
 */
export type ActionCondition = typeof ActionCondition.Type;

/**
 * Type guard for ActionCondition using S.is
 */
export const isActionCondition = S.is(ActionCondition);

// =============================================================================
// Environment Conditions
// =============================================================================

/**
 * TimeRange - A time of day range
 */
export const TimeRange = S.Struct({
  /**
   * Start time (HH:MM format, 24-hour)
   */
  start: S.String.pipe(S.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)).annotations({
    title: "Start Time",
    description: "Start time in HH:MM format (24-hour)",
  }),

  /**
   * End time (HH:MM format, 24-hour)
   */
  end: S.String.pipe(S.pattern(/^([01]\d|2[0-3]):[0-5]\d$/)).annotations({
    title: "End Time",
    description: "End time in HH:MM format (24-hour)",
  }),
}).annotations({
  identifier: "TimeRange",
  title: "Time Range",
  description: "A time of day range in HH:MM format",
});

/**
 * EnvironmentCondition - Contextual conditions for policy evaluation
 *
 * All fields are optional and combined with AND logic.
 */
export const EnvironmentCondition = S.Struct({
  /**
   * Time of day restriction
   */
  timeOfDay: S.optional(TimeRange).annotations({
    title: "Time of Day",
    description: "Restrict to certain hours of the day",
  }),

  /**
   * Days of week restriction (0=Sunday, 6=Saturday)
   */
  daysOfWeek: S.optional(S.Array(S.Number.pipe(S.int(), S.between(0, 6)))).annotations({
    title: "Days of Week",
    description: "Restrict to certain days (0=Sunday, 6=Saturday)",
  }),

  /**
   * IP addresses or CIDR ranges to allow
   */
  ipAllowList: S.optional(S.Array(S.String)).annotations({
    title: "IP Allow List",
    description: "IP addresses or CIDR ranges to allow",
  }),

  /**
   * IP addresses or CIDR ranges to deny
   */
  ipDenyList: S.optional(S.Array(S.String)).annotations({
    title: "IP Deny List",
    description: "IP addresses or CIDR ranges to deny",
  }),
}).annotations({
  identifier: "EnvironmentCondition",
  title: "Environment Condition",
  description: "Contextual conditions based on request environment",
});

/**
 * The EnvironmentCondition type
 */
export type EnvironmentCondition = typeof EnvironmentCondition.Type;

/**
 * Type guard for EnvironmentCondition using S.is
 */
export const isEnvironmentCondition = S.is(EnvironmentCondition);
