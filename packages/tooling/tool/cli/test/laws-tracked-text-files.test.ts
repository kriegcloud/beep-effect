import { lineStartOffsets, locateIndex, messageGitErrorAdapter } from "@beep/repo-cli/test/Laws";
import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("Laws/internal/TrackedTextFiles", () => {
  it.effect("locates an index by one-based line and column", () =>
    Effect.sync(() => {
      expect(lineStartOffsets("ab\ncd\n")).toEqual([0, 3, 6]);
      expect(locateIndex(lineStartOffsets("ab\ncd"), 4)).toEqual({ line: 2, column: 2 });
      expect(locateIndex([], 5)).toEqual({ line: 1, column: 6 });
    })
  );

  it.effect("builds the git error messages for spawn failures and non-zero exits", () =>
    Effect.sync(() => {
      const adapter = messageGitErrorAdapter((message: string) => message);
      expect(adapter.onSpawnFailure("git ls-files")(new Error("spawn failed"))).toBe("Failed to spawn git ls-files.");
      expect(adapter.onNonZeroExit({ commandLine: "git ls-files", exitCode: 128, output: "" })).toBe(
        "git ls-files failed with exit code 128."
      );
    })
  );
});
