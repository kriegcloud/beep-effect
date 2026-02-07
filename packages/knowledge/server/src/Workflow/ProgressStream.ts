import { $KnowledgeServerId } from "@beep/identity/packages";
import type { ExtractionProgressEvent } from "@beep/knowledge-domain/value-objects";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";

const $I = $KnowledgeServerId.create("Workflow/ProgressStream");

export interface ProgressStreamShape {
  readonly emit: (event: ExtractionProgressEvent.Type) => Effect.Effect<void>;
  readonly subscribe: () => Stream.Stream<ExtractionProgressEvent.Type>;
}

export class ProgressStream extends Context.Tag($I`ProgressStream`)<ProgressStream, ProgressStreamShape>() {}

const serviceEffect: Effect.Effect<ProgressStreamShape, never, never> = Effect.gen(function* () {
  const pubsub = yield* PubSub.unbounded<ExtractionProgressEvent.Type>();

  const emit: ProgressStreamShape["emit"] = (event) => PubSub.publish(pubsub, event).pipe(Effect.asVoid);

  const subscribe: ProgressStreamShape["subscribe"] = () => Stream.fromPubSub(pubsub);

  return ProgressStream.of({ emit, subscribe });
});

export const ProgressStreamLive = Layer.effect(ProgressStream, serviceEffect);
