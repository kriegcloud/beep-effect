import { documentStart } from "@beep/yaml/internal/rules/document-start";
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
        id: documentStart.id,
        check: dual(
          2,
          (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> =>
            documentStart.check(omitLines ? { ...ctx, lines: [] } : ctx, options)
        ),
      }),
    ],
    YamlLintConfig.make({ rules: { [documentStart.id]: "error" } })
  );

it.effect("document-start edge cases retain diagnostics and safe fix boundaries", () =>
  Effect.sync(() => {
    assert.deepStrictEqual(YamlLint.observe("# only a comment\n", [documentStart]).votes, []);
    const result = direct("---\na: 1\n", { present: false }, true);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0]?.fix, undefined);
  })
);
