import type { Effect, HashMap } from "effect";
import { describe, expect, it } from "tstyche";
import { collectTsConfigPaths, type DomainError, type FsUtils, type NoSuchFileError } from "../src/index.js";

describe("TsConfig", () => {
  it("collectTsConfigPaths returns HashMap<string, ReadonlyArray<string>>", () => {
    expect(collectTsConfigPaths("/root")).type.toBe<
      Effect.Effect<HashMap.HashMap<string, ReadonlyArray<string>>, NoSuchFileError | DomainError, FsUtils>
    >();
  });
});
