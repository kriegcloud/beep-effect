import { eofNewline } from "@beep/yaml/internal/rules/eof-newline";
import { YamlDocument } from "@beep/yaml/YamlDocument";
import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
import { YamlRule } from "@beep/yaml/YamlLintRule";
import { YamlScalar } from "@beep/yaml/YamlNode";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import type { LintContext, YamlLintDiagnostic } from "@beep/yaml/YamlLintRule";

const direct = (text: string, options: unknown, omitLines = false) =>
  YamlLint.run(
    text,
    [
      YamlRule.make({
        id: eofNewline.id,
        check: dual(
          2,
          (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> =>
            eofNewline.check(omitLines ? { ...ctx, lines: [] } : ctx, options)
        ),
      }),
    ],
    YamlLintConfig.make({ rules: { [eofNewline.id]: "error" } })
  );

it.effect("eof-newline edge cases retain diagnostics and safe fix boundaries", () =>
  Effect.sync(() => {
    assert.deepStrictEqual(direct("value", {}, true), []);
  })
);

it.effect("retains the newline fix when recovered scalar text has no nonblank value line", () =>
  Effect.sync(() => {
    const text = "|+\n  content\n  ";
    const diagnostics = YamlLint.run(
      text,
      [
        YamlRule.make({
          id: eofNewline.id,
          check: dual(
            2,
            (ctx: LintContext, _options: unknown): Iterable<YamlLintDiagnostic> =>
              eofNewline.check(
                {
                  ...ctx,
                  document: YamlDocument.make({
                    ...ctx.document,
                    contents: YamlScalar.make({
                      value: "\n",
                      style: "block-literal",
                      chomp: "keep",
                      offset: 0,
                      length: text.length,
                    }),
                  }),
                },
                {}
              )
          ),
        }),
      ],
      YamlLintConfig.make({ rules: { [eofNewline.id]: "error" } })
    );
    assert.strictEqual(diagnostics.length, 1);
    assert.strictEqual(diagnostics[0]?.fix?.content, "\n");
  })
);
