import { InvalidFaultCountError, UnknownFaultKeyError } from "@beep/memfs";
import * as Faults from "@beep/memfs/internal/faults";
import * as MemoryFileSystemModule from "@beep/memfs/MemoryFileSystem";
import { assert, describe, it } from "@effect/vitest";

describe("memfs entry-point exports", () => {
  it("exports the existing InvalidFaultCountError class", () => {
    assert.strictEqual(InvalidFaultCountError, MemoryFileSystemModule.InvalidFaultCountError);
  });

  it("exports the existing UnknownFaultKeyError class", () => {
    assert.strictEqual(UnknownFaultKeyError, Faults.UnknownFaultKeyError);
  });
});
