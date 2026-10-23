// Value-less flow mapping keys against an independent parser.
//
// YAML 1.2 ns-flow-map-implicit-entry: a `,` or `}` after an implicit key
// ends the entry with an empty value. A plain key with no value used to run
// on across the comma and swallow the entries after it (`{a, b}` parsed as
// `{"a b": null}`), and an empty value before a comma took the next key
// (`{a: , b}` parsed as `{a: "b"}`) (#2142). The oracle is the `yaml`
// devDependency, so a shared-defect round-trip cannot go green.

import { fcRuns } from "@beep/fc-runs/FastCheckRuns";
import { Yaml } from "@beep/yaml";
import { describe, it } from "@effect/vitest";
import { assertSuccess } from "@effect/vitest/utils";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import { parse } from "yaml";

const runs = { arbitrary: fcRuns(200) };

const Entry = S.Struct({
  key: S.Literals(["plain", "double", "single", "tagged", "explicit"]),
  value: S.Literals(["none", "empty", "plain", "quoted", "flow-seq", "flow-map"]),
});

const Separator = S.Literals([", ", ",", " , ", ",\n  ", ", # note\n  "]);

const Layout = S.Literals(["root", "map-value", "seq-item", "flow-seq", "nested-flow-map"]);

type Entry = typeof Entry.Type;
type Layout = typeof Layout.Type;

/** Keys carry their index, so generated mappings never repeat a key. */
const renderKey = (entry: Entry, index: number): string => {
  const name = `k${index}`;
  if (entry.key === "double") return `"${name}"`;
  if (entry.key === "single") return `'${name}'`;
  if (entry.key === "tagged") return `!!str ${name}`;
  return entry.key === "explicit" ? `? ${name}` : name;
};

const values: Readonly<Record<Entry["value"], string>> = {
  none: "",
  empty: ": ",
  plain: ": v",
  quoted: ': "v"',
  "flow-seq": ": [x, y]",
  "flow-map": ": {p, q}",
};

const renderMap = (entries: ReadonlyArray<Entry>, separator: string, trailingComma: boolean): string =>
  `{${A.join(
    A.map(entries, (entry, index) => `${renderKey(entry, index)}${values[entry.value]}`),
    separator
  )}${trailingComma ? "," : ""}}`;

const layouts: Readonly<Record<Layout, (map: string) => string>> = {
  root: (map) => `${map}\n`,
  "map-value": (map) => `k: ${map}\nz: 1\n`,
  "seq-item": (map) => `- ${map}\n- w\n`,
  "flow-seq": (map) => `[${map}, w]\n`,
  "nested-flow-map": (map) => `{outer: ${map}, z}\n`,
};

describe("value-less flow mapping keys", () => {
  it.effect.prop(
    "flow mappings with value-less keys and empty values match the yaml oracle",
    [
      Arbitrary.schema(Layout),
      Arbitrary.schema(S.Array(Entry).check(S.isMinLength(1), S.isMaxLength(4))),
      Arbitrary.schema(Separator),
      Arbitrary.schema(S.Boolean),
    ],
    ([layout, entries, separator, trailingComma]) =>
      Effect.sync(() => {
        const input = layouts[layout](renderMap(entries, separator, trailingComma));
        assertSuccess(Yaml.parseResult(input), parse(input));
      }),
    runs
  );
});
