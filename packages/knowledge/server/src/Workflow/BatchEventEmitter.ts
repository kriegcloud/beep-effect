import { $KnowledgeServerId } from "@beep/identity/packages";
import type { BatchEvent } from "@beep/knowledge-domain/value-objects";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as PubSub from "effect/PubSub";
import * as Stream from "effect/Stream";

const $I = $KnowledgeServerId.create("Workflow/BatchEventEmitter");

export interface BatchEventEmitterShape {
	readonly emit: (event: BatchEvent) => Effect.Effect<void>;
	readonly subscribe: (batchId: KnowledgeEntityIds.BatchExecutionId.Type) => Stream.Stream<BatchEvent>;
	readonly subscribeAll: () => Stream.Stream<BatchEvent>;
}

export class BatchEventEmitter extends Context.Tag($I`BatchEventEmitter`)<
	BatchEventEmitter,
	BatchEventEmitterShape
>() {}

const serviceEffect: Effect.Effect<BatchEventEmitterShape> = Effect.gen(function* () {
	const pubsub = yield* PubSub.unbounded<BatchEvent>();

	const emit: BatchEventEmitterShape["emit"] = (event) =>
		PubSub.publish(pubsub, event).pipe(
			Effect.tap(() =>
				Effect.logDebug("BatchEventEmitter: event emitted").pipe(
					Effect.annotateLogs({ batchId: event.batchId, eventTag: event._tag })
				)
			),
			Effect.asVoid
		);

	const subscribe: BatchEventEmitterShape["subscribe"] = (batchId) =>
		Stream.fromPubSub(pubsub).pipe(
			Stream.filter((event) => event.batchId === batchId)
		);

	const subscribeAll: BatchEventEmitterShape["subscribeAll"] = () =>
		Stream.fromPubSub(pubsub);

	return BatchEventEmitter.of({ emit, subscribe, subscribeAll });
});

export const BatchEventEmitterLive = Layer.effect(BatchEventEmitter, serviceEffect);
