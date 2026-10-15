import { ModelsApply, ModelsApplyLive } from "@beep/repo-cli/commands/Models/Models.apply.service";
import {
  BindingFilter,
  LocatorBinding,
  ModelsApplyJournal,
  ModelsLocatorWrite,
} from "@beep/repo-cli/commands/Models/Models.manifest.schemas";
import { modelsApplySpans, modelsWriteSpans } from "@beep/repo-cli/commands/Models/Models.spans";
import { NodeServices } from "@effect/platform-node";
import { expect, layer } from "@effect/vitest";
import { assertNone, assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as ChildProcessSpawner from "effect/process/ChildProcessSpawner";
import * as S from "effect/Schema";
import type { Locator, LocatorRender } from "@beep/repo-cli/commands/Models/Models.manifest.schemas";

const binding: LocatorBinding = LocatorBinding.make({
  role: "codex.heavy",
  surface: "codex-cli",
  field: "model",
});
const encodeRecoveryJournal = S.encodeEffect(S.fromJsonString(ModelsApplyJournal));
const render: LocatorRender = { _tag: "verbatim" };
const write = (locator: Locator, expected = "gpt-6.1-sol") => ModelsLocatorWrite.make({ locator, expected });
const topLevel = write({
  _tag: "toml-top-level-key",
  binding,
  render,
  key: "model",
});
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

const restoreLinkRace = Effect.fnUntraced(function* (dangling: boolean) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const spawner = yield* ChildProcessSpawner.ChildProcessSpawner;
  const root = yield* fs.makeTempDirectoryScoped({
    directory: path.resolve(".beep"),
    prefix: "restore-link-race-",
  });
  const file = path.join(root, "config.toml");
  const relocated = path.join(root, "relocated.toml");
  const backups = path.join(root, "backups");
  yield* fs.writeFileString(file, native);
  const writer = yield* writerWithFs(fs);
  const journal = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backups));
  const applied = yield* fs.readFileString(file);
  let exchanges = 0;
  const wrapped = ChildProcessSpawner.ChildProcessSpawner.of({
    ...spawner,
    exitCode: Effect.fn("ModelsApplyTest.restoreLinkExchange")(function* (command) {
      if (command._tag === "StandardCommand" && command.command === "mv") {
        exchanges += 1;
        if (exchanges === 2) {
          yield* fs.rename(file, relocated);
          yield* fs.symlink(dangling ? path.join(root, "absent.toml") : relocated, file);
        }
      }
      return yield* spawner.exitCode(command);
    }),
  });
  const restoring = yield* writerWithFs(fs, wrapped);
  const error = yield* Effect.flip(restoring.restore(path.join(backups, `${journal.id}.json`), backups));
  expect(error._tag).toBe("ModelsLocatorError");
  expect(error.message).toContain(`Journal: ${journal.id}`);
  expect(yield* fs.readLink(file)).toBe(dangling ? path.join(root, "absent.toml") : relocated);
  if (!dangling) expect(yield* fs.readFileString(file)).toBe(applied);
  expect(yield* fs.readFileString(relocated)).toBe(applied);
  expect(exchanges).toBe(3);
});

layer(NodeServices.layer, { timeout: "30 seconds" })((it) => {
  it.effect("preserves every native byte outside a top-level scalar with 494 projects and 311 hook states", () =>
    Effect.gen(function* () {
      const spans = yield* modelsWriteSpans(native, topLevel);
      expect(spans).toHaveLength(1);
      expect(yield* modelsApplySpans(native, spans)).toBe(native.replace('"old"', '"gpt-6.1-sol"'));
    })
  );

  it.effect("resolves every supported grammar without changing unowned text", () =>
    Effect.gen(function* () {
      const cases: ReadonlyArray<readonly [string, Locator, string]> = [
        [
          '[models]\ndefault = "old" # tail\n[native]\nkeep = true\n',
          {
            _tag: "toml-table-key",
            binding,
            render,
            table: "models",
            key: "default",
          },
          '[models]\ndefault = "gpt-6.1-sol" # tail\n[native]\nkeep = true\n',
        ],
        [
          '{"model":"old", "unknown":{"keep":true}}',
          {
            _tag: "json-key",
            binding,
            render,
            pointer: ["model"],
            fallbacks: [],
          },
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
          {
            _tag: "line-value",
            binding,
            render,
            linePrefix: " *",
            before: 'model: "',
            after: '"',
          },
          ' * model: "gpt-6.1-sol"\nunowned model: "old"\n',
        ],
        [
          '<root><option name="model" value="old" keep="yes"/></root>',
          {
            _tag: "xml-attribute",
            binding,
            render,
            elementSelector: 'option[name="model"]',
            attribute: "value",
          },
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "models-fixture-",
      });
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "remove-fixture-",
      });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      for (const key of ["sandbox_mode", '"sandbox_mode"', "'sandbox_mode'"]) {
        const before = `${key} = "danger-full-access" # legacy\r\n` + native;
        yield* fs.writeFileString(file, before);
        const request = ModelsLocatorWrite.make({
          locator: {
            _tag: "toml-top-level-key",
            binding,
            render,
            key: "sandbox_mode",
          },
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
        locator: {
          _tag: "toml-top-level-key",
          binding,
          render,
          key: "sandbox_mode",
        },
        expected: "",
        remove: true,
      });
      yield* Effect.flip(modelsWriteSpans('sandbox_mode="a"\nsandbox_mode="b"\n', request));
      yield* Effect.flip(
        modelsWriteSpans(
          "{}",
          ModelsLocatorWrite.make({
            locator: {
              _tag: "json-key",
              binding,
              render,
              pointer: ["sandbox_mode"],
              fallbacks: [],
            },
            expected: "",
            remove: true,
          })
        )
      );
    })
  );

  it.effect("keeps equal env, YAML plain, TOML literal, scalars without a write", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "equal-scalars-",
      });
      const cases: ReadonlyArray<readonly [string, string, Locator]> = [
        ["env", "MODEL=gpt-6.1-sol\n", { _tag: "env-key", binding, render, key: "MODEL" }],
        ["yaml", "model: gpt-6.1-sol\n", { _tag: "yaml-path", binding, render, path: ["model"] }],
        ["toml", "model = 'gpt-6.1-sol'\n", { _tag: "toml-top-level-key", binding, render, key: "model" }],
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
        const root = yield* fs.makeTempDirectoryScoped({
          directory: path.resolve(".beep"),
          prefix: "native-race-",
        });
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
        expect(A.fromIterable(error.message.matchAll(/Journal:/g))).toHaveLength(1);
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "model-link-",
      });
      const target = path.join(root, "target.toml");
      const link = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(target, native, { mode: 0o644 });
      yield* fs.symlink(target, link);
      const writer = yield* writerWithFs(fs);
      const applied = yield* writer.apply(link, [topLevel], "write", backups);
      applied.pipe(O.isSome, assertTrue);
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

  it.effect("checks operator-adjacent shell assignments and refuses unsupported forms without backups", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "shell-drift-",
      });
      const file = path.join(root, "launcher");
      const backups = path.join(root, "backups");
      const writer = yield* writerWithFs(fs);
      const assignment = write(
        {
          _tag: "shell-assign",
          binding,
          render,
          variable: "ANTHROPIC_DEFAULT_HAIKU_MODEL",
          within: O.none(),
        },
        "gpt-6-luna"
      );
      for (const operator of [";", "&&", "||", "|", "&", "(", "\n"]) {
        const text = `:${operator}ANTHROPIC_DEFAULT_HAIKU_MODEL=wrong claude\nANTHROPIC_DEFAULT_HAIKU_MODEL=gpt-6-luna claude\n`;
        yield* fs.writeFileString(file, text);
        const error = yield* Effect.flip(writer.apply(file, [assignment], "check", backups));
        expect(error._tag).toBe("ModelsLocatorError");
        expect(error.message).toContain("drift detected");
        expect(yield* fs.readFileString(file)).toBe(text);
      }
      const flag = write(
        {
          _tag: "shell-assign",
          binding,
          render,
          variable: "--model",
          within: O.none(),
        },
        "old"
      );
      for (const text of [
        "claude x\\ --model old\n",
        "cat <<'EOF'\nclaude --model old\nEOF\n",
        'claude --model old "$@"\n',
        "claude --model 'old\n",
        "printf native \\\nclaude --model old\n",
      ]) {
        yield* fs.writeFileString(file, text);
        const error = yield* Effect.flip(writer.apply(file, [flag], "check", backups));
        expect(error.message).toContain("Unsupported shell form");
        expect(yield* fs.readFileString(file)).toBe(text);
      }
      yield* fs.writeFileString(file, 'claude --model "old" # native\n');
      assertNone(yield* writer.apply(file, [flag], "check", backups));
      expect(yield* fs.exists(backups)).toBe(false);
    })
  );

  it.effect("refuses owned YAML anchors, aliases and anchored ancestors before backup", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "yaml-ownership-",
      });
      const file = path.join(root, "config.yaml");
      const backups = path.join(root, "backups");
      const writer = yield* writerWithFs(fs);
      const owned = write({
        _tag: "yaml-path",
        binding,
        render,
        path: ["model"],
      });
      for (const text of [
        "model: &shared old\nnative_model: *shared\n",
        "default: &shared old\nmodel: *shared\n",
        "model: &unused old\n",
      ]) {
        yield* fs.writeFileString(file, text);
        const error = yield* Effect.flip(writer.apply(file, [owned], "write", backups));
        expect(error._tag).toBe("ModelsLocatorError");
        expect(error.message).toContain("without anchors or aliases");
        expect(yield* fs.readFileString(file)).toBe(text);
        expect(yield* fs.exists(backups)).toBe(false);
      }
      const nested = "models: &shared\n  model: old\nnative: *shared\n";
      yield* fs.writeFileString(file, nested);
      yield* Effect.flip(
        writer.apply(
          file,
          [
            write({
              _tag: "yaml-path",
              binding,
              render,
              path: ["models", "model"],
            }),
          ],
          "write",
          backups
        )
      );
      expect(yield* fs.readFileString(file)).toBe(nested);
      expect(yield* fs.exists(backups)).toBe(false);
      // Simulate another span owner mutating an alias source. Resolved YAML
      // equality must independently catch the non-owned semantic change.
      const merged = "model: old\ndefaults: &shared {native: old}\nconsumer: {<<: *shared}\n";
      yield* fs.writeFileString(file, merged);
      const injected = write({
        _tag: "line-value",
        binding,
        render,
        linePrefix: "defaults:",
        before: "native: ",
        after: "}",
      });
      const error = yield* Effect.flip(writer.apply(file, [owned, injected], "write", backups));
      expect(error.message).toBe("Non-owned native keys changed.");
      expect(yield* fs.readFileString(file)).toBe(merged);
      expect(yield* fs.exists(backups)).toBe(false);
      yield* fs.writeFileString(file, "model: old\nnative: retained\n");
      const applied = yield* writer.apply(file, [owned], "write", backups);
      applied.pipe(O.isSome, assertTrue);
      expect(yield* fs.readFileString(file)).toBe('model: "gpt-6.1-sol"\nnative: retained\n');
    })
  );

  it.effect("refuses every shell write before backup, including escaped separators and earlier panel inputs", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "check-only-shell-",
      });
      const file = path.join(root, "launcher");
      const backups = path.join(root, "backups");
      const request = write({
        _tag: "shell-assign",
        binding,
        render,
        variable: "--model",
        within: O.none(),
      });
      const writer = yield* writerWithFs(fs);
      for (const text of [
        "claude x\\ --model old\n",
        "x\\ MODEL=old\n",
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
        "MODEL=old\nfoo \\\n  bar\nMODEL=old\n",
        "claude --model old\nif\n",
        ...A.map(
          ["old", "'old'", '"old"', "o\\ld", "gpt-6.1-sol(medium)", "'gpt-6.1-sol(medium)'", '"gpt-6.1-sol(medium)"'],
          (word) => `claude --model ${word} "$@"\n`
        ),
        'MODEL="gpt-6.1-sol"\n',
      ]) {
        yield* fs.writeFileString(file, text);
        for (const variable of ["--model", "MODEL"]) {
          const owned = write({
            ...request.locator,
            _tag: "shell-assign",
            binding,
            render,
            variable,
            within: O.none(),
          });
          const error = yield* Effect.flip(writer.apply(file, [owned], "write", backups));
          expect(error._tag).toBe("ModelsLocatorError");
          expect(error.message).toBe("Shell targets are check-only; edit by hand.");
          expect(yield* fs.readFileString(file)).toBe(text);
          expect(yield* fs.exists(backups)).toBe(false);
        }
      }
      const text = "claude --model old\n";
      yield* fs.writeFileString(file, text);
      assertNone(yield* writer.apply(file, [request], "dry-run", backups));
      yield* Effect.flip(writer.apply(file, [request], "check", backups));
      const current = write(
        {
          ...request.locator,
          _tag: "shell-assign",
          binding,
          render,
          variable: "--model",
          within: O.none(),
        },
        "old"
      );
      assertNone(yield* writer.apply(file, [current], "check", backups));
      yield* Effect.flip(modelsWriteSpans(text, request));
      expect(yield* fs.exists(backups)).toBe(false);
    })
  );

  for (const phase of ["introduced-link", "moved-target", "parent-link", "replaced-link", "retargeted-link"]) {
    it.effect(`refuses restore before staging when destination identity changes: ${phase}`, () =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const path = yield* Path.Path;
        const root = yield* fs.makeTempDirectoryScoped({
          directory: path.resolve(".beep"),
          prefix: "restore-identity-",
        });
        const directory = path.join(root, "native");
        yield* fs.makeDirectory(directory);
        const file = path.join(directory, "config.toml");
        const link = path.join(root, "config-link.toml");
        const relocated = path.join(directory, "relocated.toml");
        const backups = path.join(root, "backups");
        yield* fs.writeFileString(file, native);
        const linked = phase === "replaced-link" || phase === "retargeted-link";
        if (linked) yield* fs.symlink(file, link);
        const writer = yield* writerWithFs(fs);
        const journal = O.getOrThrow(yield* writer.apply(linked ? link : file, [topLevel], "write", backups));
        const applied = yield* fs.readFileString(file);
        yield* Match.value(phase).pipe(
          Match.when("parent-link", () => {
            const moved = path.join(root, "moved");
            return fs.rename(directory, moved).pipe(Effect.andThen(fs.symlink(moved, directory)));
          }),
          Match.when("replaced-link", () => fs.remove(link).pipe(Effect.andThen(fs.writeFileString(link, applied)))),
          Match.when("retargeted-link", () =>
            fs
              .writeFileString(relocated, applied)
              .pipe(Effect.andThen(fs.remove(link)), Effect.andThen(fs.symlink(relocated, link)))
          ),
          Match.when("introduced-link", () =>
            fs.rename(file, relocated).pipe(Effect.andThen(fs.symlink(relocated, file)))
          ),
          Match.orElse(() => fs.rename(file, relocated))
        );
        const error = yield* Effect.flip(writer.restore(path.join(backups, `${journal.id}.json`), backups));
        expect(error._tag).toBe("ModelsLocatorError");
        expect(error.message).toContain(`Journal: ${journal.id}`);
        expect(yield* fs.readDirectory(backups)).toHaveLength(2);
        if (phase !== "moved-target") expect(yield* fs.readFileString(file)).toBe(applied);
        if (phase === "introduced-link") expect(yield* fs.readLink(file)).toBe(relocated);
        if (A.contains(["introduced-link", "moved-target", "retargeted-link"], phase))
          expect(yield* fs.readFileString(relocated)).toBe(applied);
        expect(
          A.filter(yield* fs.readDirectory(directory), (entry) => entry.endsWith(".tmp") || entry.endsWith(".preimage"))
        ).toHaveLength(0);
      })
    );
  }

  it.effect("returns a live symlink introduced inside the restore exchange window", () => restoreLinkRace(false));
  it.effect("returns a dangling symlink introduced inside the restore exchange window", () => restoreLinkRace(true));

  it.effect("refuses shell and legacy recovery journals before staging", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "shell-restore-",
      });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(file, native);
      const writer = yield* writerWithFs(fs);
      const journal = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backups));
      const journalFile = path.join(backups, `${journal.id}.json`);
      const applied = yield* fs.readFileString(file);
      const shell = write({
        _tag: "shell-assign",
        binding,
        render,
        variable: "MODEL",
        within: O.none(),
      });
      for (const writes of [undefined, [shell]]) {
        const { writes: _owned, ...legacy } = journal;
        yield* fs.writeFileString(
          journalFile,
          yield* encodeRecoveryJournal(ModelsApplyJournal.make({ ...legacy, writes: O.fromUndefinedOr(writes) }))
        );
        const error = yield* Effect.flip(writer.restore(journalFile, backups));
        expect(error.message.toLowerCase()).toContain("shell targets are check-only");
        expect(error.message).toContain(`Journal: ${journal.id}`);
        expect(yield* fs.readFileString(file)).toBe(applied);
        expect(yield* fs.readDirectory(backups)).toHaveLength(2);
      }
    })
  );

  it.effect("removes the retained hard link when its stat fails before staging", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({ directory: path.resolve(".beep"), prefix: "preimage-stat-" });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(file, native);
      const wrapped = FileSystem.FileSystem.of({
        ...fs,
        stat: Effect.fn("ModelsApplyTest.stat")((target) =>
          fs.stat(target.endsWith(".preimage") ? path.join(root, "missing") : target)
        ),
      });
      const writer = yield* writerWithFs(wrapped);
      const error = yield* Effect.flip(writer.apply(file, [topLevel], "write", backups));
      expect(error._tag).toBe("ModelsLocatorError");
      expect(error.message).toContain("Journal:");
      expect(yield* fs.readFileString(file)).toBe(native);
      expect(
        A.filter(yield* fs.readDirectory(root), (entry) => entry.endsWith(".preimage") || entry.endsWith(".tmp"))
      ).toHaveLength(0);
    })
  );

  it.effect("rejects a replacement that changes its own re-resolved delimiter", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "unstable-span-",
      });
      const file = path.join(root, "example.txt");
      const text = 'model: "old"\n';
      yield* fs.writeFileString(file, text);
      const writer = yield* writerWithFs(fs);
      const request = write(
        {
          _tag: "line-value",
          binding,
          render,
          linePrefix: "model:",
          before: 'model: "',
          after: '"',
        },
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "backup-tamper-",
      });
      const file = path.join(root, "config.toml");
      const backups = path.join(root, "backups");
      yield* fs.writeFileString(file, 'model = "old"\n');
      const writer = yield* writerWithFs(fs);
      const journal = O.getOrThrow(yield* writer.apply(file, [topLevel], "write", backups));
      const applied = yield* fs.readFileString(file);
      yield* fs.writeFileString(journal.backup, "tampered");
      const error = yield* Effect.flip(writer.restore(path.join(backups, `${journal.id}.json`), backups));
      expect(error.message).toBe(`Recovery backup hash does not match. Journal: ${journal.id}`);
      expect(yield* fs.readFileString(file)).toBe(applied);
    })
  );

  it.effect("leaves dotted and table TOML keys outside scalar removal ownership", () =>
    Effect.gen(function* () {
      const request = ModelsLocatorWrite.make({
        ...topLevel,
        locator: {
          _tag: "toml-top-level-key",
          binding,
          render,
          key: "sandbox_mode",
        },
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
      const json = write({
        _tag: "json-key",
        binding,
        render,
        pointer: ["model"],
        fallbacks: [],
      });
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "private-parser-",
      });
      const file = path.join(root, "config.json");
      yield* fs.writeFileString(file, '{"model":"old", "unownedCredential":"__SYNTHETIC_PRIVATE__", malformed');
      const request = write({
        _tag: "json-key",
        binding,
        render,
        pointer: ["model"],
        fallbacks: [],
      });
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
      const root = yield* fs.makeTempDirectoryScoped({
        directory: path.resolve(".beep"),
        prefix: "native-bytes-",
      });
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
