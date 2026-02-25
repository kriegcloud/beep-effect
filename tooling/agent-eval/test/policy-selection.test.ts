import { describe, expect, it } from "vitest";
import {
  hasValidSkillCap,
  type PolicyOverlay,
  selectFocusedSkills,
  selectPolicyPacket,
} from "../src/policies/index.js";

describe("policy selection", () => {
  const overlays: ReadonlyArray<PolicyOverlay> = [
    {
      id: "a",
      description: "adaptive",
      conditions: ["adaptive", "adaptive_kg"],
      categories: ["apps_web", "tooling_cli", "package_lib"],
      priority: 100,
      maxSkills: 3,
      maxFacts: 6,
      maxChars: 2200,
      keywords: ["effect", "schema"],
    },
  ];

  it("enforces max 3 skills", () => {
    const packet = selectPolicyPacket(overlays, "adaptive", "apps_web");
    const skills = selectFocusedSkills(
      "service layer schema import error catch stream tool openai graph",
      "apps_web",
      packet.maxSkills
    );

    expect(hasValidSkillCap(skills, 3)).toBe(true);
  });

  it("is deterministic for same prompt", () => {
    const first = selectFocusedSkills("service layer schema import", "tooling_cli", 3);
    const second = selectFocusedSkills("service layer schema import", "tooling_cli", 3);
    expect(first).toEqual(second);
  });
});
