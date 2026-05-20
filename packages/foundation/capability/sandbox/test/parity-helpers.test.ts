import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import {
  buildRecoveryMessage,
  CwdError,
  makeTerminalCleanupHandler,
  RecoveryInput,
  resolveCwd,
  SHOW_CURSOR,
  TextDeltaBuffer,
  TextDeltaBufferOptions,
} from "@beep/sandbox";
import { A } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { Effect, Layer } from "effect";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);
const joinPath = (base: string, ...segments: ReadonlyArray<string>): string =>
  [base.replace(/\/+$/u, ""), ...segments.map((segment) => segment.replace(/^\/+|\/+$/gu, ""))]
    .filter((segment) => segment.length > 0)
    .join("/");
const runFileCommand = (command: string, args: ReadonlyArray<string>) =>
  Effect.sync(() => Bun.spawnSync([command, ...args], { stderr: "ignore", stdout: "ignore" })).pipe(
    Effect.flatMap((result) =>
      result.exitCode === 0
        ? Effect.void
        : Effect.die(new Error(`${command} ${args.join(" ")} failed with exit code ${result.exitCode}`))
    )
  );
const makeTempDirectory = Effect.fn("SandboxParity.makeTempDirectory")(function* (prefix: string) {
  const suffix = randomUUID();
  const dir = joinPath(tmpdir(), `${prefix}${suffix}`);
  yield* runFileCommand("mkdir", ["-p", dir]);
  return dir;
});
const writeText = (path: string, content: string) => Effect.promise(() => Bun.write(path, content)).pipe(Effect.asVoid);
const removePath = (path: string) => runFileCommand("rm", ["-rf", path]);

describe("@beep/sandbox parity helpers", () => {
  describe("TextDeltaBuffer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("flushes at sentence, newline, length, explicit, and debounce boundaries", () => {
      const flushed: Array<string> = [];
      const buffer = new TextDeltaBuffer(
        (text) => A.appendInPlace(flushed, text),
        new TextDeltaBufferOptions({ debounceMs: 50, lengthThreshold: 8 })
      );

      buffer.write("Hello. ");
      buffer.write("line\n");
      buffer.write("12345678");
      buffer.write("tail");
      buffer.flush();
      buffer.write("later");
      vi.advanceTimersByTime(50);

      expect(flushed).toEqual(["Hello. ", "line\n", "12345678", "tail", "later"]);
    });

    it("clears the debounce timer on dispose", () => {
      const flushed: Array<string> = [];
      const buffer = new TextDeltaBuffer((text) => A.appendInPlace(flushed, text));

      buffer.write("leftover");
      buffer.dispose();
      vi.advanceTimersByTime(100);

      expect(flushed).toEqual(["leftover"]);
    });
  });

  describe("buildRecoveryMessage", () => {
    const patchDir = ".sandcastle/patches/20260324-153000";

    it("builds git am recovery with remaining diff and untracked commands", () => {
      const message = buildRecoveryMessage(
        new RecoveryInput({
          failedStep: "commits",
          hasCommits: true,
          hasDiff: true,
          hasUntracked: true,
          patchDir,
        })
      );

      expect(message).toContain("Patch application failed at step 1 (committed changes).");
      expect(message).toContain("git am --continue");
      expect(message).toContain(`git apply ${patchDir}/changes.patch && \\`);
      expect(message).toContain(`cp -r ${patchDir}/untracked/* .`);
    });

    it("builds branch worktree recovery with worktree-relative patch paths", () => {
      const message = buildRecoveryMessage(
        new RecoveryInput({
          branch: "feature/test",
          failedStep: "diff",
          hasCommits: true,
          hasDiff: true,
          hasUntracked: true,
          patchDir,
        })
      );

      expect(message).toContain("git worktree add .sandcastle/worktree feature/test");
      expect(message).toContain(`git apply ../../${patchDir}/changes.patch && \\`);
      expect(message).toContain(`cp -r ../../${patchDir}/untracked/* .`);
      expect(message).not.toContain("git am --continue");
    });
  });

  describe("terminal cleanup", () => {
    it("restores raw mode and cursor visibility without throwing on raw-mode failures", () => {
      const setRawMode = vi.fn(() => {
        throw new Error("closed");
      });
      const write = vi.fn(() => true);
      const handler = makeTerminalCleanupHandler({ isTTY: true, setRawMode }, { write });

      expect(() => handler()).not.toThrow();
      expect(setRawMode).toHaveBeenCalledWith(false);
      expect(write).toHaveBeenCalledWith(SHOW_CURSOR);
    });

    it("skips raw-mode restoration for non-TTY input", () => {
      const setRawMode = vi.fn();
      const write = vi.fn(() => true);
      const handler = makeTerminalCleanupHandler({ isTTY: false, setRawMode }, { write });

      handler();

      expect(setRawMode).not.toHaveBeenCalled();
      expect(write).toHaveBeenCalledWith(SHOW_CURSOR);
    });
  });

  describe("resolveCwd", () => {
    it("returns process cwd for undefined and relative current directory inputs", () =>
      Effect.runPromise(
        Effect.gen(function* () {
          expect(yield* resolveCwd(undefined).pipe(provideScopedLayer(PlatformLayer))).toBe(process.cwd());
          expect(yield* resolveCwd(".").pipe(provideScopedLayer(PlatformLayer))).toBe(process.cwd());
        })
      ));

    it("accepts absolute directories and rejects files", () =>
      Effect.runPromise(
        Effect.gen(function* () {
          const dir = yield* makeTempDirectory("beep-sandbox-cwd-");
          const file = joinPath(dir, "file.txt");
          yield* writeText(file, "hello");

          try {
            expect(yield* resolveCwd(dir).pipe(provideScopedLayer(PlatformLayer))).toBe(dir);
            const error = yield* resolveCwd(file).pipe(Effect.flip, provideScopedLayer(PlatformLayer));

            expect(error).toBeInstanceOf(CwdError);
            expect(error.cwd).toBe(file);
          } finally {
            yield* removePath(dir);
          }
        }) as Effect.Effect<void, unknown>
      ));
  });
});
