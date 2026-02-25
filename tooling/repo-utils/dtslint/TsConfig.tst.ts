import { collectTsConfigPaths, type DomainError, type FsUtils, type NoSuchFileError } from "@beep/repo-utils";
import type { Effect, HashMap } from "effect";
import { describe, expect, it } from "tstyche";

describe("TsConfig", () => {
  it("collectTsConfigPaths returns HashMap<string, ReadonlyArray<string>>", () => {
    expect(collectTsConfigPaths("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils>
    >();
  });
});
