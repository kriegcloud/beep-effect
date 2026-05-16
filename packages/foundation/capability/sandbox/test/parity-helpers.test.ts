import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
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

const PlatformLayer = Layer.mergeAll(NodeFileSystem.layer, NodePath.layer);

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
    it("returns process cwd for undefined and relative current directory inputs", async () => {
      await expect(Effect.runPromise(resolveCwd(undefined).pipe(Effect.provide(PlatformLayer)))).resolves.toBe(
        resolve(process.cwd())
      );
      await expect(Effect.runPromise(resolveCwd(".").pipe(Effect.provide(PlatformLayer)))).resolves.toBe(
        resolve(process.cwd())
      );
    });

    it("accepts absolute directories and rejects files", async () => {
      const dir = await mkdtemp(join(tmpdir(), "beep-sandbox-cwd-"));
      const file = join(dir, "file.txt");
      await writeFile(file, "hello");

      try {
        await expect(Effect.runPromise(resolveCwd(dir).pipe(Effect.provide(PlatformLayer)))).resolves.toBe(dir);
        const error = await Effect.runPromise(resolveCwd(file).pipe(Effect.flip, Effect.provide(PlatformLayer)));

        expect(error).toBeInstanceOf(CwdError);
        expect(error.cwd).toBe(file);
      } finally {
        await rm(dir, { force: true, recursive: true });
      }
    });
  });
});
