import { RULE_NAMES, RULES, rulePath, rulesDir } from "@beep/lint-rules";
import { NodeServices } from "@effect/platform-node";
import { Effect, FileSystem, Path } from "effect";
import { describe, expect, it } from "vitest";
import { provideScopedLayer } from "./harness.ts";

const run = <A, E>(program: Effect.Effect<A, E, NodeServices.NodeServices>): Promise<A> =>
  Effect.runPromise(program.pipe(provideScopedLayer(NodeServices.layer)));

const sortedRuleNames = [...RULE_NAMES].sort();

/** Repo root (five levels up from `test/registry.test.ts`). */
const repoRoot = decodeURIComponent(new URL("../../../../../", import.meta.url).pathname);

describe("rule registry", () => {
  it("RULES keys match RULE_NAMES exactly", () => {
    expect(Object.keys(RULES).sort()).toEqual(sortedRuleNames);
  });

  it("every registered rule has a non-empty .grit file declaring `language js`", () =>
    run(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        for (const name of RULE_NAMES) {
          const file = rulePath(name);
          const exists = yield* fs.exists(file);
          expect(exists, `${name}.grit must exist`).toBe(true);
          const content = yield* fs.readFileString(file);
          expect(content.includes("language js"), `${name}.grit must declare language js`).toBe(true);
          expect(content.includes("register_diagnostic"), `${name}.grit must register a diagnostic`).toBe(true);
        }
      })
    ));

  it("has no orphan .grit files missing from the registry", () =>
    run(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const entries = yield* fs.readDirectory(rulesDir());
        const gritFiles = entries
          .filter((f) => f.endsWith(".grit"))
          .map((f) => path.basename(f, ".grit"))
          .sort();
        expect(gritFiles).toEqual(sortedRuleNames);
      })
    ));

  it("every rule metadata entry is self-consistent", () => {
    for (const name of RULE_NAMES) {
      expect(RULES[name].name).toBe(name);
      expect(["warn", "error"]).toContain(RULES[name].severity);
      expect(RULES[name].summary.length).toBeGreaterThan(0);
    }
  });

  it("every rule is wired into the repo-root biome.jsonc lint pass", () =>
    run(
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        // biome.jsonc is JSONC (comments); assert the plugin path substring is present —
        // this covers both the top-level `plugins` array and any `overrides[].plugins`.
        const biomeConfig = yield* fs.readFileString(path.join(repoRoot, "biome.jsonc"));
        for (const name of RULE_NAMES) {
          const pluginRef = `rules/${name}.grit`;
          expect(biomeConfig.includes(pluginRef), `${name} must be registered in biome.jsonc (${pluginRef})`).toBe(
            true
          );
        }
      })
    ));
});
