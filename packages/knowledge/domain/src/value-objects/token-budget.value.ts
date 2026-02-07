import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $KnowledgeDomainId.create("value-objects/token-budget.value");

export class TokenBudgetStage extends BS.StringLiteralKit(
  "entity_extraction",
  "relation_extraction",
  "grounding",
  "property_scoping",
  "other"
).annotations(
  $I.annotations("TokenBudgetStage", {
    description: "Stage names with dedicated token budgets",
  })
) {}

export declare namespace TokenBudgetStage {
  export type Type = typeof TokenBudgetStage.Type;
}

export class TokenBudgetPolicy extends BS.StringLiteralKit("warn", "hard-limit").annotations(
  $I.annotations("TokenBudgetPolicy", {
    description: "Behavior to apply when token usage crosses warning threshold",
  })
) {}

export declare namespace TokenBudgetPolicy {
  export type Type = typeof TokenBudgetPolicy.Type;
}

export const WarningThreshold = S.Number.pipe(S.greaterThanOrEqualTo(0), S.lessThanOrEqualTo(1)).annotations(
  $I.annotations("WarningThreshold", {
    description: "Warning threshold ratio from 0 to 1 (inclusive)",
  })
);

export declare namespace WarningThreshold {
  export type Type = S.Schema.Type<typeof WarningThreshold>;
}

export class TokenBudgetBehavior extends S.Class<TokenBudgetBehavior>($I`TokenBudgetBehavior`)(
  {
    warningThreshold: S.optionalWith(WarningThreshold, {
      default: () => 0.8,
    }),
    policy: S.optionalWith(TokenBudgetPolicy, {
      default: () => "warn" as const,
    }),
  },
  $I.annotations("TokenBudgetBehavior", {
    description: "Warning threshold behavior for token budget enforcement",
  })
) {}

export class TokenBudget extends S.Class<TokenBudget>($I`TokenBudget`)(
  {
    stage: TokenBudgetStage,
    used: S.NonNegativeInt,
    limit: BS.PosInt,
    behavior: S.optionalWith(TokenBudgetBehavior, {
      default: () => new TokenBudgetBehavior({}),
    }),
  },
  $I.annotations("TokenBudget", {
    description: "Token budget state for a single extraction stage",
  })
) {}

export class TokenBudgetStatus extends BS.StringLiteralKit("within-budget", "warning", "exceeded").annotations(
  $I.annotations("TokenBudgetStatus", {
    description: "Derived status of a token budget from used/limit and warning threshold",
  })
) {}

export declare namespace TokenBudgetStatus {
  export type Type = typeof TokenBudgetStatus.Type;
}

export const getWarningLimit = (budget: TokenBudget): number =>
  Math.floor(budget.limit * budget.behavior.warningThreshold);

export const getRemainingTokens = (budget: TokenBudget): number => budget.limit - budget.used;

export const getTokenBudgetStatus = (budget: TokenBudget): TokenBudgetStatus.Type => {
  if (budget.used >= budget.limit) {
    return "exceeded";
  }

  if (budget.used >= getWarningLimit(budget)) {
    return "warning";
  }

  return "within-budget";
};
