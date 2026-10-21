import { YamlParseOptions } from "@beep/yaml";
import { keyDuplicates } from "@beep/yaml/internal/rules/key-duplicates";
import { YamlDocument } from "@beep/yaml/YamlDocument";
import { LintContext } from "@beep/yaml/YamlLintRule";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("complex mapping keys are traversed without inventing scalar duplicate identities", () =>
  Effect.gen(function* () {
    const text = "? [a, b]\n: one\n? [a, b]\n: two\n";
    const document = yield* YamlDocument.parse(text, YamlParseOptions.make({ uniqueKeys: false }));
    assert.deepStrictEqual(keyDuplicates.check(LintContext.make({ text, document, lines: [], tokens: [] }), {}), []);
  })
);
