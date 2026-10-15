/**
 * Documentation plugin registry for the dedicated oxlint lane.
 *
 * @packageDocumentation
 * @since 0.1.0
 */
import { definePlugin } from "@oxlint/plugins";
import { docsRule } from "./docs.ts";
import tsdocSyntax from "./tsdoc-syntax.ts";

export { DocsRuleId, DocsRuleSet } from "./docs.model.ts";
export { docsRule } from "./docs.ts";

/**
 * Repository documentation rules under the beep plugin namespace.
 *
 * **Example** (Inspect the documentation plugin)
 * ```ts
 * import plugin from "@beep/lint-rules/oxlint-docs"
 * console.log(plugin.rules["require-jsdoc"]?.meta?.type)
 * ```
 * @category tools
 * @since 0.1.0
 */
export default definePlugin({
  meta: { name: "beep" },
  rules: {
    "require-jsdoc": docsRule("require-jsdoc"),
    "informative-docs": docsRule("informative-docs"),
    "no-blank-block-descriptions": docsRule("no-blank-block-descriptions"),
    "check-tag-names": docsRule("check-tag-names"),
    "check-param-names": docsRule("check-param-names"),
    "require-category-tag": docsRule("require-category-tag"),
    "require-description": docsRule("require-description"),
    "require-param": docsRule("require-param"),
    "require-param-description": docsRule("require-param-description"),
    "require-returns": docsRule("require-returns"),
    "require-returns-description": docsRule("require-returns-description"),
    "match-description": docsRule("match-description"),
    "require-file-overview": docsRule("require-file-overview"),
    "tsdoc-syntax": tsdocSyntax,
  },
});
