import * as MarkdownExports from "@beep/markdown";
import * as FrontmatterExports from "@beep/markdown/Frontmatter";
import * as FrontmatterResolverExports from "@beep/markdown/FrontmatterResolver";
import * as JsonExports from "@beep/markdown/JsonFrontmatter";
import * as MdxExports from "@beep/markdown/MarkdownMdx";
import { Mdast } from "@beep/markdown/Mdast";
import * as TomlExports from "@beep/markdown/TomlFrontmatter";
import * as YamlExports from "@beep/markdown/YamlFrontmatter";
import { assert, describe, it } from "@effect/vitest";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as R from "effect/Record";
import * as Str from "effect/String";
import { importClosure } from "./support/importClosure.ts";

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
    Effect.sync(() => {
      const closure = importClosure("index.ts");
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

  it.effect("keeps the codecs reachable from their own subpaths", () =>
    Effect.sync(() => {
      assert.include(importClosure("YamlFrontmatter.ts").packages, "@beep/yaml/Yaml");
    })
  );
});
