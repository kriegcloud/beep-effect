import { lineLength } from "@beep/yaml/internal/rules/line-length";
import { YamlDocument } from "@beep/yaml/YamlDocument";
import { LintContext, LintLine } from "@beep/yaml/YamlLintRule";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("empty input provides no line-length inference floor", () =>
  Effect.sync(() => {
    assert.isDefined(lineLength.infer);
    if (lineLength.infer === undefined) return;
    const document = YamlDocument.make({ contents: null, errors: [], warnings: [], directives: [] });
    assert.deepStrictEqual(
      lineLength.infer(
        LintContext.make({ text: "", lines: [LintLine.make({ text: "", offset: 0, number: 0 })], tokens: [], document })
      ),
      []
    );
  })
);
