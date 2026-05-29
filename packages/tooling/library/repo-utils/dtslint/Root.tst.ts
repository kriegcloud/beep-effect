import { findRepoRoot } from "@beep/repo-utils";
import { describe, expect, it } from "tstyche";
import type { NoSuchFileError } from "@beep/repo-utils";
import type { Effect, FileSystem } from "effect";

describe("Root", () => {
  it("findRepoRoot returns Effect<string, NoSuchFileError, FileSystem>", () => {
    expect(findRepoRoot()).type.toBe<Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem>>();
  });

  it("findRepoRoot accepts optional startFrom", () => {
    expect(findRepoRoot("/some/path")).type.toBe<Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem>>();
  });

  it("findRepoRoot accepts undefined startFrom", () => {
    expect(findRepoRoot(undefined)).type.toBe<Effect.Effect<string, NoSuchFileError, FileSystem.FileSystem>>();
  });
});
