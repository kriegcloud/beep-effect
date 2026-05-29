import {
  Phoenix,
  PhoenixAnnotationInput,
  PhoenixAnnotationWriteResult,
  PhoenixDatasetAppendResult,
  PhoenixDatasetCreateInput,
  PhoenixDatasetCreateResult,
  PhoenixDatasetExample,
  PhoenixDatasetExamplesResult,
  PhoenixDatasetInfoResult,
  PhoenixDatasetSelector,
  PhoenixDoctorResult,
  PhoenixError,
  PhoenixExperimentCreateInput,
  PhoenixExperimentInfoResult,
  PhoenixPromptChatMessage,
  PhoenixPromptCreateInput,
  PhoenixPromptReadResult,
  PhoenixPromptSelector,
  PhoenixPromptWriteResult,
} from "@beep/phoenix";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import type { PhoenixSdkShape } from "@beep/phoenix";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const okSdk: PhoenixSdkShape = {
  addAnnotation: (input) =>
    Promise.resolve(
      PhoenixAnnotationWriteResult.make({
        annotationId: "annotation-id",
        name: input.name,
        targetId: input.targetId,
        targetKind: input.targetKind,
      })
    ),
  appendDatasetExamples: () =>
    Promise.resolve(PhoenixDatasetAppendResult.make({ datasetId: "dataset-id", versionId: "version-id" })),
  createDataset: (input) =>
    Promise.resolve(
      PhoenixDatasetCreateResult.make({
        datasetId: `dataset:${input.name}:${A.length(input.examples)}`,
      })
    ),
  createExperiment: (input) =>
    Promise.resolve(
      PhoenixExperimentInfoResult.make({
        datasetId: input.datasetId,
        datasetVersionId: input.datasetVersionId ?? "latest",
        exampleCount: 1,
        experimentId: "experiment-id",
        failedRunCount: 0,
        metadata: input.experimentMetadata,
        missingRunCount: 1,
        projectName: null,
        repetitions: input.repetitions,
        successfulRunCount: 0,
      })
    ),
  createPrompt: (input) =>
    Promise.resolve(
      PhoenixPromptWriteResult.make({ name: input.name, promptVersionId: `prompt-version-id:${input.modelProvider}` })
    ),
  doctor: () =>
    Promise.resolve(
      PhoenixDoctorResult.make({
        baseUrl: "https://phoenix.test",
        message: "Phoenix is reachable.",
        status: "passed",
        version: "1.2.3",
      })
    ),
  getDatasetExamples: () =>
    Promise.resolve(
      PhoenixDatasetExamplesResult.make({
        examples: [PhoenixDatasetExample.make({ input: { task: "loop-health" } })],
        versionId: "version-id",
      })
    ),
  getDatasetInfo: (selector) =>
    Promise.resolve(
      PhoenixDatasetInfoResult.make({
        datasetId: "dataset-id",
        description: "Dataset readback.",
        metadata: { selector: selector.value },
        name: selector.value,
      })
    ),
  getExperimentInfo: (experimentId) =>
    Promise.resolve(
      PhoenixExperimentInfoResult.make({
        datasetId: "dataset-id",
        datasetVersionId: "version-id",
        exampleCount: 1,
        experimentId,
        failedRunCount: 0,
        missingRunCount: 1,
        repetitions: 1,
        successfulRunCount: 0,
      })
    ),
  getPrompt: () =>
    Promise.resolve(PhoenixPromptReadResult.make({ exists: true, promptVersionId: "prompt-version-id" })),
};

const failingSdk: PhoenixSdkShape = {
  ...okSdk,
  doctor: () => Promise.reject(new Error("offline")),
};

describe("@beep/phoenix", () => {
  it.effect(
    "delegates dataset, prompt, and doctor operations through the Effect service",
    Effect.fnUntraced(
      function* () {
        const phoenix = yield* Phoenix;

        const doctor = yield* phoenix.doctor;
        const dataset = yield* phoenix.createDataset(
          PhoenixDatasetCreateInput.make({
            description: "Agent loop health examples.",
            examples: [PhoenixDatasetExample.make({ input: { task: "loop-health" } })],
            name: "agent-loop-health-v1",
          })
        );
        const prompt = yield* phoenix.createPrompt(
          PhoenixPromptCreateInput.make({
            modelName: "gpt-4o-mini",
            name: "agent-effectiveness-review-evaluator-v1",
            template: [PhoenixPromptChatMessage.make({ content: "Review {{caseId}}", role: "user" })],
          })
        );

        expect(doctor.version).toBe("1.2.3");
        expect(dataset.datasetId).toBe("dataset:agent-loop-health-v1:1");
        expect(prompt.promptVersionId).toBe("prompt-version-id:OPENAI");
      },
      provideScopedLayer(Phoenix.makeLayerWithSdk(okSdk))
    )
  );

  it.effect(
    "writes annotations through the injected SDK adapter",
    Effect.fnUntraced(
      function* () {
        const phoenix = yield* Phoenix;
        const result = yield* phoenix.addAnnotation(
          PhoenixAnnotationInput.make({
            label: "passed",
            name: "agent.outcome",
            targetId: "trace-id",
            targetKind: "trace",
          })
        );

        expect(result.annotationId).toBe("annotation-id");
        expect(result.targetKind).toBe("trace");
      },
      provideScopedLayer(Phoenix.makeLayerWithSdk(okSdk))
    )
  );

  it.effect(
    "maps SDK promise failures into PhoenixError",
    Effect.fnUntraced(
      function* () {
        const phoenix = yield* Phoenix;
        const error = yield* pipe(phoenix.doctor, Effect.flip);

        expect(error).toBeInstanceOf(PhoenixError);
        expect(error.operation).toBe("doctor");
        expect(error.reason).toBe("transport");
        expect(error.cause).toBe("offline");
      },
      provideScopedLayer(Phoenix.makeLayerWithSdk(failingSdk))
    )
  );

  it.effect(
    "reads back dataset, prompt, and experiment summaries",
    Effect.fnUntraced(
      function* () {
        const phoenix = yield* Phoenix;
        const selector = PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-outcomes-v1" });
        const promptSelector = PhoenixPromptSelector.make({ name: "agent-effectiveness-review-evaluator-v1" });
        const dataset = yield* phoenix.getDatasetInfo(selector);
        const examples = yield* phoenix.getDatasetExamples(selector);
        const prompt = yield* phoenix.getPrompt(promptSelector);
        const experiment = yield* phoenix.createExperiment(
          PhoenixExperimentCreateInput.make({ datasetId: dataset.datasetId, experimentName: "deterministic-v1" })
        );

        expect(dataset.name).toBe("agent-outcomes-v1");
        expect(examples.versionId).toBe("version-id");
        expect(prompt.exists).toBe(true);
        expect(experiment.experimentId).toBe("experiment-id");
      },
      provideScopedLayer(Phoenix.makeLayerWithSdk(okSdk))
    )
  );

  it.effect(
    "rejects empty prompt selectors before calling the SDK",
    Effect.fnUntraced(
      function* () {
        const phoenix = yield* Phoenix;
        const error = yield* pipe(phoenix.getPrompt(PhoenixPromptSelector.make({})), Effect.flip);

        expect(error).toBeInstanceOf(PhoenixError);
        expect(error.operation).toBe("getPrompt");
        expect(error.reason).toBe("config");
      },
      provideScopedLayer(Phoenix.makeLayerWithSdk(okSdk))
    )
  );
});
