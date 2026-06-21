import { DeprecatedApisESLintConfig } from "@beep/repo-configs/eslint/DeprecatedApisESLintConfig";
import { DocsESLintConfig } from "@beep/repo-configs/eslint/DocsESLintConfig";

const eslintProfile = process.env.BEEP_ESLINT_PROFILE ?? "docs";

const selectedESLintConfig = (() => {
  if (eslintProfile === "deprecated-apis") {
    return DeprecatedApisESLintConfig;
  }

  if (eslintProfile === "docs") {
    return DocsESLintConfig;
  }

  throw new Error(`Unsupported BEEP_ESLINT_PROFILE: ${eslintProfile}`);
})();

export default selectedESLintConfig;
