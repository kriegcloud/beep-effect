import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, it } from "@effect/vitest";

const settingsPath = fileURLToPath(new URL("../../../../../.claude/settings.json", import.meta.url));

type HookSettings = {
  readonly hooks: Record<string, ReadonlyArray<{ readonly hooks: ReadonlyArray<{ readonly command: string }> }>>;
};

const commands = Object.values((JSON.parse(readFileSync(settingsPath, "utf8")) as HookSettings).hooks).flatMap(
  (groups) => groups.flatMap((group) => group.hooks.map((hook) => hook.command))
);

it("keeps executable hooks in the session launch project when CWD is attacker controlled", () => {
  const guarded = commands.filter(
    (command) => command.includes(".claude/hooks/") || command.includes("graft-hooks.cjs")
  );
  expect(guarded.length).toBeGreaterThan(0);
  for (const command of guarded) {
    expect(command).toContain('d="${CLAUDE_PROJECT_DIR:-}"; [ -n "$d" ] && [ -d "$d/.claude/hooks" ] || exit 0;');
    expect(command).not.toContain("git rev-parse --show-toplevel");
  }

  const root = mkdtempSync(join(tmpdir(), "beep-hook-root-test-"));
  try {
    const trusted = join(root, "trusted");
    const attacker = join(root, "attacker");
    for (const dir of [trusted, attacker]) {
      mkdirSync(join(dir, ".claude", "hooks"), { recursive: true });
      mkdirSync(join(dir, ".claude", "helpers"), { recursive: true });
    }
    for (const [dir, label] of [
      [trusted, "trusted"],
      [attacker, "attacker"],
    ]) {
      const shell = join(dir, ".claude", "hooks", "hook-pulse.sh");
      writeFileSync(shell, `#!/bin/sh\necho ${label}-shell\n`);
      chmodSync(shell, 0o755);
      writeFileSync(join(dir, ".claude", "helpers", "graft-hooks.cjs"), `console.log("${label}-node");\n`);
    }
    const shellCommand = guarded.find((command) => command.includes("hook-pulse.sh"));
    const nodeCommand = guarded.find((command) => command.includes("graft-hooks.cjs"));
    expect(shellCommand).toBeDefined();
    expect(nodeCommand).toBeDefined();
    for (const [command, expected] of [
      [shellCommand, "trusted-shell\n"],
      [nodeCommand, "trusted-node\n"],
    ]) {
      const result = Bun.spawnSync(["sh", "-c", command ?? ""], {
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
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
