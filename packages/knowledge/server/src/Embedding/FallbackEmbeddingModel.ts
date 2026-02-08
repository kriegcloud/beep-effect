import { $KnowledgeServerId } from "@beep/identity/packages";
import type * as EmbeddingModel from "@effect/ai/EmbeddingModel";
import * as Context from "effect/Context";
import type * as O from "effect/Option";

const $I = $KnowledgeServerId.create("Embedding/FallbackEmbeddingModel");

/**
 * Optional backup embedding provider/model, used for fallback chains once the
 * primary model has exhausted retries or hit a terminal condition.
 */
export class FallbackEmbeddingModel extends Context.Tag($I`FallbackEmbeddingModel`)<
  FallbackEmbeddingModel,
  O.Option<EmbeddingModel.Service>
>() {}
