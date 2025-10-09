import { describe, test } from "bun:test";
import { FsUtils } from "@beep/tooling-utils/FsUtils";

describe("alias resolution", () => {
  test("FsUtils import works", () => {
    FsUtils;
  });
});
