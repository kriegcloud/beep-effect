import { EmbeddingServiceLive } from "@beep/knowledge-server/Embedding";
import { OpenAiEmbeddingLayerConfig } from "@beep/knowledge-server/Embedding/providers/OpenAiLayer";
import {
  LlmControlBundleLive,
  LlmProviderBundleLive,
  WorkflowRuntimeBundleLive,
} from "@beep/knowledge-server/Runtime/ServiceBundles";
import * as Layer from "effect/Layer";
import * as Live from "../../entities";

export const layer = Layer.mergeAll(
  Live.BatchLive.Rpc.layer,
  Live.EntityLive.Rpc.layer,
  Live.RelationLive.Rpc.layer,
  Live.GraphRAGLive.Rpc.layer,
  Live.EvidenceLive.Rpc.layer,
  Live.MeetingPrepLive.Rpc.layer
).pipe(
  Layer.provide(LlmControlBundleLive),
  Layer.provide(LlmProviderBundleLive),
  Layer.provide(OpenAiEmbeddingLayerConfig),
  Layer.provide(EmbeddingServiceLive),
  Layer.provide(WorkflowRuntimeBundleLive)
);
