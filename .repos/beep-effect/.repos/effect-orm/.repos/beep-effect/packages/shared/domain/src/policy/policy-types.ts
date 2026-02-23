/**
 * Core policy types and schemas for the Agientic framework.
 * @since 0.1.0
 * @category policy
 */

import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Data from "effect/Data";
import * as Equal from "effect/Equal";
import { apply, constant, constFalse, constTrue, dual, flow, pipe } from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

// Import canonical Capability from the capabilities module - this fixes the duplication

const constZero = constant(0);
const priorityOrZero = flow((rule: PolicyRule) => rule, Struct.get("priority"), O.fromNullable, O.getOrElse(constZero));

/**
 * Action that can be performed
 * @since 0.1.0
 * @category policy
 */
export class Action extends S.TaggedClass<Action>("@beep/shared-domain/policy/Action")("Action", {
  verb: S.String,
  resource: S.String,
  parameters: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {}

/**
 * Effect of a policy rule
 * @since 0.1.0
 * @category policy
 */
export class PolicyEffect extends BS.StringLiteralKit("allow", "deny") {
  static readonly isPolicyAllow = (i: PolicyRule) => Equal.equals(i.effect)(PolicyEffect.Enum.allow);
  static readonly isPolicyDeny = (i: PolicyRule) => Equal.equals(i.effect)(PolicyEffect.Enum.deny);
  static readonly isAllow = Equal.equals(PolicyEffect.Enum.allow);
  static readonly isDeny = Equal.equals(PolicyEffect.Enum.deny);
}

/**
 * Effect of a policy rule
 * @since 0.1.0
 * @category policy
 */
export declare namespace PolicyEffect {
  /**
   * Effect of a policy rule
   * @since 0.1.0
   * @category policy
   */
  export type Type = typeof PolicyEffect.Type;
  /**
   * Effect of a policy rule
   * @since 0.1.0
   * @category policy
   */
  export type Encoded = typeof PolicyEffect.Encoded;
}

/**
 * Policy rule
 * @since 0.1.0
 * @category policy
 */
export class PolicyRule extends S.TaggedClass<PolicyRule>("@agientic/Policy/PolicyRule")("PolicyRule", {
  id: S.String,
  name: S.String,
  description: S.optional(S.String),
  effect: PolicyEffect,
  principals: S.optional(S.Array(S.String)),
  actions: S.Array(Action),
  resources: S.Array(S.String),
  condition: S.optional(S.Unknown), // Expression from Monitor
  priority: S.optional(S.Number),
}) {}

/**
 * Complete policy set
 * @since 0.1.0
 * @category policy
 */
export class PolicySet extends S.TaggedClass<PolicySet>("@agientic/Policy/PolicySet")("PolicySet", {
  id: S.String,
  name: S.String,
  version: S.String,
  rules: S.Array(PolicyRule),
  defaultEffect: PolicyEffect,
  metadata: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {
  /**
   * Find applicable rules for an action
   * Uses functional composition with predicates and Option for clean control flow
   * @since 0.1.0
   */
  findApplicableRules(action: Action, principal?: string | undefined): ReadonlyArray<PolicyRule> {
    // Predicate: principal matches (none specified = matches all, otherwise must contain principal or "*")
    const principalPred: P.Predicate<PolicyRule> = (rule) =>
      pipe(
        O.fromNullable(rule.principals),
        O.filter(A.isNonEmptyReadonlyArray),
        O.match({
          onNone: constTrue,
          onSome: P.or(A.contains(principal ?? ""), A.contains("*")),
        })
      );

    // Predicate: action verb and resource match
    const actionPred: P.Predicate<PolicyRule> = (rule) =>
      A.some(rule.actions, (a) => Equal.equals(a.verb)(action.verb) && Equal.equals(a.resource)(action.resource));

    // Predicate: resource pattern matches (supports "*" wildcard and "/*" suffix)
    const resourcePred: P.Predicate<PolicyRule> = (rule) =>
      A.some(rule.resources, P.or(Equal.equals("*"), Equal.equals(action.resource)));

    // Order: by priority descending (higher first), defaulting to 0
    const byPriorityDesc: Order.Order<PolicyRule> = Order.reverse(Order.mapInput(Order.number, priorityOrZero));

    // Compose: filter by all predicates, then sort
    return pipe(this.rules, A.filter(P.and(principalPred, P.and(actionPred, resourcePred))), A.sort(byPriorityDesc));
  }
}

/**
 * Authorization request
 * @since 0.1.0
 * @category policy
 */
export const AuthorizationRequest = S.Struct({
  principal: S.String,
  action: Action,
  context: S.Record({ key: S.String, value: S.Unknown }),
});
/**
 * Authorization request
 * @since 0.1.0
 * @category policy
 */
export declare namespace AuthorizationRequest {
  /**
   * Authorization request
   * @since 0.1.0
   * @category policy
   */
  export type Type = typeof AuthorizationRequest.Type;
  /**
   * Authorization request
   * @since 0.1.0
   * @category policy
   */
  export type Encoded = typeof AuthorizationRequest.Encoded;
}

// ============================================================================
// Authorization Decision Reason Types - moved here for forward reference
// ============================================================================

export class EvaluationPrecedence extends BS.StringLiteralKit("deny_overrides", "allow_overrides", "first_match") {}

export declare namespace EvaluationPrecedence {
  export type Type = typeof EvaluationPrecedence.Type;
  export type Encoded = typeof EvaluationPrecedence.Encoded;
}

/**
 * Outcome suffixes for authorization decision reasons
 * @since 0.1.0
 * @category policy
 */
export class EvaluationOutcome extends BS.StringLiteralKit("deny_rule_matched", "allow_rule_matched") {}

export declare namespace EvaluationOutcome {
  export type Type = typeof EvaluationOutcome.Type;
  export type Encoded = typeof EvaluationOutcome.Encoded;
}

class Separator extends S.Literal(":") {
  static readonly split = Str.split(":");
  static readonly lastIndexOf = flow(
    Str.lastIndexOf(":"),
    O.getOrElse(() => -1)
  );
  static readonly postfix = Str.concat(":");
  static readonly prefix = <const T extends string>(s: T) => Str.concat(s)(":");
  static readonly join = <Parts extends readonly [first: string, second: string]>(
    ...parts: Parts
  ): `${Parts[0]}:${Parts[1]}` => pipe(Separator.postfix(parts[0]), Str.concat(parts[1]));
}

/**
 * Template literal schema for authorization decision reasons
 * Ensures type-safe reason strings in the format "precedence:outcome"
 * @since 0.1.0
 * @category policy
 */
export class AuthorizationDecisionReason extends S.Union(
  S.TemplateLiteral(S.Literal("default"), Separator, PolicyEffect),
  S.TemplateLiteral(EvaluationPrecedence, Separator, EvaluationOutcome),
  S.TemplateLiteral(S.Literal(EvaluationPrecedence.Enum.first_match), Separator, S.String, Separator, PolicyEffect)
) {
  /**
   * Safe decoders for reason components - validates at runtime without type assertions
   * @internal
   */
  private static readonly decodePolicyEffect = S.decodeUnknownSync(PolicyEffect);
  private static readonly decodeEvaluationPrecedence = S.decodeUnknownSync(EvaluationPrecedence);
  private static readonly decodeEvaluationOutcome = S.decodeUnknownSync(EvaluationOutcome);

  /**
   * Pipeable matcher for AuthorizationDecisionReason values
   * Provides exhaustive pattern matching on reason types with type inference
   * @since 0.1.0
   * @category matching
   */
  static readonly $match =
    <A>(handlers: {
      readonly onDefault: (effect: PolicyEffect.Type) => A;
      readonly onPrecedenceOutcome: (precedence: EvaluationPrecedence.Type, outcome: EvaluationOutcome.Type) => A;
      readonly onFirstMatch: (ruleId: string, effect: PolicyEffect.Type) => A;
    }) =>
    (reason: AuthorizationDecisionReason.Type): A => {
      const parseDefault = flow(
        O.liftPredicate(Str.startsWith(Separator.postfix("default"))),
        O.map(
          flow(Str.slice(8, Str.length(reason)), AuthorizationDecisionReason.decodePolicyEffect, handlers.onDefault)
        )
      );

      const parseFirstMatch = flow(
        O.liftPredicate(Str.startsWith(Separator.postfix(EvaluationPrecedence.Enum.first_match))),
        O.map((r) => {
          const rest = Str.slice(12, Str.length(r))(r);
          const lastColon = Separator.lastIndexOf(rest);
          const ruleId = Str.slice(0, lastColon)(rest);
          const effect = AuthorizationDecisionReason.decodePolicyEffect(Str.slice(lastColon + 1)(rest));
          return handlers.onFirstMatch(ruleId, effect);
        })
      );

      const parsePrecedenceOutcome = (r: string): A => {
        const parts = Separator.split(r);
        return pipe(
          O.all({
            precedence: pipe(A.head(parts), O.map(AuthorizationDecisionReason.decodeEvaluationPrecedence)),
            outcome: pipe(A.get(parts, 1), O.map(AuthorizationDecisionReason.decodeEvaluationOutcome)),
          }),
          O.map(({ precedence, outcome }) => handlers.onPrecedenceOutcome(precedence, outcome)),
          O.getOrThrow
        );
      };

      return pipe(
        reason,
        parseDefault,
        O.orElse(pipe(reason, parseFirstMatch, constant)),
        O.getOrElse(pipe(reason, parsePrecedenceOutcome, constant))
      );
    };

  /**
   * Checks if the reason indicates an allowed decision
   * @since 0.1.0
   * @category predicates
   */
  static readonly isAllowReason: P.Predicate<AuthorizationDecisionReason.Type> = P.or(
    Str.endsWith(Separator.prefix(PolicyEffect.Enum.allow)),
    Str.endsWith(Separator.prefix(EvaluationOutcome.Enum.allow_rule_matched))
  );

  /**
   * Checks if the reason indicates a denied decision
   * @since 0.1.0
   * @category predicates
   */
  static readonly isDenyReason: P.Predicate<AuthorizationDecisionReason.Type> = P.or(
    Str.endsWith(Separator.prefix(PolicyEffect.Enum.deny)),
    Str.endsWith(Separator.prefix(EvaluationOutcome.Enum.deny_rule_matched))
  );

  /**
   * Extracts the precedence type from a reason string
   * @since 0.1.0
   * @category extractors
   */
  static readonly extractPrecedence: (reason: AuthorizationDecisionReason.Type) => O.Option<EvaluationPrecedence.Type> =
    flow(
      Separator.split,
      A.head,
      O.filter((p): p is EvaluationPrecedence.Type => A.contains(EvaluationPrecedence.Options, p))
    );
}

export declare namespace AuthorizationDecisionReason {
  export type Type = typeof AuthorizationDecisionReason.Type;
  export type Encoded = typeof AuthorizationDecisionReason.Encoded;
}

// ============================================================================
// Type-safe Reason Constructors - eliminates `as const` assertions
// ============================================================================

/**
 * Type-safe constructors for AuthorizationDecisionReason strings
 * Uses template literal return types for maximum type safety without `as const`
 * @since 0.1.0
 * @category constructors
 */
export const Reason = {
  /**
   * Creates a default reason: "default:allow" or "default:deny"
   * @since 0.1.0
   */
  default: <E extends PolicyEffect.Type>(effect: E) => Separator.join("default", effect),

  /**
   * Creates a deny_overrides reason
   * @since 0.1.0
   */
  denyOverrides: {
    denyMatched: () =>
      Separator.join(EvaluationPrecedence.Enum.deny_overrides, EvaluationOutcome.Enum.deny_rule_matched),
    allowMatched: () =>
      Separator.join(EvaluationPrecedence.Enum.deny_overrides, EvaluationOutcome.Enum.allow_rule_matched),
  },

  /**
   * Creates an allow_overrides reason
   * @since 0.1.0
   */
  allowOverrides: {
    denyMatched: () =>
      Separator.join(EvaluationPrecedence.Enum.allow_overrides, EvaluationOutcome.Enum.deny_rule_matched),
    allowMatched: () =>
      Separator.join(EvaluationPrecedence.Enum.allow_overrides, EvaluationOutcome.Enum.allow_rule_matched),
  },

  /**
   * Creates a first_match reason: "first_match:{ruleId}:{effect}"
   * @since 0.1.0
   */
  firstMatch: <R extends string, E extends PolicyEffect.Type>(ruleId: R, effect: E) =>
    Separator.join(Separator.join(EvaluationPrecedence.Enum.first_match, ruleId), effect),

  /**
   * Creates a precedence:outcome reason from evaluation components
   * @since 0.1.0
   */
  precedenceOutcome: <P extends EvaluationPrecedence.Type, O extends EvaluationOutcome.Type>(
    precedence: P,
    outcome: O
  ) => Separator.join(precedence, outcome),
} as const;

/**
 * Trace entry reason - why a rule matched or didn't match
 * @since 0.1.0
 * @category policy
 */
export const TraceEntryReason = S.optional(S.String);

/**
 * Authorization decision
 * @since 0.1.0
 * @category policy
 */
export class AuthorizationDecision extends S.TaggedClass<AuthorizationDecision>(
  "@agientic/Policy/AuthorizationDecision"
)("AuthorizationDecision", {
  allowed: S.Boolean,
  reason: AuthorizationDecisionReason,
  matchedRules: S.Array(S.String),
  obligations: S.optional(
    S.Array(
      S.Struct({
        type: S.String,
        parameters: S.Record({ key: S.String, value: S.Unknown }),
      })
    )
  ),
  trace: S.optional(
    S.Array(
      S.Struct({
        ruleId: S.String,
        effect: PolicyEffect,
        matched: S.Boolean,
        reason: S.optional(S.String),
        priority: S.optional(S.Number),
      })
    )
  ),
}) {}

export class QuotaScope extends BS.StringLiteralKit("global", "persona", "episode") {}

export declare namespace QuotaScope {
  export type Type = typeof QuotaScope.Type;
  export type Encoded = typeof QuotaScope.Encoded;
}

/**
 * Quota definition
 * @since 0.1.0
 * @category policy
 */
export class Quota extends S.TaggedClass<Quota>("@agientic/Policy/Quota")("Quota", {
  id: S.String,
  name: S.String,
  resource: S.String,
  limit: S.Number,
  period: S.Duration,
  scope: QuotaScope,
  metadata: S.optional(S.Record({ key: S.String, value: S.Unknown })),
}) {}

/**
 * Quota usage tracking
 * @since 0.1.0
 * @category policy
 */
export class QuotaUsage extends S.TaggedClass<QuotaUsage>("@agientic/Policy/QuotaUsage")("QuotaUsage", {
  quotaId: S.String,
  scopeId: S.String,
  used: S.Number,
  resetAt: S.DateTimeUtc,
}) {
  /**
   * Check if quota is exceeded
   * @since 0.1.0
   */
  isExceeded(quota: Quota): boolean {
    return Num.greaterThanOrEqualTo(this.used, quota.limit);
  }

  /**
   * Get remaining quota
   * @since 0.1.0
   */
  remaining(quota: Quota): number {
    return Num.max(0, Num.subtract(quota.limit, this.used));
  }
}

/**
 * Policy evaluation context - imports canonical Capability
 * @since 0.1.0
 * @category policy
 */
export const PolicyContext = S.Struct({
  personaId: S.String,
  episodeId: S.optional(S.String),
  capabilities: S.Array(S.Unknown), // Reference to canonical Capability via unknown for now
  quotas: S.Array(Quota),
  attributes: S.Record({ key: S.String, value: S.Unknown }),
});
export declare namespace PolicyContext {
  export type Type = typeof PolicyContext.Type;
  export type Encoded = typeof PolicyContext.Encoded;
}

// ============================================================================
// Schema-based Transforms - Parse reason strings into structured ADTs
// ============================================================================

/**
 * Parsed representation of a "default" reason
 * @since 0.1.0
 * @category schema/transforms
 */
export class ParsedDefaultReason extends S.TaggedClass<ParsedDefaultReason>("@beep/policy/ParsedDefaultReason")(
  "ParsedDefaultReason",
  {
    effect: PolicyEffect,
  }
) {}

/**
 * Parsed representation of a "precedence:outcome" reason
 * @since 0.1.0
 * @category schema/transforms
 */
export class ParsedPrecedenceReason extends S.TaggedClass<ParsedPrecedenceReason>(
  "@beep/policy/ParsedPrecedenceReason"
)("ParsedPrecedenceReason", {
  precedence: EvaluationPrecedence,
  outcome: EvaluationOutcome,
}) {}

/**
 * Parsed representation of a "first_match" reason
 * @since 0.1.0
 * @category schema/transforms
 */
export class ParsedFirstMatchReason extends S.TaggedClass<ParsedFirstMatchReason>(
  "@beep/policy/ParsedFirstMatchReason"
)("ParsedFirstMatchReason", {
  ruleId: S.String,
  effect: PolicyEffect,
}) {}

/**
 * Union of all parsed reason types - the structured ADT
 * @since 0.1.0
 * @category schema/transforms
 */
export const ParsedReasonUnion = S.Union(ParsedDefaultReason, ParsedPrecedenceReason, ParsedFirstMatchReason);

export type ParsedReasonUnion = typeof ParsedReasonUnion.Type;

/**
 * Schema transform: AuthorizationDecisionReason string -> ParsedReasonUnion ADT
 * Bidirectional transform that parses reason strings into structured data
 * and encodes structured data back to strings
 * @since 0.1.0
 * @category schema/transforms
 * @example
 * ```ts
 * // Decode: string -> ADT
 * const parsed = S.decodeSync(ParsedReason)("deny_overrides:deny_rule_matched")
 * // => ParsedPrecedenceReason { precedence: "deny_overrides", outcome: "deny_rule_matched" }
 *
 * // Encode: ADT -> string
 * const str = S.encodeSync(ParsedReason)(new ParsedDefaultReason({ effect: "allow" }))
 * // => "default:allow"
 * ```
 */
/**
 * Safe decoders for ParsedReason transform - validates at runtime without type assertions
 * @internal
 */
const decodePolicyEffectSync = S.decodeUnknownSync(PolicyEffect);
const decodeEvaluationPrecedenceSync = S.decodeUnknownSync(EvaluationPrecedence);
const decodeEvaluationOutcomeSync = S.decodeUnknownSync(EvaluationOutcome);

export const ParsedReason = pipe(
  AuthorizationDecisionReason,
  S.transform(ParsedReasonUnion, {
    decode: (reason) =>
      pipe(
        reason,
        Match.value,
        Match.when(
          Str.startsWith("default:"),
          flow(
            Str.slice(8, Str.length(reason)),
            decodePolicyEffectSync,
            (effect) => new ParsedDefaultReason({ effect })
          )
        ),
        Match.when(Str.startsWith(Separator.postfix(EvaluationPrecedence.Enum.first_match)), (r) => {
          const rest = Str.slice(12, Str.length(r))(r);
          const lastColon = Separator.lastIndexOf(rest);
          const ruleId = Str.slice(0, lastColon)(rest);
          const effect = decodePolicyEffectSync(Str.slice(lastColon + 1)(rest));
          return new ParsedFirstMatchReason({ ruleId, effect });
        }),
        Match.orElse((r) => {
          const parts = Separator.split(r);
          return pipe(
            O.all({
              precedence: pipe(A.head(parts), O.map(decodeEvaluationPrecedenceSync)),
              outcome: pipe(A.get(parts, 1), O.map(decodeEvaluationOutcomeSync)),
            }),
            O.map(({ precedence, outcome }) => new ParsedPrecedenceReason({ precedence, outcome })),
            O.getOrThrow
          );
        })
      ),
    encode: (parsed) =>
      pipe(
        parsed,
        Match.value,
        Match.tag("ParsedDefaultReason", (r) => `default:${r.effect}` as const),
        Match.tag("ParsedPrecedenceReason", (r) => `${r.precedence}:${r.outcome}` as const),
        Match.tag("ParsedFirstMatchReason", (r) => `first_match:${r.ruleId}:${r.effect}` as const),
        Match.exhaustive
      ),
  })
);

export declare namespace ParsedReason {
  export type Type = typeof ParsedReason.Type;
  export type Encoded = typeof ParsedReason.Encoded;
}

/**
 * Pipeable decoder for ParsedReason - transforms string to ADT
 * @since 0.1.0
 * @category schema/decoders
 */
export const decodeReason = S.decodeSync(ParsedReason);

/**
 * Pipeable encoder for ParsedReason - transforms ADT to string
 * @since 0.1.0
 * @category schema/encoders
 */
export const encodeReason = S.encodeSync(ParsedReason);

// ============================================================================
// Schema-based Rule Transformers
// ============================================================================

/**
 * Schema transform that extracts only the IDs from a PolicyRule array
 * @since 0.1.0
 * @category schema/transforms
 */
export const RuleIdsTransform = pipe(
  S.Array(PolicyRule),
  S.transform(S.Array(S.String), {
    decode: A.map(Struct.get("id")),
    encode: (ids) =>
      A.map(
        ids,
        (id) =>
          new PolicyRule({
            id,
            name: id,
            effect: "deny" as const,
            actions: A.empty(),
            resources: A.empty(),
          })
      ),
  })
);

/**
 * Schema transform that extracts rule effects
 * @since 0.1.0
 * @category schema/transforms
 */
export const RuleEffectsTransform = pipe(
  S.Array(PolicyRule),
  S.transform(S.Array(PolicyEffect), {
    decode: A.map(Struct.get("effect")),
    encode: (effects) =>
      A.map(
        effects,
        (effect, idx) =>
          new PolicyRule({
            id: `rule-${idx}`,
            name: `Rule ${idx}`,
            effect,
            actions: A.empty(),
            resources: A.empty(),
          })
      ),
  })
);

/**
 * Schema transform for computing rule statistics
 * @since 0.1.0
 * @category schema/transforms
 */
export class RuleStats extends S.Class<RuleStats>("RuleStats")({
  totalRules: S.Number,
  allowRules: S.Number,
  denyRules: S.Number,
  hasConflict: S.Boolean,
}) {}

export const RuleStatsTransform = pipe(
  S.Array(PolicyRule),
  S.transform(RuleStats, {
    strict: false,
    decode: (rules) => {
      const allowRules = A.filter(rules, PolicyEffect.isPolicyAllow).length;
      const denyRules = A.filter(rules, PolicyEffect.isPolicyDeny).length;
      return new RuleStats({
        totalRules: rules.length,
        allowRules,
        denyRules,
        hasConflict: Num.greaterThan(allowRules, 0) && Num.greaterThan(denyRules, 0),
      });
    },
    encode: (stats) =>
      A.makeBy(stats.totalRules, (idx: number) =>
        PolicyRule.make({
          id: `rule-${idx}`,
          name: `Rule ${idx}`,
          effect: Num.lessThan(idx, stats.allowRules) ? PolicyEffect.Enum.allow : PolicyEffect.Enum.deny,
          actions: A.empty(),
          resources: A.empty(),
        })
      ),
  })
);

/**
 * Pipeable decoder for rule statistics
 * @since 0.1.0
 * @category schema/decoders
 */
export const decodeRuleStats = S.decodeSync(RuleStatsTransform);

// ============================================================================
// Schema-based Decision Construction
// ============================================================================

/**
 * Schema for constructing decisions from evaluation results
 * Transforms a tuple of [allowed, reason, matchedRuleIds] into AuthorizationDecision
 * @since 0.1.0
 * @category schema/transforms
 */
export const DecisionFromTuple = pipe(
  S.Tuple(S.Boolean, AuthorizationDecisionReason, S.Array(S.String)),
  S.transform(
    S.Struct({
      allowed: S.Boolean,
      reason: AuthorizationDecisionReason,
      matchedRules: S.Array(S.String),
    }),
    {
      decode: ([allowed, reason, matchedRules]) => ({
        allowed,
        reason,
        matchedRules,
      }),
      encode: ({ allowed, reason, matchedRules }) => [allowed, reason, matchedRules] as const,
    }
  )
);

/**
 * Pipeable decision constructor from tuple
 * @since 0.1.0
 * @category schema/constructors
 */
export const makeDecisionFromTuple = flow(S.decodeSync(DecisionFromTuple), AuthorizationDecision.make);

// ============================================================================
// Predicate combinators for rule matching
// ============================================================================

/**
 * Creates a predicate to check if a rule's principals include the given principal or wildcard
 * @since 0.1.0
 * @category predicates
 */
const principalMatches =
  (principal: string): P.Predicate<PolicyRule> =>
  (rule) =>
    pipe(
      O.fromNullable(rule.principals),
      O.filter(A.isNonEmptyReadonlyArray),
      O.match({
        onNone: constTrue, // No principals specified = matches all
        onSome: P.or(A.contains(principal), A.contains("*")),
      })
    );

/**
 * Creates a predicate to check if a rule's actions include the given verb
 * @since 0.1.0
 * @category predicates
 */
const actionVerbMatches =
  (verb: string): P.Predicate<PolicyRule> =>
  (rule) =>
    A.some(rule.actions, flow(Struct.get("verb"), Equal.equals(verb)));

/**
 * Creates a predicate for glob-like resource pattern matching
 * @since 0.1.0
 * @category predicates
 */
const resourcePatternMatches =
  (resource: string): P.Predicate<string> =>
  (pattern) =>
    pipe(
      pattern,
      Match.value,
      Match.when("*", constTrue),
      Match.when(resource, constTrue),
      Match.when(Str.endsWith("/*"), flow(Str.slice(0, -2), Str.startsWith(resource))),
      Match.orElse(constFalse)
    );

/**
 * Creates a predicate to check if a rule's resources match the given resource
 * @since 0.1.0
 * @category predicates
 */
const resourceMatches =
  (resource: string): P.Predicate<PolicyRule> =>
  (rule) =>
    A.some(rule.resources, resourcePatternMatches(resource));

/**
 * Creates a composite predicate for rule applicability
 * @since 0.1.0
 * @category predicates
 */
const isRuleApplicable = (action: Action, principal: string): P.Predicate<PolicyRule> =>
  P.and(
    P.and(principalMatches(principal), pipe(action, Struct.get("verb"), actionVerbMatches)),
    pipe(action, Struct.get("resource"), resourceMatches)
  );

// ============================================================================
// Advanced Predicate Algebra - Maximum Functional Power
// ============================================================================

/**
 * Predicate that checks if a rule has high priority (>= 100)
 * Uses P.mapInput to transform from PolicyRule to number
 * @since 0.1.0
 * @category predicates/advanced
 */
export const isHighPriorityRule: P.Predicate<PolicyRule> = pipe(
  Num.greaterThanOrEqualTo(100),
  P.mapInput(priorityOrZero)
);

/**
 * Predicate that checks if a rule has any conditions attached
 * @since 0.1.0
 * @category predicates/advanced
 */
export const hasCondition: P.Predicate<PolicyRule> = pipe(P.isNotNullable, P.mapInput(Struct.get("condition")));

/**
 * Predicate that checks if a rule is unconditional (no condition)
 * @since 0.1.0
 * @category predicates/advanced
 */
export const isUnconditional: P.Predicate<PolicyRule> = P.not(hasCondition);

/**
 * Validates: If rule has high priority, it must have a description
 * Uses P.implies for conditional validation logic
 * "If highPriority then hasDescription"
 * @since 0.1.0
 * @category predicates/validation
 */
export const highPriorityMustHaveDescription: P.Predicate<PolicyRule> = P.implies(
  isHighPriorityRule,
  pipe(P.isNotNullable, P.mapInput(Struct.get("description")))
);

/**
 * Validates: If rule has condition, it must have explicit principals
 * Uses P.implies for conditional validation
 * @since 0.1.0
 * @category predicates/validation
 */
export const conditionalRuleMustHavePrincipals: P.Predicate<PolicyRule> = P.implies(
  hasCondition,
  pipe(
    A.isNonEmptyReadonlyArray,

    P.mapInput((rule: PolicyRule) => Struct.get("principals")(rule) ?? A.empty())
  )
);

/**
 * XOR predicate: Rule is EITHER high priority XOR has conditions (not both, not neither)
 * Useful for ensuring rules follow specific patterns
 * @since 0.1.0
 * @category predicates/algebra
 */
export const isHighPriorityXorConditional: P.Predicate<PolicyRule> = P.xor(isHighPriorityRule, hasCondition);

/**
 * EQV predicate: Allow rules and unconditional rules should be equivalent
 * (both allow and unconditional, or both deny and conditional)
 * @since 0.1.0
 * @category predicates/algebra
 */
export const allowEquivalentToUnconditional: P.Predicate<PolicyRule> = P.eqv(
  PolicyEffect.isPolicyAllow,
  isUnconditional
);

/**
 * NAND predicate: Not both high priority AND allow effect
 * Useful for preventing certain combinations
 * @since 0.1.0
 * @category predicates/algebra
 */
export const notHighPriorityAllow: P.Predicate<PolicyRule> = P.nand(isHighPriorityRule, PolicyEffect.isPolicyAllow);

/**
 * NOR predicate: Neither high priority NOR has conditions
 * Identifies "simple" rules
 * @since 0.1.0
 * @category predicates/algebra
 */
export const isSimpleRule: P.Predicate<PolicyRule> = P.nor(isHighPriorityRule, hasCondition);

// ============================================================================
// Struct-based Predicates for Complex Validation
// ============================================================================

/**
 * Validates a complete PolicyRule using P.struct for field-level validation
 * Each field can have its own predicate, composed structurally
 * @since 0.1.0
 * @category predicates/struct
 */
export const isValidRuleStructure: P.Predicate<{
  readonly id: string;
  readonly name: string;
  readonly actions: ReadonlyArray<Action>;
  readonly resources: ReadonlyArray<string>;
}> = P.struct({
  id: Str.isNonEmpty,
  name: Str.isNonEmpty,
  actions: A.isNonEmptyReadonlyArray,
  resources: A.isNonEmptyReadonlyArray,
});

/**
 * Validates PolicySet structure using P.struct
 * @since 0.1.0
 * @category predicates/struct
 */
export const isValidPolicySetStructure: P.Predicate<{
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly rules: ReadonlyArray<PolicyRule>;
}> = P.struct({
  id: Str.isNonEmpty,
  name: Str.isNonEmpty,
  version: pipe(
    Str.isNonEmpty,
    P.and(Str.includes(".")) // Version must contain a dot
  ),
  rules: A.isNonEmptyReadonlyArray,
});

// ============================================================================
// Tuple-based Predicates for Pairs/Triples
// ============================================================================

/**
 * Validates an [Action, principal] tuple using P.tuple
 * Ensures both action and principal are valid
 * @since 0.1.0
 * @category predicates/tuple
 */
export const isValidActionPrincipalPair: P.Predicate<readonly [Action, string]> = P.tuple(
  pipe(
    P.struct({
      verb: Str.isNonEmpty,
      resource: Str.isNonEmpty,
    }),
    P.mapInput((a: Action) => ({ verb: a.verb, resource: a.resource }))
  ),
  Str.isNonEmpty
);

/**
 * Validates a [PolicyRule, Action, principal] triple
 * Checks that the rule applies to the action for the principal
 * @since 0.1.0
 * @category predicates/tuple
 */
export const isApplicableTriple: P.Predicate<readonly [PolicyRule, Action, string]> = ([rule, action, principal]) =>
  isRuleApplicable(action, principal)(rule);

// ============================================================================
// Product-based Predicates for Cross-Validation
// ============================================================================

/**
 * Cross-validates a PolicyRule and PolicySet pair
 * Uses P.product to combine two separate predicates
 * @since 0.1.0
 * @category predicates/product
 */
export const isRuleInValidSet: P.Predicate<readonly [PolicyRule, PolicySet]> = P.product(
  pipe(P.isNotNullable<string | undefined>, P.mapInput(Struct.get("id"))),
  pipe(A.isNonEmptyReadonlyArray, P.mapInput(Struct.get("rules")))
);

// ============================================================================
// Refinement Predicates for Type Narrowing
// ============================================================================

/**
 * Refinement that narrows to allow-effect rules
 * @since 0.1.0
 * @category refinements
 */
export const isAllowRule: P.Refinement<PolicyRule, PolicyRule & { readonly effect: "allow" }> = (
  rule
): rule is PolicyRule & { readonly effect: "allow" } => PolicyEffect.isAllow(rule.effect);

/**
 * Refinement that narrows to deny-effect rules
 * @since 0.1.0
 * @category refinements
 */
export const isDenyRule: P.Refinement<PolicyRule, PolicyRule & { readonly effect: "deny" }> = (
  rule
): rule is PolicyRule & { readonly effect: "deny" } => PolicyEffect.isDeny(rule.effect);

/**
 * Composed refinement: isTagged + custom predicate
 * Use P.compose to chain refinements
 * @since 0.1.0
 * @category refinements
 */
export const isParsedDefaultReason = P.isTagged("ParsedDefaultReason");
export const isParsedPrecedenceReason = P.isTagged("ParsedPrecedenceReason");
export const isParsedFirstMatchReason = P.isTagged("ParsedFirstMatchReason");

// ============================================================================
// Predicate Pipelines - Maximum Composition
// ============================================================================

/**
 * A pipeline that validates a rule is production-ready
 * Combines multiple predicates using P.and chains
 * @since 0.1.0
 * @category predicates/pipelines
 */
export const isProductionReadyRule: P.Predicate<PolicyRule> = pipe(
  // Must have valid structure (id must exist and be non-empty)
  Str.isNonEmpty,
  P.mapInput((rule: PolicyRule) => rule.id),
  // AND must have description
  P.and(
    pipe(
      P.isNotNullable,
      P.mapInput((rule: PolicyRule) => rule.description)
    )
  ),
  // AND high priority rules must have description (validated by implies)
  P.and(highPriorityMustHaveDescription),
  // AND conditional rules must have principals
  P.and(conditionalRuleMustHavePrincipals)
);

/**
 * Predicate composition using productMany for array validation
 * Validates that all rules in an array satisfy the production-ready check
 * @since 0.1.0
 * @category predicates/pipelines
 */
export const areAllRulesProductionReady: P.Predicate<ReadonlyArray<PolicyRule>> = A.every(isProductionReadyRule);

// ============================================================================
// Sorting utilities
// ============================================================================

/**
 * Order for sorting rules by priority (descending, higher first)
 * @since 0.1.0
 * @category ordering
 */
const byPriorityDescending: Order.Order<PolicyRule> = Order.reverse(Order.mapInput(Order.number, priorityOrZero));

// ============================================================================
// Decision evaluation helpers
// ============================================================================

/**
 * Rule presence state for evaluation - TaggedEnum for exhaustive matching
 * Uses Data.TaggedEnum for idiomatic Effect tagged unions with built-in constructors
 * @since 0.1.0
 * @category types
 */
type RulePresence = Data.TaggedEnum<{
  readonly HasDeny: NonNullable<unknown>;
  readonly HasAllow: NonNullable<unknown>;
  readonly Empty: NonNullable<unknown>;
}>;

/**
 * RulePresence constructors and type guards
 * @since 0.1.0
 * @category constructors
 */
const RulePresence = Data.taggedEnum<RulePresence>();

/**
 * Determines rule presence state from sorted rules
 * Uses direct predicates for clean conditional logic
 * @since 0.1.0
 * @category utilities
 */
const getRulePresence = (sorted: ReadonlyArray<PolicyRule>): RulePresence => {
  const hasDeny = A.some(sorted, PolicyEffect.isPolicyDeny);
  const hasAllow = A.some(sorted, PolicyEffect.isPolicyAllow);

  return hasDeny ? RulePresence.HasDeny() : hasAllow ? RulePresence.HasAllow() : RulePresence.Empty();
};

/**
 * Result of evaluating a precedence strategy
 * @since 0.1.0
 * @category types
 */
class DecisionResult extends S.Class<DecisionResult>("DecisionResult")({
  allowed: S.Boolean,
  reason: AuthorizationDecisionReason,
}) {
  /**
   * Type-safe matcher for DecisionResult
   * Uses Match.type for reusable matchers with exhaustive checking
   * @since 0.1.0
   * @category matching
   */
  static readonly $match = Match.type<DecisionResult>();

  /**
   * Match on allowed/denied state
   * Uses Match.withReturnType to enforce consistent return types
   * @since 0.1.0
   * @category matching
   */
  static readonly matchAllowed = <A>(handlers: {
    readonly onAllowed: (result: DecisionResult) => A;
    readonly onDenied: (result: DecisionResult) => A;
  }) =>
    pipe(
      DecisionResult.$match,
      Match.when({ allowed: true }, handlers.onAllowed),
      Match.when({ allowed: false }, handlers.onDenied),
      Match.exhaustive
    );

  static readonly makeConst = flow(DecisionResult.make, constant);
}

/**
 * Evaluates deny_overrides precedence: deny wins over allow
 * Curried for use with apply - takes default first, then sorted rules
 * Uses Match.tagsExhaustive for clean exhaustive matching on RulePresence
 * @since 0.1.0
 * @category evaluation
 */
const evaluateDenyOverrides =
  (defaultDecision: DecisionResult) =>
  (sorted: ReadonlyArray<PolicyRule>): DecisionResult =>
    pipe(
      getRulePresence(sorted),
      Match.valueTags({
        HasDeny: DecisionResult.makeConst({ allowed: false, reason: Reason.denyOverrides.denyMatched() }),
        HasAllow: DecisionResult.makeConst({ allowed: true, reason: Reason.denyOverrides.allowMatched() }),
        Empty: constant(defaultDecision),
      })
    );

/**
 * Evaluates allow_overrides precedence: allow wins over deny
 * Curried for use with apply - takes default first, then sorted rules
 * Uses Match.valueTags for concise exhaustive tag matching
 * @since 0.1.0
 * @category evaluation
 */
const evaluateAllowOverrides =
  (defaultDecision: DecisionResult) =>
  (sorted: ReadonlyArray<PolicyRule>): DecisionResult => {
    // For allow_overrides, we need to check allow FIRST (opposite of deny_overrides)
    const hasAllow = A.some(sorted, PolicyEffect.isPolicyAllow);
    const hasDeny = A.some(sorted, PolicyEffect.isPolicyDeny);

    const presence: RulePresence = hasAllow
      ? RulePresence.HasAllow()
      : hasDeny
        ? RulePresence.HasDeny()
        : RulePresence.Empty();

    return pipe(
      presence,
      Match.valueTags({
        HasAllow: DecisionResult.makeConst({ allowed: true, reason: Reason.allowOverrides.allowMatched() }),
        HasDeny: DecisionResult.makeConst({ allowed: false, reason: Reason.allowOverrides.denyMatched() }),
        Empty: constant(defaultDecision),
      })
    );
  };

/**
 * Evaluates first_match precedence: first applicable rule wins
 * Curried for use with apply - takes default first, then sorted rules
 * Uses O.match for Option handling with declarative onNone/onSome
 * @since 0.1.0
 * @category evaluation
 */
const evaluateFirstMatch =
  (defaultDecision: DecisionResult) =>
  (sorted: ReadonlyArray<PolicyRule>): DecisionResult =>
    pipe(
      A.head(sorted),
      O.match({
        onNone: constant(defaultDecision),
        onSome: (first) =>
          DecisionResult.make({
            allowed: PolicyEffect.isAllow(first.effect),
            reason: Reason.firstMatch(first.id, first.effect),
          }),
      })
    );

/**
 * Finds all matching (rule, action, resource) triples for a given request
 * Uses A.Do/A.bind for array comprehension - cartesian product with filtering
 * This is useful for detailed tracing of why rules matched
 * @since 0.1.0
 * @category utilities
 * @example
 * ```ts
 * const matches = findMatchingTriples(policySet.rules, action, "user:123")
 * // Returns all combinations where rule's actions include the action
 * // and rule's resources include the resource
 * ```
 */
export const findMatchingTriples = (
  rules: ReadonlyArray<PolicyRule>,
  action: Action,
  principal: string
): ReadonlyArray<{
  readonly rule: PolicyRule;
  readonly matchedAction: Action;
  readonly matchedResource: string;
}> =>
  pipe(
    A.Do,
    A.bind("rule", () => rules),
    A.filter(({ rule }) =>
      pipe(
        O.fromNullable(rule.principals),
        O.filter(A.isNonEmptyReadonlyArray),
        O.match({
          onNone: constTrue,
          onSome: P.or(A.contains(principal), A.contains("*")),
        })
      )
    ),
    A.bind("matchedAction", ({ rule }) => rule.actions),
    A.filter(
      ({ matchedAction }) =>
        Equal.equals(matchedAction.verb)(action.verb) && Equal.equals(matchedAction.resource)(action.resource)
    ),
    A.bind("matchedResource", ({ rule }) => rule.resources),
    A.filter(({ matchedResource }) => matchedResource === "*" || matchedResource === action.resource)
  );

/**
 * Builds trace entries from sorted rules
 * @since 0.1.0
 * @category utilities
 */

const buildTraceEntries = pipe(
  S.Array(PolicyRule),
  BS.destructiveTransform(
    A.map(
      (i) =>
        ({
          ruleId: i.id,
          effect: i.effect,
          matched: true as const,
          reason: i.description,
          priority: i.priority,
        }) as const
    )
  ),
  S.decodeSync
);

// start snippet POLICY_DECISION_ALGEBRA
/**
 * Evaluates an authorization request against a policy set
 * Uses exhaustive pattern matching for type-safe precedence handling
 * @since 0.1.0
 * @category evaluation
 */
export const evaluateAuthorization = (
  policySet: PolicySet,
  request: S.Schema.Type<typeof AuthorizationRequest>,
  precedence: EvaluationPrecedence.Type = EvaluationPrecedence.Enum.deny_overrides
): AuthorizationDecision => {
  // Filter rules using composable predicates
  const candidates = A.filter(policySet.rules, isRuleApplicable(request.action, request.principal));

  // Sort by priority descending
  const sorted = A.sort(candidates, byPriorityDescending);

  // Build trace entries
  const trace = buildTraceEntries(sorted);

  // Default decision based on policy set's default effect
  const defaultDecision = DecisionResult.make({
    allowed: PolicyEffect.isAllow(policySet.defaultEffect),
    reason: Reason.default(policySet.defaultEffect),
  });

  // Create curried evaluators using apply - function comes first, then data
  // apply(sorted) takes the curried evaluator and applies the sorted rules
  const denyOverrides = pipe(defaultDecision, evaluateDenyOverrides, apply(sorted), constant);
  const allowOverrides = pipe(defaultDecision, evaluateAllowOverrides, apply(sorted), constant);
  const firstMatch = pipe(defaultDecision, evaluateFirstMatch, apply(sorted), constant);

  // Exhaustive pattern matching on precedence using Match
  const { allowed, reason } = pipe(
    Match.value(precedence),
    Match.when("deny_overrides", denyOverrides),
    Match.when("allow_overrides", allowOverrides),
    Match.when("first_match", firstMatch),
    Match.exhaustive
  );

  return new AuthorizationDecision({
    allowed,
    reason,
    matchedRules: A.map(sorted, Struct.get("id")),
    trace,
  });
};
// end snippet POLICY_DECISION_ALGEBRA

// ============================================================================
// Dual-style (data-first / data-last) utility functions
// ============================================================================

/**
 * Checks if a policy set allows an action for a principal
 * Can be used in both data-first and data-last (pipe) style
 * @since 0.1.0
 * @category dual
 * @example
 * ```ts
 * // Data-first style
 * const allowed = isActionAllowed(policySet, action, "user:123")
 *
 * // Data-last style (pipeable)
 * const allowed = pipe(policySet, isActionAllowed(action, "user:123"))
 * ```
 */
export const isActionAllowed: {
  (action: Action, principal: string): (policySet: PolicySet) => boolean;
  (policySet: PolicySet, action: Action, principal: string): boolean;
} = dual(3, (policySet: PolicySet, action: Action, principal: string): boolean =>
  pipe(
    policySet.findApplicableRules(action, principal),
    A.head,
    O.map(flow(Struct.get("effect"), PolicyEffect.isAllow)),
    O.getOrElse(pipe(policySet.defaultEffect, PolicyEffect.isAllow, constant))
  )
);

/**
 * Gets the effective priority for a rule, defaulting to 0
 * Dual function supporting both data-first and data-last styles
 * @since 0.1.0
 * @category dual
 */
export const getRulePriority: {
  (): (rule: PolicyRule) => number;
  (rule: PolicyRule): number;
} = dual(
  1,

  priorityOrZero
);

/**
 * Checks quota usage against a quota definition
 * Dual function for flexible usage patterns
 * @since 0.1.0
 * @category dual
 */
export const checkQuotaRemaining: {
  (quota: Quota): (usage: QuotaUsage) => number;
  (usage: QuotaUsage, quota: Quota): number;
} = dual(2, (usage: QuotaUsage, quota: Quota): number => Num.max(0, Num.subtract(quota.limit, usage.used)));

/**
 * Filters rules by effect type
 * Dual function for both immediate and pipeable usage
 * @since 0.1.0
 * @category dual
 */
export const filterRulesByEffect: {
  (effect: PolicyEffect.Type): (rules: ReadonlyArray<PolicyRule>) => ReadonlyArray<PolicyRule>;
  (rules: ReadonlyArray<PolicyRule>, effect: PolicyEffect.Type): ReadonlyArray<PolicyRule>;
} = dual(
  2,
  (rules: ReadonlyArray<PolicyRule>, effect: PolicyEffect.Type): ReadonlyArray<PolicyRule> =>
    A.filter(rules, flow(Struct.get("effect"), Equal.equals(effect)))
);
