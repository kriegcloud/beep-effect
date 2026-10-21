import { hyphenSpacing } from "@beep/yaml/internal/rules/hyphen-spacing";
import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
import { YamlRule } from "@beep/yaml/YamlLintRule";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import type { LintContext, YamlLintDiagnostic } from "@beep/yaml/YamlLintRule";

it.effect("direct options clamp spacing and retain a safe deletion", () =>
  Effect.sync(() => {
    for (const options of [{ maxSpacesAfter: 2 }, { maxSpacesAfter: 0 }, { maxSpacesAfter: "invalid" }, null]) {
      const findings = YamlLint.run(
        "-   x\n",
        [
          YamlRule.make({
            id: hyphenSpacing.id,
            check: dual(
              2,
              (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> => hyphenSpacing.check(ctx, options)
            ),
          }),
        ],
        YamlLintConfig.make({ rules: { "hyphen-spacing": "error" } })
      );
      assert.strictEqual(findings.length, 1);
      const max = options?.maxSpacesAfter === 2 ? 2 : 1;
      assert.strictEqual(findings[0]?.length, 3);
      assert.strictEqual(findings[0]?.fix?.length, 3 - max);
      assert.strictEqual(findings[0]?.fix?.content, "");
    }
  })
);
