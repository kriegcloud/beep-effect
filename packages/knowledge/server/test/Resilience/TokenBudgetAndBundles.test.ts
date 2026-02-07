import {
  TokenBudgetService,
  TokenBudgetServiceTest,
  type TokenBudgetState,
} from "@beep/knowledge-server/LlmControl/TokenBudget";
import {
  LlmControlBundleLive,
  LlmProviderBundleLive,
  LlmRuntimeBundleLive,
} from "@beep/knowledge-server/Runtime/ServiceBundles";
import { assertTrue, describe, layer, strictEqual } from "@beep/testkit";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const isWarningThreshold = (state: TokenBudgetState, stage: string): boolean => {
  const stageUsed = state.byStage[stage] ?? 0;
  const stageBudget = Math.floor(state.total * 0.35);
  const remaining = stageBudget - stageUsed;
  return remaining <= Math.floor(stageBudget * 0.1);
};

describe("Resilience", () => {
  layer(TokenBudgetServiceTest(1000), { timeout: Duration.seconds(30) })("Token budget behavior", (it) => {
    it.effect(
      "enters warning window near stage budget and denies over-limit request",
      Effect.fn(function* () {
        const budget = yield* TokenBudgetService;

        yield* budget.recordUsage("entity_extraction", 320);

        const remaining = yield* budget.getStageRemaining("entity_extraction");
        strictEqual(remaining, 30);

        const state = yield* budget.getState();
        assertTrue(isWarningThreshold(state, "entity_extraction"));

        const stillAllowed = yield* budget.canAfford("entity_extraction", 30);
        const blocked = yield* budget.canAfford("entity_extraction", 31);

        assertTrue(stillAllowed);
        assertTrue(!blocked);
      })
    );

    it.effect(
      "enforces hard stage limit once budget is fully consumed",
      Effect.fn(function* () {
        const budget = yield* TokenBudgetService;
        yield* budget.reset(1000);

        yield* budget.recordUsage("entity_extraction", 350);

        const remaining = yield* budget.getStageRemaining("entity_extraction");
        strictEqual(remaining, 0);

        const canAffordAnyMore = yield* budget.canAfford("entity_extraction", 1);
        assertTrue(!canAffordAnyMore);

        const totalRemaining = yield* budget.getRemaining();
        strictEqual(totalRemaining, 650);
      })
    );
  });

  layer(Layer.empty, { timeout: Duration.seconds(30) })("ServiceBundles", (it) => {
    it.effect(
      "Layer.mergeAll composes without conflicts",
      Effect.fn(function* () {
        const merged = Layer.mergeAll(LlmProviderBundleLive, LlmControlBundleLive, LlmRuntimeBundleLive);
        assertTrue(typeof merged === "object");
      })
    );
  });
});
