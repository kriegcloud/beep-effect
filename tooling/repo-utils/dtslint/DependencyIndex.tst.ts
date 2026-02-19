import type { Effect, HashMap } from "effect";
import { describe, expect, it } from "tstyche";
import {
  buildRepoDependencyIndex,
  type DomainError,
  type FsUtils,
  type NoSuchFileError,
  type WorkspaceDeps,
} from "../src/index.js";

describe("DependencyIndex", () => {
  it("buildRepoDependencyIndex returns HashMap<string, WorkspaceDeps>", () => {
    expect(buildRepoDependencyIndex("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, WorkspaceDeps>, NoSuchFileError | DomainError, FsUtils>
    >();
  });
});
