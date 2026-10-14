import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";
import { it } from "@beep/test-runner";
import { A } from "@beep/utils";
import { describe, expect } from "vitest";

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

  // Labs ceremony/law asymmetry (goals/lab-apps-lifecycle D2): the docs
  // (ceremony) profile ignores apps/labs globally. Native deprecated-API
  // law coverage is exercised by repo-cli lint worker regressions.
  it("ignores apps/labs in the docs (ceremony) profile via global ignores", () => {
    const globalEntry = DocsESLintConfig[0];
    expect(globalEntry?.files).toBeUndefined();
    expect(globalEntry?.ignores).toContain("apps/labs/**");
  });
});
