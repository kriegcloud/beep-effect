import { buildRepoDependencyIndex } from "@beep/repo-utils";
import { describe, expect, it } from "tstyche";
import type { DomainError, FsUtils, NoSuchFileError, WorkspaceDeps } from "@beep/repo-utils";
import type { Effect, HashMap } from "effect";

describe("DependencyIndex", () => {
  it("buildRepoDependencyIndex returns HashMap<string, WorkspaceDeps>", () => {
    expect(buildRepoDependencyIndex("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, WorkspaceDeps>, NoSuchFileError | DomainError, FsUtils>
    >();
  });
});
