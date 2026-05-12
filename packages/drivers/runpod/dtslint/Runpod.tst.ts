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
    expect(Runpod.makeLayer(new RunpodConfigInput({ apiKey: Redacted.make("test-key") }))).type.toBeAssignableTo<
      Layer.Layer<Runpod, never, HttpClient.HttpClient>
    >();
    expect(Runpod.layer).type.toBeAssignableTo<Layer.Layer<Runpod, RunpodError>>();
    expect(RunpodDocs.makeLayer(new RunpodDocsConfigInput({}))).type.toBeAssignableTo<
      Layer.Layer<RunpodDocs, never, HttpClient.HttpClient>
    >();
    expect(RunpodDocs.layer).type.toBeAssignableTo<Layer.Layer<RunpodDocs, RunpodDocsError>>();

    expect(runpod.listPods(new ListPodsRequest({ includeMachine: true }))).type.toBeAssignableTo<
      Effect.Effect<Pods, RunpodError>
    >();
    expect(
      runpod.createPod(
        new CreatePodRequest({
          body: new PodCreateInput({ name: "demo" }),
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<unknown, RunpodError>>();
    expect(
      runpod.raw(
        new RunpodRawRequest({
          method: "GET",
          path: "/future",
        })
      )
    ).type.toBeAssignableTo<Effect.Effect<RunpodRawResponse, RunpodError>>();
  });

  it("rejects invalid construction shapes", () => {
    // @ts-expect-error!
    const invalidConfig = new RunpodConfigInput({ apiKey: "test-key" });
    // @ts-expect-error!
    const missingBody = new CreatePodRequest({});

    void invalidConfig;
    void missingBody;
  });
});
