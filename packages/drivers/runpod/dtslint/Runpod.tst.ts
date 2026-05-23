import {
  CreatePodRequest,
  ListPodsRequest,
  PodCreateInput,
  Runpod,
  RunpodConfigInput,
  RunpodDocs,
  RunpodDocsConfigInput,
  RunpodRawRequest,
} from "@beep/runpod";
import { Redacted } from "effect";
import { describe, expect, it } from "tstyche";
import type { Pods, RunpodDocsError, RunpodError, RunpodRawResponse, RunpodShape } from "@beep/runpod";
import type { Effect, Layer } from "effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";

declare const runpod: RunpodShape;

describe("Runpod", () => {
  it("preserves layer and service method types", () => {
    expect(Runpod.makeLayer(RunpodConfigInput.make({ apiKey: Redacted.make("test-key") }))).type.toBeAssignableTo<
      Layer.Layer<Runpod, never, HttpClient.HttpClient>
    >();
    expect(Runpod.layer).type.toBeAssignableTo<Layer.Layer<Runpod, RunpodError>>();
    expect(RunpodDocs.makeLayer(RunpodDocsConfigInput.make({}))).type.toBeAssignableTo<
      Layer.Layer<RunpodDocs, never, HttpClient.HttpClient>
    >();
    expect(RunpodDocs.layer).type.toBeAssignableTo<Layer.Layer<RunpodDocs, RunpodDocsError>>();

    expect(runpod.listPods(ListPodsRequest.make({ includeMachine: true }))).type.toBeAssignableTo<
      Effect.Effect<Pods, RunpodError>
    >();
    expect(
      runpod.createPod(
        CreatePodRequest.make({
          body: PodCreateInput.make({ name: "demo" }),
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<unknown, RunpodError>>();
    expect(
      runpod.raw(
        RunpodRawRequest.make({
          method: "GET",
          path: "/future",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<RunpodRawResponse, RunpodError>>();
  });

  it("rejects invalid construction shapes", () => {
    // @ts-expect-error!
    const invalidConfig = RunpodConfigInput.make({ apiKey: "test-key" });
    // @ts-expect-error!
    const missingBody = CreatePodRequest.make({});

    void invalidConfig;
    void missingBody;
  });
});
