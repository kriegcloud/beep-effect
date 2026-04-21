import { buildEffectSteeringBlock, shouldShowEffectSteering } from "@beep/claude/hooks/skill-suggester/index";
import { describe, expect, it } from "vitest";

describe("effect steering hook", () => {
  it("shows effect steering for effect-first prompts", () => {
    expect(shouldShowEffectSteering("Please refactor this Effect Option flow")).toBe(true);

    const block = buildEffectSteeringBlock("Please refactor this Effect Option flow");
    expect(block._tag).toBe("Some");
    if (block._tag === "Some") {
      expect(block.value).toContain("<effect-steering>");
      expect(block.value).toContain("Before O.match(...)");
      expect(block.value).toContain("R.getSomes({...})");
      expect(block.value).toContain("O.all({...})");
      expect(block.value).toContain("S.OptionFrom*");
      expect(block.value).toContain("Match.type<T>().pipe(...)");
      expect(block.value).toContain("nested Bool.match(...)");
    }
  });

  it("skips effect steering for unrelated prompts", () => {
    expect(shouldShowEffectSteering("deploy the desktop app")).toBe(false);
    expect(buildEffectSteeringBlock("deploy the desktop app")._tag).toBe("None");
  });
});
