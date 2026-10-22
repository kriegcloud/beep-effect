import * as MarkdownExports from "@beep/markdown";
import { Mdast } from "@beep/markdown/Mdast";
import { TomlFrontmatter } from "@beep/markdown/TomlFrontmatter";
import { YamlFrontmatter } from "@beep/markdown/YamlFrontmatter";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";

it.effect("barrel exposes the owned adapters by identity", () =>
  Effect.sync(() => {
    assert.strictEqual(MarkdownExports.Mdast, Mdast);
    assert.strictEqual(MarkdownExports.TomlFrontmatter, TomlFrontmatter);
    assert.strictEqual(MarkdownExports.YamlFrontmatter, YamlFrontmatter);
  })
);
