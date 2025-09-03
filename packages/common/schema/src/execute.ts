import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";

interface BusinessRule {
  readonly id: string;
  readonly name: string;
  readonly conditions: RuleCondition[];
  readonly operator: "AND" | "OR" | "XOR";
  readonly isActive: boolean;
}

interface RuleCondition {
  readonly field: string;
  // readonly operand: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains'
  readonly operand:
    | { readonly operator: "equals"; readonly value: unknown }
    | { readonly operator: "not_equals"; readonly value: unknown }
    | { readonly operator: "greater_than"; readonly value: unknown }
    | { readonly operator: "less_than"; readonly value: unknown }
    | { readonly operator: "contains"; readonly value: unknown };
  readonly weight: number;
}

interface RuleContext {
  readonly data: Record<string, unknown>;
}

const evaluateCondition = (condition: RuleCondition, context: RuleContext): boolean => {
  const fieldValue = context.data[condition.field];

  return Match.value(condition.operand).pipe(
    Match.discriminators("operator")({
      equals: (v) => fieldValue === v.value,
      not_equals: (v) => fieldValue !== v.value,
      greater_than: (v) => P.isNumber(fieldValue) && P.isNumber(v.value) && fieldValue > v.value,
      less_than: (v) => P.isNumber(fieldValue) && P.isNumber(v.value) && fieldValue < v.value,
      contains: (v) => P.isString(fieldValue) && P.isString(v.value) && fieldValue.includes(v.value),
    }),
    Match.orElse(() => false)
  );
};

const ruleEngine = {
  evaluateRule: (rule: BusinessRule, context: RuleContext): Effect.Effect<boolean> =>
    Effect.gen(function* () {
      if (!rule.isActive) {
        return false;
      }

      const conditionResults = A.map(rule.conditions, (condition) => evaluateCondition(condition, context));

      return Match.value(rule.operator).pipe(
        Match.when("AND", () => Bool.every(conditionResults)),
        Match.when("OR", () => Bool.some(conditionResults)),
        Match.when("XOR", () => conditionResults.reduce(Bool.xor, false)),
        Match.orElse(() => false)
      );
    }),
  evaluateRuleSet: (rules: Array<BusinessRule>, context: RuleContext, strategy: "all" | "any" | "majority") =>
    Effect.gen(function* () {
      const ruleResults = yield* Effect.all(
        A.map(rules, (rule) =>
          ruleEngine
            .evaluateRule(rule, context)
            .pipe(Effect.map((result) => ({ ruleId: rule.id, result, ruleName: rule.name })))
        ),
        { batching: true }
      );

      const results = A.map(ruleResults, (r) => r.result);
      const passedCount = A.filter(results, Boolean).length;
      const totalCount = results.length;

      const finalResult = Match.value(strategy).pipe(
        Match.when("all", () => Bool.every(results)),
        Match.when("any", () => Bool.some(results)),
        Match.when("majority", () => passedCount > totalCount / 2),
        Match.orElse(() => false)
      );

      return {
        passed: finalResult,
        details: {
          passedCount,
          totalCount,
          passedRules: ruleResults.filter((r) => r.result),
        },
      };
    }),
  // Advanced rule composition with weighted conditions
  evaluateWeightedRule: (rule: BusinessRule, context: RuleContext, threshold: number) =>
    Effect.gen(function* () {
      const weightedResults = A.map(rule.conditions, (condition) => ({
        passed: evaluateCondition(condition, context),
        weight: condition.weight,
      }));

      const totalWeight = A.reduce(weightedResults, 0, (sum, result) => sum + result.weight);
      const passedWeight = F.pipe(
        A.filter(weightedResults, (result) => result.passed),
        A.reduce(0, (sum, result) => sum + result.weight)
      );

      const weightedScore = totalWeight > 0 ? passedWeight / totalWeight : 0;
      const thresholdMet = weightedScore >= threshold;

      return {
        passed: thresholdMet,
        score: weightedScore,
        threshold,
        details: weightedResults,
      };
    }),
};

const orderValidationRules: BusinessRule[] = [
  {
    id: "order-minimum",
    name: "Minimum Order Value",
    conditions: [
      {
        field: "orderTotal",
        operand: {
          operator: "greater_than",
          value: 10,
        },
        weight: 1,
      },
    ],
    operator: "AND",
    isActive: true,
  },
  {
    id: "customer-eligibility",
    name: "Customer Eligibility",
    conditions: [
      {
        field: "customerType",
        operand: { operator: "not_equals", value: "blocked" },
        weight: 2,
      },
      {
        field: "accountAge",
        operand: { operator: "greater_than", value: 30 },
        weight: 1,
      },
    ],
    operator: "AND",
    isActive: true,
  },
];

console.log(
  JSON.stringify(
    Effect.runSync(
      ruleEngine.evaluateRuleSet(
        orderValidationRules,
        {
          data: {
            orderTotal: 11,
            customerType: "beep",
            accountAge: 31,
          },
        },
        "all"
      )
    )
  )
);
