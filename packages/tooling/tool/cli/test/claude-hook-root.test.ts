import { fileURLToPath } from "node:url";
import { NodeServices } from "@effect/platform-node";
import { expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as S from "effect/Schema";

const settingsPath = fileURLToPath(new URL("../../../../../.claude/settings.json", import.meta.url));

const HookSettings = S.Struct({
  hooks: S.Record(S.String, S.Array(S.Struct({ hooks: S.Array(S.Struct({ command: S.String })) }))),
});
const HookSettingsJson = S.fromJsonString(HookSettings);

it.layer(NodeServices.layer, { timeout: "30 seconds" })("hook launch project containment", (it) => {
  it.effect("keeps executable hooks in the session launch project when CWD is attacker controlled", () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      const settings = yield* S.decodeEffect(HookSettingsJson)(yield* fs.readFileString(settingsPath));
      const commands = Object.values(settings.hooks).flatMap((groups) =>
        groups.flatMap((group) => group.hooks.map((hook) => hook.command))
      );
      const guarded = commands.filter(
        (command) => command.includes(".claude/hooks/") || command.includes("graft-hooks.cjs")
      );
      expect(guarded.length).toBeGreaterThan(0);
      for (const command of guarded) {
        expect(command).toContain('d="${CLAUDE_PROJECT_DIR:-}"; [ -n "$d" ] && [ -d "$d/.claude/hooks" ] || exit 0;');
        expect(command).not.toContain("git rev-parse --show-toplevel");
      }

      const root = yield* fs.makeTempDirectoryScoped({ prefix: "beep-hook-root-test-" });
      const trusted = path.join(root, "trusted");
      const attacker = path.join(root, "attacker");
      for (const dir of [trusted, attacker]) {
        yield* fs.makeDirectory(path.join(dir, ".claude", "hooks"), { recursive: true });
        yield* fs.makeDirectory(path.join(dir, ".claude", "helpers"), { recursive: true });
      }
      const fixtureDirs: ReadonlyArray<readonly [string, string]> = [
        [trusted, "trusted"],
        [attacker, "attacker"],
      ];
      for (const [dir, label] of fixtureDirs) {
        const shell = path.join(dir, ".claude", "hooks", "hook-pulse.sh");
        yield* fs.writeFileString(shell, `#!/bin/sh\necho ${label}-shell\n`);
        yield* fs.chmod(shell, 0o755);
        yield* fs.writeFileString(
          path.join(dir, ".claude", "helpers", "graft-hooks.cjs"),
          `console.log("${label}-node");\n`
        );
      }
      const shellCommand = guarded.find((command) => command.includes("hook-pulse.sh")) ?? "";
      const nodeCommand = guarded.find((command) => command.includes("graft-hooks.cjs")) ?? "";
      expect(shellCommand).not.toBe("");
      expect(nodeCommand).not.toBe("");
      const commandCases: ReadonlyArray<readonly [string, string]> = [
        [shellCommand, "trusted-shell\n"],
        [nodeCommand, "trusted-node\n"],
      ];
      for (const [command, expected] of commandCases) {
        const result = Bun.spawnSync(["sh", "-c", command], {
          cwd: attacker,
          env: { ...process.env, CLAUDE_PROJECT_DIR: trusted },
          stdin: "ignore",
          stdout: "pipe",
          stderr: "pipe",
        });
        expect(result.exitCode).toBe(0);
        expect(result.stdout.toString()).toBe(expected);
        expect(result.stderr.toString()).toBe("");
      }
    })
  );
});
