import { layerJson, layerProtobuf, OtlpPacketLab } from "@beep/observability/experimental/server";
import { Effect } from "effect";
import { OtlpSerialization } from "effect/unstable/observability/OtlpSerialization";
import { describe, expect, it } from "vitest";

describe("OtlpPacketLab", () => {
  it("captures JSON OTLP packets", async () => {
    const packets = await Effect.runPromise(
      Effect.gen(function* () {
        const lab = yield* OtlpPacketLab;
        const serialization = yield* OtlpSerialization;

        serialization.logs({ resourceLogs: [] });

        return yield* lab.snapshot;
      }).pipe(Effect.provide(layerJson))
    );

    expect(packets[0]?.kind).toBe("logs");
    expect(packets[0]?.encoding).toBe("json");
    expect(packets[0]?.contentType).toContain("application/json");
  });

  it("captures protobuf OTLP packets", async () => {
    const packets = await Effect.runPromise(
      Effect.gen(function* () {
        const lab = yield* OtlpPacketLab;
        const serialization = yield* OtlpSerialization;

        serialization.traces({ resourceSpans: [] });

        return yield* lab.snapshot;
      }).pipe(Effect.provide(layerProtobuf))
    );

    expect(packets[0]?.kind).toBe("traces");
    expect(packets[0]?.encoding).toBe("protobuf");
    expect(packets[0]?.preview).toContain("Uint8Array");
  });
});
