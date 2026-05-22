import { type BindMountSandboxHandle, ExecResult, SessionCaptureError, sandboxSessionStore } from "@beep/sandbox";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";

describe("@beep/sandbox security boundaries", () => {
  it.effect(
    "rejects unsafe sandbox session ids before building shell commands",
    Effect.fnUntraced(function* () {
      const commands: Array<string> = [];
      const handle: BindMountSandboxHandle = {
        close: Effect.void,
        copyFileIn: () => Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command) => {
          A.appendInPlace(commands, command);

          return Effect.succeed(new ExecResult({ exitCode: 0, stderr: "", stdout: "" }));
        },
        worktreePath: "/repo",
      };
      const store = sandboxSessionStore("/repo", handle);
      const error = yield* store.write("abc;touch-pwned", "hello").pipe(Effect.flip);

      expect(error).toBeInstanceOf(SessionCaptureError);
      expect(commands).toEqual([]);
    })
  );

  it.effect(
    "shell-quotes sandbox session paths",
    Effect.fnUntraced(function* () {
      const commands: Array<string> = [];
      const handle: BindMountSandboxHandle = {
        close: Effect.void,
        copyFileIn: () => Effect.void,
        copyFileOut: () => Effect.void,
        exec: (command) => {
          A.appendInPlace(commands, command);

          return Effect.succeed(new ExecResult({ exitCode: 0, stderr: "", stdout: "" }));
        },
        worktreePath: "/repo/with ' quote",
      };
      const store = sandboxSessionStore("/repo/with ' quote", handle);

      yield* store.write("session_123", "hello");

      expect(commands).toEqual([
        "mkdir -p '/repo/with '\\'' quote/.claude/projects' && cat > '/repo/with '\\'' quote/.claude/projects/session_123.jsonl'",
      ]);
    })
  );
});
