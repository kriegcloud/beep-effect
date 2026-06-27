import {
  makeTikaError,
  makeTikaFileProcessingEngine,
  TikaError,
  TikaFileProcessingEngine,
  TikaFileProcessingEngineDescriptor,
} from "@beep/tika";
import { describe, expect, it } from "tstyche";
import type { FileProcessingEngineShape } from "@beep/file-processing/Service";
import type { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy";
import type { TikaErrorReason } from "@beep/tika";

describe("@beep/tika", () => {
  it("exports the driver engine and driver-local technical error contract", () => {
    const reason: TikaErrorReason = "engine-unavailable";

    expect(TikaFileProcessingEngineDescriptor).type.toBe<FileProcessingEngineDescriptor>();
    expect(TikaFileProcessingEngine).type.toBe<FileProcessingEngineShape>();
    expect(makeTikaFileProcessingEngine()).type.toBe<FileProcessingEngineShape>();
    expect(TikaError.fromReason(reason)).type.toBe<TikaError>();
    expect(makeTikaError(reason)).type.toBe<TikaError>();
  });
});
