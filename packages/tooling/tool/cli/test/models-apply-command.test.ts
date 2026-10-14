import { ModelsManifest, modelsCommand } from "@beep/repo-cli/commands/Models";
import { A } from "@beep/utils";
import { NodeServices } from "@effect/platform-node";
import * as NodeCrypto from "@effect/platform-node-shared/NodeCrypto";
import { expect, layer } from "@effect/vitest";
import * as Console from "effect/Console";
import { Command } from "effect/cli";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import { FetchHttpClient } from "effect/http";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Tuple from "effect/Tuple";
import * as TestConsole from "effect/testing/TestConsole";

const run = Command.runWith(modelsCommand, { version: "0.0.0" });
const decodeManifest = S.decodeEffect(ModelsManifest);
const encodeManifest = S.encodeEffect(S.fromJsonString(ModelsManifest));
const native = '# synthetic native state\nmodel = "old"\n[projects.synthetic]\ntrust_level = "trusted"\n';

const fixture = Effect.fnUntraced(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = path.resolve(".beep");
  yield* fs.makeDirectory(directory, { recursive: true });
  const home = yield* fs.makeTempDirectoryScoped({ directory, prefix: "models-command-" });
  const file = path.join(home, "config.toml");
  const manifestFile = path.join(home, "manifest.yaml");
  const manifest = yield* decodeManifest({
    version: "beep-models/v1",
    bindings: [{ role: "codex.heavy", surface: "codex-cli", modelId: "gpt-6.1-sol", effort: "medium", supersedes: [] }],
    targets: [
      {
        id: "synthetic.codex",
        root: "home",
        path: "$HOME/config.toml",
        optional: false,
        locators: [
          {
            _tag: "toml-top-level-key",
            binding: { role: "codex.heavy", surface: "codex-cli", field: "model" },
            render: { _tag: "verbatim" },
            key: "model",
          },
        ],
      },
      { id: "synthetic.optional", root: "home", path: "$HOME/absent.toml", optional: true, locators: [] },
      {
        id: "synthetic.doctrine",
        root: "repo",
        path: "AGENTS.md",
        optional: false,
        locators: [
          {
            _tag: "md-generated-block",
            blockId: "synthetic",
            filter: { roles: ["codex.heavy"], surfaces: ["codex-cli"] },
            includeSuperseded: false,
          },
        ],
      },
    ],
    superseded: [],
  });
  yield* fs.writeFileString(file, native);
  yield* fs.writeFileString(
    path.join(home, "AGENTS.md"),
    "intro\n<!-- beep-models:begin synthetic -->\nold\n<!-- beep-models:end synthetic -->\ntail\n"
  );
  yield* fs.writeFileString(manifestFile, yield* encodeManifest(manifest));
  return Tuple.make(home, file, manifestFile, manifest);
});

const consoleLayer = Layer.effect(Console.Console, TestConsole.make);
layer(Layer.mergeAll(NodeServices.layer, NodeCrypto.layer, FetchHttpClient.layer, consoleLayer), {
  timeout: "30 seconds",
})((it) => {
  it.effect("checks legacy Codex permission drift, preserves pins, and journals removal", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const [home, , manifest] = yield* fixture();
      const dir = path.join(home, ".codex");
      yield* fs.makeDirectory(dir);
      const file = path.join(dir, "config.toml");
      const before = 'sandbox_mode="danger-full-access"\n' + native;
      yield* fs.writeFileString(file, before);
      const flags = ["--home", home, "--repo", home, "--manifest", manifest];
      yield* run(["codex-permissions", ...flags]);
      expect(yield* fs.readFileString(file)).toBe(before);
      yield* Effect.flip(run(["codex-permissions", ...flags, "--check"]));
      yield* Effect.flip(run(["codex-permissions", ...flags, "--check", "--write"]));
      yield* run(["codex-permissions", ...flags, "--write"]);
      expect(yield* fs.readFileString(file)).toBe(native);
      yield* run(["codex-permissions", ...flags, "--check"]);
      const journals = yield* fs.readDirectory(path.join(home, ".config-backups"));
      expect(journals).toHaveLength(2);
      yield* run(["codex-permissions", ...flags, "--write"]);
      expect(yield* fs.readDirectory(path.join(home, ".config-backups"))).toHaveLength(2);
    })
  );

  it.effect("previews every owned target, writes one target idempotently, and restores its journal", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const [home, file, manifest] = yield* fixture();
      const flags = ["--home", home, "--repo", home, "--manifest", manifest];
      yield* run(["apply", ...flags]);
      expect(yield* fs.readFileString(file)).toBe(native);
      expect(yield* fs.exists(path.join(home, ".config-backups"))).toBe(false);
      yield* Effect.flip(run(["apply", ...flags, "--check", "--target", "synthetic.codex"]));
      yield* run(["apply", ...flags, "--write", "--target", "synthetic.codex"]);
      expect(yield* fs.readFileString(file)).toContain('model = "gpt-6.1-sol"');
      yield* run(["apply", ...flags, "--check", "--target", "synthetic.codex"]);
      yield* run(["apply", ...flags, "--write", "--target", "synthetic.codex"]);
      const files = yield* fs.readDirectory(path.join(home, ".config-backups"));
      expect(files).toHaveLength(2);
      const journalFile = O.getOrThrow(A.findFirst(files, Str.endsWith(".json")));
      yield* run(["restore", ...flags, "--journal", Str.replace(/\.json$/, "")(journalFile)]);
      expect(yield* fs.readFileString(file)).toBe(native);
      yield* Effect.flip(run(["restore", ...flags, "--journal", "../unsafe"]));
    })
  );

  it.effect("rejects conflicting modes, unmatched ids, and symlink escapes without native writes", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const [home, file, manifest] = yield* fixture();
      const flags = ["--home", home, "--repo", home, "--manifest", manifest];
      yield* Effect.flip(run(["apply", ...flags, "--check", "--write"]));
      yield* Effect.flip(run(["apply", ...flags, "--target", "absent"]));
      const outside = yield* fs.makeTempFileScoped({ directory: path.dirname(home), prefix: "outside-models-" });
      yield* fs.writeFileString(outside, native);
      yield* fs.remove(file);
      yield* fs.symlink(outside, file);
      yield* Effect.flip(run(["apply", ...flags, "--write", "--target", "synthetic.codex"]));
      expect(yield* fs.readFileString(outside)).toBe(native);
      expect(yield* fs.exists(path.join(home, ".config-backups"))).toBe(false);
    })
  );

  it.effect("rejects unresolved bindings before a writer can apply them", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const [home, file, manifestFile, manifest] = yield* fixture();
      yield* fs.writeFileString(
        manifestFile,
        yield* encodeManifest(ModelsManifest.make({ ...manifest, bindings: [] }))
      );
      yield* Effect.flip(
        run([
          "apply",
          "--home",
          home,
          "--repo",
          home,
          "--manifest",
          manifestFile,
          "--write",
          "--target",
          "synthetic.codex",
        ])
      );
      expect(yield* fs.readFileString(file)).toBe(native);
    })
  );
});
