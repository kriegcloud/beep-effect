import * as MarkdownExports from "@beep/markdown";
import * as FrontmatterExports from "@beep/markdown/Frontmatter";
import * as FrontmatterResolverExports from "@beep/markdown/FrontmatterResolver";
import * as JsonExports from "@beep/markdown/JsonFrontmatter";
import * as MdxExports from "@beep/markdown/MarkdownMdx";
import { Mdast } from "@beep/markdown/Mdast";
import * as TomlExports from "@beep/markdown/TomlFrontmatter";
import * as YamlExports from "@beep/markdown/YamlFrontmatter";
import * as ImportGraph from "@beep/test-utils/ImportGraph";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";

// Every package source module's text, keyed by its path under `src/` (for
// example `"internal/stringify.ts"`). Vite inlines the raw text at transform
// time, so the walk needs no filesystem.
const SOURCES = ImportGraph.fromGlob(
  import.meta.glob<string>("../src/**/*.ts", { query: "?raw", import: "default", eager: true }),
  { prefix: "../src/" }
);

const importClosure = (entry: string) => ImportGraph.closure({ sources: SOURCES, entry });

const CODEC_PACKAGES = ["@beep/yaml", "@beep/toml", "@beep/jsonc"] as const;

const exportNames = (module: Readonly<Record<string, unknown>>): ReadonlyArray<string> => R.keys(module);

describe("root barrel", () => {
  it.effect("exposes the owned core adapters by identity", () =>
    Effect.sync(() => {
      assert.strictEqual(MarkdownExports.Mdast, Mdast);
    })
  );

  it.effect("is core-only: the typed-frontmatter codecs and the MDX vocabulary are subpath imports", () =>
    Effect.sync(() => {
      const names = exportNames(MarkdownExports);
      // Every runtime export of the subpath-only modules, read from the
      // modules themselves so a newly added export cannot slip past the list.
      const subpathOnly = A.flatMap(
        [FrontmatterExports, FrontmatterResolverExports, JsonExports, MdxExports, TomlExports, YamlExports],
        exportNames
      );
      assert.isAtLeast(subpathOnly.length, 29);
      for (const name of subpathOnly) {
        assert.notInclude(names, name);
      }
    })
  );

  it.effect("never reaches @beep/yaml, @beep/toml or @beep/jsonc through its runtime import closure", () =>
    Effect.gen(function* () {
      const closure = yield* importClosure("index.ts");
      // The walk really ran: the barrel reaches the parser and the node schemas.
      assert.include(closure.modules, "internal/blockParser.ts");
      assert.include(closure.modules, "internal/nodes.ts");
      assert.notInclude(closure.modules, "YamlFrontmatter.ts");
      assert.notInclude(closure.modules, "Frontmatter.ts");
      const reached = A.filter(closure.packages, (specifier) =>
        A.some(CODEC_PACKAGES, (codec) => specifier === codec || Str.startsWith(`${codec}/`)(specifier))
      );
      assert.deepStrictEqual(reached, []);
    })
  );

  it.effect("keeps FrontmatterSource string-level: its runtime closure never reaches the parsers", () =>
    Effect.gen(function* () {
      const closure = yield* importClosure("FrontmatterSource.ts");
      // The walk really ran: the splitter reaches the raw offset-0 scanner.
      assert.include(closure.modules, "internal/blocks/frontmatter.ts");
      assert.notInclude(closure.modules, "internal/blockParser.ts");
      assert.notInclude(closure.modules, "internal/inlineParser.ts");
      assert.notInclude(closure.modules, "index.ts");
    })
  );

  it.effect("keeps the codecs reachable from their own subpaths", () =>
    Effect.gen(function* () {
      assert.include((yield* importClosure("YamlFrontmatter.ts")).packages, "@beep/yaml/Yaml");
    })
  );
});
