import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";
import { A } from "@beep/utils";
import { describe, expect, it } from "vitest";

const configIncludesPlugin = (pluginName: string): boolean =>
  A.some(DocsESLintConfig, (entry) => entry.plugins !== undefined && pluginName in entry.plugins);

describe("docs-eslint-config", () => {
  it("does not register the legacy beep-laws plugin", () => {
    expect(configIncludesPlugin("beep-laws")).toBe(false);
  });

  it("keeps jsdoc and tsdoc plugins available for the docs lane", () => {
    expect(configIncludesPlugin("jsdoc")).toBe(true);
    expect(configIncludesPlugin("beep-jsdoc")).toBe(true);
    expect(configIncludesPlugin("eslint-plugin-tsdoc")).toBe(true);
  });
});
