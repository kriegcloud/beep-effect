import { indentation } from "@beep/yaml/internal/rules/indentation";
import { YamlLint, YamlLintConfig } from "@beep/yaml/YamlLint";
import { assert, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";

it.effect("directives, tabs and framing do not train block indentation", () =>
  Effect.sync(() => {
    const text = "%YAML 1.2\n---\na:\n\tbad: x\n...\n";
    const findings = YamlLint.run(text, [indentation], YamlLintConfig.make({ rules: { indentation: { spaces: 2 } } }));
    assert.deepStrictEqual(
      A.filter(findings, (finding) => finding.rule === "indentation"),
      []
    );
    const evidence = YamlLint.observe(text, [indentation]);
    assert.deepStrictEqual(evidence.votes, []);
  })
);

it.effect("compact nested sequences train their actual indentation and stable sequence policy", () =>
  Effect.sync(() => {
    const text = "a:\n  - - x\n    - y\nb:\n  - z\n";
    const findings = YamlLint.run(
      text,
      [indentation],
      YamlLintConfig.make({ rules: { indentation: { spaces: 2, indentSequences: true } } })
    );
    assert.deepStrictEqual(findings, []);
    const evidence = YamlLint.observe(text, [indentation]);
    assert.deepStrictEqual(
      A.map(
        A.filter(evidence.votes, (vote) => vote.dimension === "indentSequences"),
        (vote) => vote.value
      ),
      [true]
    );
    assert.isAbove(A.filter(evidence.votes, (vote) => vote.dimension === "spaces").length, 0);
    assert.deepStrictEqual(
      A.map(
        A.filter(evidence.votes, (vote) => vote.dimension === "indentSequences"),
        (vote) => vote.count
      ),
      [2]
    );
  })
);

it.effect("an unindented first sequence establishes policy before an indentation unit exists", () =>
  Effect.sync(() => {
    const text = "a:\n- x\nb:\n- y\n";
    assert.deepStrictEqual(
      YamlLint.run(text, [indentation], YamlLintConfig.make({ rules: { indentation: "error" } })),
      []
    );
    const evidence = YamlLint.observe(text, [indentation]);
    assert.deepStrictEqual(
      A.map(evidence.votes, (vote) => vote.value),
      [false]
    );
    assert.deepStrictEqual(
      A.map(evidence.votes, (vote) => vote.count),
      [2]
    );
  })
);
