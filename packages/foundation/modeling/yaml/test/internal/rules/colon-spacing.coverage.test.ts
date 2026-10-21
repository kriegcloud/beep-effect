import { colonSpacing } from "@beep/yaml/internal/rules/colon-spacing";
import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
import { YamlRule } from "@beep/yaml/YamlLintRule";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import type { LintContext, YamlLintDiagnostic } from "@beep/yaml/YamlLintRule";

const direct = (text: string, options: unknown, omitLines = false) =>
  YamlLint.run(
    text,
    [
      YamlRule.make({
        id: colonSpacing.id,
        check: dual(
          2,
          (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> =>
            colonSpacing.check(omitLines ? { ...ctx, lines: [] } : ctx, options)
        ),
      }),
    ],
    YamlLintConfig.make({ rules: { [colonSpacing.id]: "error" } })
  );

it.effect("colon-spacing edge cases retain diagnostics and safe fix boundaries", () =>
  Effect.sync(() => {
    assert.strictEqual(direct("a :   value\n", null).length, 2);
    assert.strictEqual(direct("a :   value\n", {}).length, 2);
    assert.strictEqual(direct("a :   value\n", { maxSpacesBefore: 1, maxSpacesAfter: 2 }).length, 1);
  })
);
