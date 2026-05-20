import {
  Phoenix,
  PhoenixAnnotationInput,
  type PhoenixAnnotationWriteResult,
  PhoenixConfigInput,
  PhoenixDatasetCreateInput,
  type PhoenixDatasetCreateResult,
  PhoenixDatasetExample,
  type PhoenixDoctorResult,
  type PhoenixError,
  type PhoenixSdkShape,
  type PhoenixShape,
} from "@beep/phoenix";
import { type Effect, type Layer, Redacted } from "effect";
import { describe, expect, it } from "tstyche";

declare const phoenix: PhoenixShape;
declare const sdk: PhoenixSdkShape;

describe("Phoenix", () => {
  it("preserves layer and service method types", () => {
    expect(Phoenix.makeLayer(new PhoenixConfigInput({ apiKey: Redacted.make("test-key") }))).type.toBeAssignableTo<
      Layer.Layer<Phoenix>
    >();
    expect(Phoenix.makeLayerWithSdk(sdk)).type.toBeAssignableTo<Layer.Layer<Phoenix>>();
    expect(Phoenix.layer).type.toBeAssignableTo<Layer.Layer<Phoenix, PhoenixError>>();

    expect(phoenix.doctor).type.toBeAssignableTo<Effect.Effect<PhoenixDoctorResult, PhoenixError>>();
    expect(
      phoenix.createDataset(
        new PhoenixDatasetCreateInput({
          description: "Agent loop health examples.",
          examples: [new PhoenixDatasetExample({ input: { task: "loop-health" } })],
          name: "agent-loop-health-v1",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<PhoenixDatasetCreateResult, PhoenixError>>();
    expect(
      phoenix.addAnnotation(
        new PhoenixAnnotationInput({
          label: "passed",
          name: "agent.outcome",
          targetId: "trace-id",
          targetKind: "trace",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<PhoenixAnnotationWriteResult, PhoenixError>>();
  });

  it("rejects invalid construction shapes", () => {
    // @ts-expect-error!
    const invalidConfig = new PhoenixConfigInput({ apiKey: "test-key" });
    // @ts-expect-error!
    const missingDatasetName = new PhoenixDatasetCreateInput({ description: "missing", examples: [] });

    void invalidConfig;
    void missingDatasetName;
  });
});
