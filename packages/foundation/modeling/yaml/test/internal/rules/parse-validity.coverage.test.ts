import { parseValidity } from "@beep/yaml/internal/rules/parse-validity";
import { YamlDiagnostic } from "@beep/yaml/YamlDiagnostic";
import { YamlDocument } from "@beep/yaml/YamlDocument";
import { LintContext } from "@beep/yaml/YamlLintRule";
import { assert, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

it.effect("recovered warnings preserve their severity and source span", () =>
  Effect.sync(() => {
    const diagnostic = YamlDiagnostic.make({
      code: "UnexpectedToken",
      message: "recovered warning",
      offset: 4,
      length: 2,
      line: 1,
      character: 2,
    });
    const document = YamlDocument.make({
      contents: null,
      errors: [diagnostic],
      warnings: [diagnostic],
      directives: [],
    });
    const findings = parseValidity.check(LintContext.make({ text: "a\n  xx", lines: [], tokens: [], document }), {});
    assert.deepStrictEqual(
      A.map(A.fromIterable(findings), (finding) => ({
        rule: finding.rule,
        severity: finding.severity,
        message: finding.message,
        offset: finding.offset,
        length: finding.length,
        line: finding.line,
        character: finding.character,
      })),
      [
        {
          rule: "parse-validity",
          severity: "error",
          message: "recovered warning",
          offset: 4,
          length: 2,
          line: 1,
          character: 2,
        },
        {
          rule: "parse-validity",
          severity: "warning",
          message: "recovered warning",
          offset: 4,
          length: 2,
          line: 1,
          character: 2,
        },
      ]
    );
  })
);
