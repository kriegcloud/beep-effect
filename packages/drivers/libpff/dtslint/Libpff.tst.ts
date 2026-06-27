import {
  LibpffError,
  LibpffFileProcessingEngine,
  LibpffFileProcessingEngineDescriptor,
  LibpffFileProcessingEngineOptions,
  makeLibpffError,
  makeLibpffFileProcessingEngine,
} from "@beep/libpff";
import { describe, expect, it } from "tstyche";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";
import type { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import type { LibpffErrorReason } from "@beep/libpff";

describe("@beep/libpff", () => {
  it("exports the driver engine and driver-local technical error contract", () => {
    const reason: LibpffErrorReason = "engine-unavailable";
    const options = LibpffFileProcessingEngineOptions.make({ syntheticExport: true });

    expect(LibpffFileProcessingEngineDescriptor).type.toBe<FileProcessingEngineDescriptor>();
    expect(LibpffFileProcessingEngine).type.toBe<FileProcessingEngineShape>();
    expect(options).type.toBe<LibpffFileProcessingEngineOptions>();
    expect(makeLibpffFileProcessingEngine(options)).type.toBe<FileProcessingEngineShape>();
    expect(LibpffError.fromReason(reason)).type.toBe<LibpffError>();
    expect(makeLibpffError(reason)).type.toBe<LibpffError>();
  });
});
