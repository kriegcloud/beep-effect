/**
 * PolicyEffect - Effect of an authorization policy
 *
 * Defines what happens when a policy matches:
 * - 'allow': Grant access if this policy matches
 * - 'deny': Deny access if this policy matches (takes precedence)
 *
 * @module authorization/PolicyEffect
 */

import { BS } from "@beep/schema";
import * as S from "effect/Schema";
/**
 * PolicyEffect - The effect of a policy when it matches
 */
export const PolicyEffect = BS.StringLiteralKit("allow", "deny").annotations({
  identifier: "PolicyEffect",
  title: "Policy Effect",
  description: "The effect when an authorization policy matches",
});

/**
 * The PolicyEffect type
 */
export type PolicyEffect = typeof PolicyEffect.Type;

/**
 * Type guard for PolicyEffect using Schema.is
 */
export const isPolicyEffect = S.is(PolicyEffect);
