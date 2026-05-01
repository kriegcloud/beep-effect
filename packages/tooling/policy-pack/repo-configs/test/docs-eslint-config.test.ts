import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";
import { describe, expect, it } from "vitest";

describe("docs-eslint-config", () => {
  it("does not register the legacy beep-laws plugin", () => {
    expect(DocsESLintConfig.some((entry) => entry.plugins !== undefined && "beep-laws" in entry.plugins)).toBe(false);
  });

  it("keeps jsdoc and tsdoc plugins available for the docs lane", () => {
    expect(DocsESLintConfig.some((entry) => entry.plugins !== undefined && "jsdoc" in entry.plugins)).toBe(true);
    expect(DocsESLintConfig.some((entry) => entry.plugins !== undefined && "beep-jsdoc" in entry.plugins)).toBe(true);
    expect(
      DocsESLintConfig.some((entry) => entry.plugins !== undefined && "eslint-plugin-tsdoc" in entry.plugins)
    ).toBe(true);
  });
});
