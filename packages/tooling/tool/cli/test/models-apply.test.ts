import { ModelsApply, ModelsApplyLive } from "@beep/repo-cli/commands/Models/Models.apply.service";
import {
  BindingFilter,
  LocatorBinding,
  ModelsLocatorWrite,
} from "@beep/repo-cli/commands/Models/Models.manifest.schemas";
import { modelsApplySpans, modelsWriteSpans } from "@beep/repo-cli/commands/Models/Models.spans";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { assertNone } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as ChildProcess from "effect/process/ChildProcess";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as Stream from "effect/Stream";
import type { Locator, LocatorRender } from "@beep/repo-cli/commands/Models/Models.manifest.schemas";

const binding: LocatorBinding = LocatorBinding.make({ role: "codex.heavy", surface: "codex-cli", field: "model" });
const render: LocatorRender = { _tag: "verbatim" };
const write = (locator: Locator, expected = "gpt-6.1-sol") => ModelsLocatorWrite.make({ locator, expected });
const topLevel = write({ _tag: "toml-top-level-key", binding, render, key: "model" });
const native = A.join(
  [
    "# Unicode stays: café 🔑",
    'model  =  "old" # owned',
    "unknown = { retained = true }",
    ...A.flatMap(A.range(0, 493), (i) => [`[projects."synthetic-${i}"]`, 'trust_level = "trusted"']),
    ...A.flatMap(A.range(0, 310), (i) => [`[hooks.state."synthetic-${i}"]`, "enabled = true"]),
    "",
  ],
  "\r\n"
);

const writerWithFs = Effect.fn("ModelsApplyTest.writerWithFs")(function* (
  fs: FileSystem.FileSystem,
  spawner?: Context.Service.Shape<typeof ChildProcessSpawner.ChildProcessSpawner>
) {
  const configured = ModelsApplyLive.pipe(Layer.provide(Layer.succeed(FileSystem.FileSystem, fs)));
  const services = yield* Layer.build(
    spawner === undefined
      ? configured
      : configured.pipe(Layer.provide(Layer.succeed(ChildProcessSpawner.ChildProcessSpawner, spawner)))
  );
  return Context.get(services, ModelsApply);
});

layer(NodeServices.layer, { timeout: "30 seconds" })((it) => {
  it.effect("preserves every native byte outside a top-level scalar with 494 projects and 311 hook states", () =>
    Effect.gen(function* () {
      const spans = yield* modelsWriteSpans(native, topLevel);
      expect(spans).toHaveLength(1);
      expect(yield* modelsApplySpans(native, spans)).toBe(native.replace('"old"', '"gpt-6.1-sol"'));
    })
  );

  it.effect("updates all shell occurrences while exposing mixed values to the checker", () =>
    Effect.gen(function* () {
      const content = 'export MODEL="old"\nMODEL=other command\n# native suffix\n';
      const request = write({ _tag: "shell-assign", binding, render, variable: "MODEL", within: O.none() });
      const spans = yield* modelsWriteSpans(content, request);
      expect(spans).toHaveLength(2);
      expect(yield* modelsApplySpans(content, spans)).toBe(
        "export MODEL=gpt-6.1-sol\nMODEL=gpt-6.1-sol command\n# native suffix\n"
      );
    })
  );

  it.effect("resolves every supported grammar without changing unowned text", () =>
    Effect.gen(function* () {
      const cases: ReadonlyArray<readonly [string, Locator, string]> = [
        [
          '[models]\ndefault = "old" # tail\n[native]\nkeep = true\n',
          { _tag: "toml-table-key", binding, render, table: "models", key: "default" },
          '[models]\ndefault = "gpt-6.1-sol" # tail\n[native]\nkeep = true\n',
        ],
        [
          '{"model":"old", "unknown":{"keep":true}}',
          { _tag: "json-key", binding, render, pointer: ["model"], fallbacks: [] },
          '{"model":"gpt-6.1-sol", "unknown":{"keep":true}}',
        ],
        [
          "models:\n  default: old # tail\nunknown: yes\n",
          { _tag: "yaml-path", binding, render, path: ["models", "default"] },
          'models:\n  default: "gpt-6.1-sol" # tail\nunknown: yes\n',
        ],
        [
          'export MODEL="old" # tail\nKEEP=1\n',
          { _tag: "env-key", binding, render, key: "MODEL" },
          'export MODEL="gpt-6.1-sol" # tail\nKEEP=1\n',
        ],
        ["MODEL=old # tail\n", { _tag: "env-key", binding, render, key: "MODEL" }, 'MODEL="gpt-6.1-sol" # tail\n'],
        [
          'export const model = "old"; // tail\n',
          { _tag: "ts-literal", binding, render, symbol: "model" },
          'export const model = "gpt-6.1-sol"; // tail\n',
        ],
        [
          ' * model: "old"\nunowned model: "old"\n',
          { _tag: "line-value", binding, render, linePrefix: " *", before: 'model: "', after: '"' },
          ' * model: "gpt-6.1-sol"\nunowned model: "old"\n',
        ],
        [
          '<root><option name="model" value="old" keep="yes"/></root>',
          { _tag: "xml-attribute", binding, render, elementSelector: 'option[name="model"]', attribute: "value" },
          '<root><option name="model" value="gpt-6.1-sol" keep="yes"/></root>',
        ],
        [
          '<root><option name="options" value="[{&quot;model&quot;:&quot;old&quot;,&quot;keep&quot;:true}]"/></root>',
          {
            _tag: "xml-escaped-json-attribute",
            binding,
            render,
            elementSelector: 'option[name="options"]',
            attribute: "value",
            jsonPointer: ["0", "model"],
          },
          '<root><option name="options" value="[{&quot;model&quot;:&quot;gpt-6.1-sol&quot;,&quot;keep&quot;:true}]"/></root>',
        ],
        [
          "intro\n<!-- beep-models:begin x -->\nold\n<!-- beep-models:end x -->\ntail",
          {
            _tag: "md-generated-block",
            blockId: "x",
            filter: BindingFilter.make({ roles: [], surfaces: [] }),
            includeSuperseded: false,
          },
          "intro\n<!-- beep-models:begin x -->\ngpt-6.1-sol\n<!-- beep-models:end x -->\ntail",
        ],
      ];
      for (const [content, locator, expected] of cases)
        expect(yield* modelsApplySpans(content, yield* modelsWriteSpans(content, write(locator)))).toBe(expected);
    })
  );

  it.effect("takes an exclusive backup, restores exactly, and rejects stale recovery", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      yield* fs.makeDirectory(path.resolve(".beep"), { recursive: true });
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "models-fixture-" });
      const file = path.join(root, "config.toml");
      const backupDirectory = path.join(root, ".config-backups");
      yield* fs.writeFileString(file, native, { mode: 0o644 });
      const writer = yield* writerWithFs(fs);
      assertNone(yield* writer.apply(file, [topLevel], "dry-run", backupDirectory));
      expect(yield* fs.exists(backupDirectory)).toBe(false);
      const journal = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backupDirectory));
      expect(yield* fs.readFileString(journal.backup)).toBe(native);
      expect((yield* fs.stat(file)).mode & 0o777).toBe(0o644);
      const journalFile = path.join(backupDirectory, `${journal.id}.json`);
      yield* writer.restore(journalFile, backupDirectory);
      expect(yield* fs.readFileString(file)).toBe(native);
      expect((yield* fs.stat(file)).mode & 0o777).toBe(0o644);
      yield* writer.restore(journalFile, backupDirectory);
      const second = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backupDirectory));
      yield* fs.writeFileString(file, `${native}\n# external native write\n`);
      yield* Effect.flip(writer.restore(path.join(backupDirectory, `${second.id}.json`), backupDirectory));
      expect(yield* fs.readFileString(file)).toContain("external native write");
    })
  );

  it.effect("removes only an owned legacy key, detects its return, and restores exact bytes", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "remove-fixture-" });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      for (const key of ["sandbox_mode", '"sandbox_mode"', "'sandbox_mode'"]) {
        const before = `${key} = "danger-full-access" # legacy\r\n` + native;
        yield* fs.writeFileString(file, before);
        const request = ModelsLocatorWrite.make({
          locator: { _tag: "toml-top-level-key", binding, render, key: "sandbox_mode" },
          expected: "",
          remove: true,
        });
        const writer = yield* writerWithFs(fs);
        yield* Effect.flip(writer.apply(file, [request], "check", backups));
        const journal = O.getOrThrow(yield* writer.apply(file, [request], "write", backups));
        expect(yield* fs.readFileString(file)).toBe(native);
        assertNone(yield* writer.apply(file, [request], "check", backups));
        yield* writer.restore(path.join(backups, `${journal.id}.json`), backups);
        expect(yield* fs.readFileString(file)).toBe(before);
        yield* Effect.flip(writer.apply(file, [request], "check", backups));
      }
      const request = ModelsLocatorWrite.make({
        locator: { _tag: "toml-top-level-key", binding, render, key: "sandbox_mode" },
        expected: "",
        remove: true,
      });
      yield* Effect.flip(modelsWriteSpans('sandbox_mode="a"\nsandbox_mode="b"\n', request));
      yield* Effect.flip(
        modelsWriteSpans(
          "{}",
          ModelsLocatorWrite.make({
            locator: { _tag: "json-key", binding, render, pointer: ["sandbox_mode"], fallbacks: [] },
            expected: "",
            remove: true,
          })
        )
      );
    })
  );

  it.effect("keeps equal env, YAML plain, TOML literal, and shell quoted scalars without a write", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "equal-scalars-" });
      const cases: ReadonlyArray<readonly [string, string, Locator]> = [
        ["env", "MODEL=gpt-6.1-sol\n", { _tag: "env-key", binding, render, key: "MODEL" }],
        ["yaml", "model: gpt-6.1-sol\n", { _tag: "yaml-path", binding, render, path: ["model"] }],
        ["toml", "model = 'gpt-6.1-sol'\n", { _tag: "toml-top-level-key", binding, render, key: "model" }],
        ["sh", 'MODEL="gpt-6.1-sol"\n', { _tag: "shell-assign", binding, render, variable: "MODEL", within: O.none() }],
      ];
      const writer = yield* writerWithFs(fs);
      for (const [extension, text, locator] of cases) {
        const file = path.join(root, `config.${extension}`);
        yield* fs.writeFileString(file, text);
        assertNone(yield* writer.apply(file, [write(locator)], "check", path.join(root, "backups")));
        assertNone(yield* writer.apply(file, [write(locator)], "write", path.join(root, "backups")));
        expect(yield* fs.readFileString(file)).toBe(text);
      }
      expect(yield* fs.exists(path.join(root, "backups"))).toBe(false);
    })
  );

  it.effect("quotes the complete shell word and parses launchers before publication", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "shell-word-" });
      const file = path.join(root, "launcher");
      const request = write(
        {
          _tag: "shell-assign",
          binding: LocatorBinding.make({ ...binding, field: "model-effort-suffix" }),
          render,
          variable: "--model",
          within: O.none(),
        },
        "gpt-6.1-sol(medium)"
      );
      const writer = yield* writerWithFs(fs);
      for (const word of [
        "old",
        "'old'",
        '"old"',
        "gpt-6.1-sol(medium)",
        "'gpt-6.1-sol(medium)'",
        '"gpt-6.1-sol(medium)"',
      ]) {
        const text = `claude() { printf '%s\\n' "$#" "$2"; }\nclaude --model ${word} "$@"\n`;
        yield* fs.writeFileString(file, text);
        yield* writer.apply(file, [request], "write", path.join(root, "backups"));
        const rendered = yield* fs.readFileString(file);
        const output = yield* spawner.string(
          ChildProcess.make("zsh", ["-f"], { stdin: Stream.make(new TextEncoder().encode(rendered)) })
        );
        expect(output).toBe("2\ngpt-6.1-sol(medium)\n");
      }
      yield* fs.writeFileString(file, "claude --model old\nif\n");
      const error = yield* Effect.flip(writer.apply(file, [request], "write", path.join(root, "backups")));
      expect(error.message).toBe("Invalid shell target.");
    })
  );

  for (const phase of ["planned", "in-place", "post", "replace", "restore", "recovery"]) {
    const competitor = 'model = "competitor"\nnew_native_key = true\n';
    const newest = 'model = "newest"\nnewest_native_key = true\n';
    const expected = phase === "recovery" ? newest : competitor;
    const expectedMarkers = A.contains(["planned", "post"], phase) ? 0 : 1;
    const expectedRetained = phase === "planned" ? 0 : 1;
    it.effect(`preserves the competing writer and journal during ${phase}`, () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
        const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "native-race-" });
        const file = path.join(root, "config.toml");
        const backups = path.join(root, "backups");
        yield* fs.writeFileString(file, 'model = "old"\n', { mode: 0o644 });
        const writer = yield* writerWithFs(fs);
        const journal =
          phase === "restore" ? O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backups)) : undefined;
        let exchanges = 0;
        const replace = Effect.fnUntraced(function* (bytes: string) {
          const other = path.join(root, "competitor");
          yield* fs.writeFileString(other, bytes);
          yield* fs.rename(other, file);
        });
        const initial =
          phase === "in-place"
            ? fs.writeFileString(file, competitor)
            : A.contains(["replace", "restore", "recovery"], phase)
              ? replace(competitor)
              : Effect.void;
        const subsequent = phase === "recovery" ? replace(newest) : Effect.void;
        const post = phase === "post" ? fs.writeFileString(file, competitor) : Effect.void;
        const interferences = [Effect.void, initial, subsequent];
        const wrappedFs = FileSystem.FileSystem.of({
          ...fs,
          chmod: Effect.fn("ModelsApplyTest.chmod")((target, mode) =>
            fs
              .chmod(target, mode)
              .pipe(Effect.andThen(phase === "planned" && target.endsWith(".tmp") ? replace(competitor) : Effect.void))
          ),
        });
        const wrappedSpawner = ChildProcessSpawner.ChildProcessSpawner.of({
          ...spawner,
          exitCode: Effect.fnUntraced(function* (command) {
            const publication =
              command._tag === "StandardCommand" && command.command === "mv" && A.contains(command.args, file);
            if (publication) {
              exchanges += 1;
              yield* O.getOrElse(A.get(interferences, exchanges), () => Effect.void);
            }
            const code = yield* spawner.exitCode(command);
            if (publication && exchanges === 1) yield* post;
            return code;
          }),
        });
        const racer = yield* writerWithFs(wrappedFs, wrappedSpawner);
        const error = yield* Effect.flip(
          journal === undefined
            ? racer.apply(file, [topLevel], "write", backups)
            : racer.restore(path.join(backups, `${journal.id}.json`), backups)
        );
        expect(error._tag).toBe("ModelsLocatorError");
        const entries = yield* fs.readDirectory(backups);
        const journals = A.filter(entries, (entry) => entry.endsWith(".json"));
        expect(journals).toHaveLength(1);
        expect(error.message).toContain(journals[0]?.slice(0, -5));
        expect(
          A.filter(
            entries,
            (entry) => entry.startsWith(journals[0]?.slice(0, -5) ?? "missing") && entry.endsWith(".concurrent")
          )
        ).toHaveLength(expectedMarkers);
        expect(yield* fs.readFileString(file)).toBe(expected);
        expect(A.filter(yield* fs.readDirectory(root), (entry) => entry.endsWith(".preimage"))).toHaveLength(
          expectedRetained
        );
      })
    );
  }

  it.effect("fails closed and caches an unsupported exchange probe", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "unsupported-exchange-",
      });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(file, native);
      let probes = 0;
      const wrapped = ChildProcessSpawner.ChildProcessSpawner.of({
        ...spawner,
        exitCode: Effect.fn("ModelsApplyTest.exitCode")((command) => {
          if (command._tag === "StandardCommand" && command.command === "mv") {
            probes += 1;
            return Effect.succeed(ChildProcessSpawner.ExitCode(1));
          }
          return spawner.exitCode(command);
        }),
      });
      const writer = yield* writerWithFs(fs, wrapped);
      for (const _attempt of [0, 1]) {
        const error = yield* Effect.flip(writer.apply(file, [topLevel], "write", backups));
        expect(error._tag).toBe("ModelsLocatorError");
        expect(error.message).toContain("Atomic exchange unsupported");
        expect(error.message).toContain("Journal:");
        expect(yield* fs.readFileString(file)).toBe(native);
      }
      expect(probes).toBe(1);
    })
  );

  it.effect("preserves canonical model symlinks and refuses dangling links before backup", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "model-link-" });
      const target = path.join(root, "target.toml");
      const link = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(target, native, { mode: 0o644 });
      yield* fs.symlink(target, link);
      const writer = yield* writerWithFs(fs);
      const applied = yield* writer.apply(link, [topLevel], "write", backups);
      expect(O.isSome(applied)).toBe(true);
      const journal = O.getOrThrow(applied);
      expect(yield* fs.readLink(link)).toBe(target);
      expect(yield* fs.readFileString(target)).toContain('"gpt-6.1-sol"');
      expect(yield* fs.readFileString(journal.backup)).toBe(native);
      yield* writer.restore(path.join(backups, `${journal.id}.json`), backups);
      expect(yield* fs.readFileString(target)).toBe(native);
      expect(yield* fs.readLink(link)).toBe(target);
      const dangling = path.join(root, "dangling.toml");
      yield* fs.symlink(path.join(root, "absent"), dangling);
      yield* Effect.flip(writer.apply(dangling, [topLevel], "write", path.join(root, "absent-backups")));
      expect(yield* fs.exists(path.join(root, "absent-backups"))).toBe(false);
    })
  );

  it.effect("refuses adjacent shell operators and concatenated words before any backup", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "ambiguous-shell-" });
      const file = path.join(root, "launcher");
      const backups = path.join(root, "backups");
      const request = write({ _tag: "shell-assign", binding, render, variable: "--model", within: O.none() });
      const writer = yield* writerWithFs(fs);
      for (const text of [
        "claude --model old&&printf native\n",
        "claude --model old> /dev/null\n",
        "claude --model 'old'-suffix\n",
        "claude --model old||true\n",
        "claude --model old;printf native\n",
        "claude --model 'old\n",
        "claude --model old\\\n-suffix\n",
        "claude --model # native\n",
        "cat <<'EOF'\nclaude --model old\nEOF\n",
        "claude --model old # native\n",
        "claude --model old $(printf native)\n",
        "claude --model old `printf native`\n",
        "claude --model ${MODEL}\n",
        "claude --model old{,suffix}\n",
        "printf native \\\nclaude --model old\n",
      ]) {
        yield* fs.writeFileString(file, text);
        const error = yield* Effect.flip(writer.apply(file, [request], "write", backups));
        expect(error._tag).toBe("ModelsLocatorError");
        expect(yield* fs.readFileString(file)).toBe(text);
        expect(yield* fs.exists(backups)).toBe(false);
      }
      const comments = "# claude --model ignored\nclaude --model old\nprintf '%s' 'claude --model untouched'\n";
      const commentProjection = yield* modelsApplySpans(comments, yield* modelsWriteSpans(comments, request));
      expect(commentProjection).toBe(comments.replace("--model old", "--model gpt-6.1-sol"));
      for (const word of ["old", "'old'", '"old"', "o\\ld"]) {
        const text = `claude --model ${word} ; printf native\n`;
        const projected = yield* modelsApplySpans(text, yield* modelsWriteSpans(text, request));
        expect(projected).toBe("claude --model gpt-6.1-sol ; printf native\n");
        expect(yield* modelsApplySpans(projected, yield* modelsWriteSpans(projected, request))).toBe(projected);
      }
    })
  );

  it.effect("validates the transformed shell candidate before creating a backup", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "shell-validation-" });
      const file = path.join(root, "launcher");
      const backups = path.join(root, "backups");
      const text = "claude --model old\n";
      yield* fs.writeFileString(file, text);
      let parses = 0;
      const wrapped = ChildProcessSpawner.ChildProcessSpawner.of({
        ...spawner,
        exitCode: Effect.fn("ModelsApplyTest.exitCode")((command) => {
          if (command._tag === "StandardCommand" && command.command === "zsh") {
            parses += 1;
            if (parses === 2) return Effect.succeed(ChildProcessSpawner.ExitCode(1));
          }
          return spawner.exitCode(command);
        }),
      });
      const writer = yield* writerWithFs(fs, wrapped);
      const request = write({ _tag: "shell-assign", binding, render, variable: "--model", within: O.none() });
      const error = yield* Effect.flip(writer.apply(file, [request], "write", backups));
      expect(error.message).toBe("Invalid shell target.");
      expect(parses).toBe(2);
      expect(yield* fs.readFileString(file)).toBe(text);
      expect(yield* fs.exists(backups)).toBe(false);
    })
  );

  it.effect("rejects a replacement that changes its own re-resolved delimiter", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "unstable-span-" });
      const file = path.join(root, "example.txt");
      const text = 'model: "old"\n';
      yield* fs.writeFileString(file, text);
      const writer = yield* writerWithFs(fs);
      const request = write(
        { _tag: "line-value", binding, render, linePrefix: "model:", before: 'model: "', after: '"' },
        'new"tail'
      );
      const error = yield* Effect.flip(writer.apply(file, [request], "write", path.join(root, "backups")));
      expect(error.message).toBe("Owned projection is not stable after re-resolving its addresses.");
      expect(yield* fs.readFileString(file)).toBe(text);
      expect(yield* fs.exists(path.join(root, "backups"))).toBe(false);
    })
  );

  it.effect("refuses a tampered recovery backup without replacing the live file", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "backup-tamper-" });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(file, 'model = "old"\n');
      const writer = yield* writerWithFs(fs);
      const journal = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backups));
      const applied = yield* fs.readFileString(file);
      yield* fs.writeFileString(journal.backup, "tampered");
      const error = yield* Effect.flip(writer.restore(path.join(backups, `${journal.id}.json`), backups));
      expect(error.message).toBe("Recovery backup hash does not match.");
      expect(yield* fs.readFileString(file)).toBe(applied);
    })
  );

  it.effect("leaves dotted and table TOML keys outside scalar removal ownership", () =>
    Effect.gen(function* () {
      const request = ModelsLocatorWrite.make({
        ...topLevel,
        locator: { _tag: "toml-top-level-key", binding, render, key: "sandbox_mode" },
        remove: true,
      });
      for (const text of [
        'sandbox_mode.foo = "native"\n',
        '[sandbox_mode]\nfoo = "native"\n',
        '"sandbox_mode.foo" = "native"\n',
      ]) {
        const spans = yield* modelsWriteSpans(text, request);
        expect(spans).toHaveLength(0);
        expect(yield* modelsApplySpans(text, spans)).toBe(text);
      }
    })
  );

  it.effect("rejects absent and duplicate scalar addresses and overlapping ownership", () =>
    Effect.gen(function* () {
      yield* Effect.flip(modelsWriteSpans("unknown = true\n", topLevel));
      yield* Effect.flip(modelsWriteSpans('model = "a"\nmodel = "b"\n', topLevel));
      const spans = yield* modelsWriteSpans(native, topLevel);
      yield* Effect.flip(modelsApplySpans(native, [...spans, ...spans]));
    })
  );

  it.effect("rejects duplicate JSON keys and a top-level key hidden in a commented native table", () =>
    Effect.gen(function* () {
      const json = write({ _tag: "json-key", binding, render, pointer: ["model"], fallbacks: [] });
      yield* Effect.flip(modelsWriteSpans('{"model":"one","model":"two"}', json));
      yield* Effect.flip(modelsWriteSpans('[native] # retained\nmodel = "native-value"\n', topLevel));
    })
  );

  it.effect("preserves entity spelling outside an XML-embedded JSON pointer", () =>
    Effect.gen(function* () {
      const content =
        '<root><option name="options" value="[{&quot;model&quot;:&quot;old&quot;,&quot;native&quot;:&quot;&apos;&gt;&amp;&quot;}]"/></root>';
      const request = write({
        _tag: "xml-escaped-json-attribute",
        binding,
        render,
        elementSelector: 'option[name="options"]',
        attribute: "value",
        jsonPointer: ["0", "model"],
      });
      expect(yield* modelsApplySpans(content, yield* modelsWriteSpans(content, request))).toBe(
        content.replace("old", "gpt-6.1-sol")
      );
    })
  );

  it.effect("keeps native parser input out of validation errors", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "private-parser-" });
      const file = path.join(root, "config.json");
      yield* fs.writeFileString(file, '{"model":"old", "unownedCredential":"__SYNTHETIC_PRIVATE__", malformed');
      const request = write({ _tag: "json-key", binding, render, pointer: ["model"], fallbacks: [] });
      const writer = yield* writerWithFs(fs);
      const error = yield* Effect.flip(writer.apply(file, [request], "write", path.join(root, "backups")));
      expect(error.message).toBe("Invalid JSON target.");
      expect(error.cause).toBeUndefined();
      expect(yield* fs.exists(path.join(root, "backups"))).toBe(false);
    })
  );

  it.effect("refuses invalid UTF-8 without changing or backing up normalized bytes", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "native-bytes-" });
      const file = path.join(root, "config.toml");
      const bytes = new Uint8Array([0xff, 0xfe, 0x23]);
      yield* fs.writeFile(file, bytes);
      const writer = yield* writerWithFs(fs);
      yield* Effect.flip(writer.apply(file, [topLevel], "write", path.join(root, "backups")));
      expect(A.fromIterable(yield* fs.readFile(file))).toEqual(A.fromIterable(bytes));
      expect(yield* fs.exists(path.join(root, "backups"))).toBe(false);
    })
  );
});
