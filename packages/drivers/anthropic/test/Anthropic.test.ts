import {
  ANTHROPIC_DEFAULT_APPROXIMATE_PRICE,
  ANTHROPIC_DEFAULT_MODEL,
  AnthropicLanguageModelLive,
  AnthropicTurnPlan,
  makeAnthropicLanguageModelLayer,
} from "@beep/anthropic";
import { describe, expect, it } from "@effect/vitest";

describe("@beep/anthropic", () => {
  it("pins the generated-catalog-safe default model", () => {
    expect(ANTHROPIC_DEFAULT_MODEL).toBe("claude-opus-4-6");
    expect(ANTHROPIC_DEFAULT_APPROXIMATE_PRICE.model).toBe(ANTHROPIC_DEFAULT_MODEL);
  });

  it("builds live layers and the acquisition retry plan", () => {
    expect(AnthropicLanguageModelLive).toBeDefined();
    expect(makeAnthropicLanguageModelLayer()).toBeDefined();
    expect(AnthropicTurnPlan).toBeDefined();
  });
});
