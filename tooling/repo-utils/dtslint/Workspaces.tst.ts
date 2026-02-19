import type { Effect, HashMap, Option } from "effect";
import { describe, expect, it } from "tstyche";
import {
  type DomainError,
  type FsUtils,
  getWorkspaceDir,
  type NoSuchFileError,
  resolveWorkspaceDirs,
} from "../src/index.js";

describe("Workspaces", () => {
  it("resolveWorkspaceDirs returns HashMap<string, string>", () => {
    expect(resolveWorkspaceDirs("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, string>, NoSuchFileError | DomainError, FsUtils>
    >();
  });

  it("getWorkspaceDir returns Option<string>", () => {
    expect(getWorkspaceDir("/root", "@beep/pkg")).type.toBe<
      Effect.Effect<Option.Option<string>, NoSuchFileError | DomainError, FsUtils>
    >();
  });
});
