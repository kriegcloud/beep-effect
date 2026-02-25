import {
  collectUniqueNpmDependencies,
  type DomainError,
  type FsUtils,
  type NoSuchFileError,
  type UniqueNpmDeps,
} from "@beep/repo-utils";
import type { Effect } from "effect";
import { describe, expect, it } from "tstyche";

describe("UniqueDeps", () => {
  it("collectUniqueNpmDependencies returns UniqueNpmDeps", () => {
    expect(collectUniqueNpmDependencies("/root")).type.toBe<
      Effect.Effect<UniqueNpmDeps, NoSuchFileError | DomainError, FsUtils>
    >();
  });

  it("UniqueNpmDeps has dependencies array", () => {
    expect<UniqueNpmDeps["dependencies"]>().type.toBe<ReadonlyArray<string>>();
  });

  it("UniqueNpmDeps has devDependencies array", () => {
    expect<UniqueNpmDeps["devDependencies"]>().type.toBe<ReadonlyArray<string>>();
  });
});
