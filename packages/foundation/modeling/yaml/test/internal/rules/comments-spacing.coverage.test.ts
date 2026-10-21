import { commentsSpacing } from "@beep/yaml/internal/rules/comments-spacing";
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
        id: commentsSpacing.id,
        check: dual(
          2,
          (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> =>
            commentsSpacing.check(omitLines ? { ...ctx, lines: [] } : ctx, options)
        ),
      }),
    ],
    YamlLintConfig.make({ rules: { [commentsSpacing.id]: "error" } })
  );

it.effect("comments-spacing edge cases retain diagnostics and safe fix boundaries", () =>
  Effect.sync(() => {
    assert.deepStrictEqual(YamlLint.observe("#!/bin/yaml\n#\na: 1\n", [commentsSpacing]).votes, []);
    assert.deepStrictEqual(direct("#\n", null), []);
  })
);
