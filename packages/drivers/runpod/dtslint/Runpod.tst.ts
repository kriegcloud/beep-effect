import {
  CreatePodRequest,
  ListPodsRequest,
  PodCreateInput,
  type Pods,
  Runpod,
  RunpodConfigInput,
  RunpodDocs,
  RunpodDocsConfigInput,
  type RunpodDocsError,
  type RunpodError,
  RunpodRawRequest,
  type RunpodRawResponse,
  type RunpodShape,
} from "@beep/runpod";
import { type Effect, type Layer, Redacted } from "effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import { describe, expect, it } from "tstyche";

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
