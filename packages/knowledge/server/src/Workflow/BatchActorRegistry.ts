import { $KnowledgeServerId } from "@beep/identity/packages";
import { BatchNotFoundError } from "@beep/knowledge-domain/errors";
import type { BatchMachineEvent, BatchMachineState } from "@beep/knowledge-domain/value-objects";
import type { ActorRef } from "@beep/machine";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";

const $I = $KnowledgeServerId.create("Workflow/BatchActorRegistry");

type BatchActor = ActorRef<BatchMachineState, BatchMachineEvent>;

export interface BatchActorRegistryShape {
  readonly register: (batchId: KnowledgeEntityIds.BatchExecutionId.Type, actor: BatchActor) => Effect.Effect<void>;

  readonly lookup: (batchId: KnowledgeEntityIds.BatchExecutionId.Type) => Effect.Effect<BatchActor, BatchNotFoundError>;

  readonly remove: (batchId: KnowledgeEntityIds.BatchExecutionId.Type) => Effect.Effect<void>;
}

export class BatchActorRegistry extends Context.Tag($I`BatchActorRegistry`)<
  BatchActorRegistry,
  BatchActorRegistryShape
>() {}

const serviceEffect: Effect.Effect<BatchActorRegistryShape> = Effect.gen(function* () {
  const actorsRef = yield* Ref.make(HashMap.empty<string, BatchActor>());

  const register: BatchActorRegistryShape["register"] = Effect.fn("BatchActorRegistry.register")(function* (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type,
    actor: BatchActor
  ) {
    yield* Ref.update(actorsRef, HashMap.set<string, BatchActor>(batchId, actor));

    yield* Effect.logInfo("BatchActorRegistry: actor registered").pipe(Effect.annotateLogs({ batchId }));
  });

  const lookup: BatchActorRegistryShape["lookup"] = Effect.fn("BatchActorRegistry.lookup")(function* (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type
  ) {
    const actors = yield* Ref.get(actorsRef);
    return yield* F.pipe(
      HashMap.get(actors, batchId),
      O.match({
        onNone: () => Effect.fail(new BatchNotFoundError({ batchId })),
        onSome: Effect.succeed,
      })
    );
  });

  const remove: BatchActorRegistryShape["remove"] = Effect.fn("BatchActorRegistry.remove")(function* (
    batchId: KnowledgeEntityIds.BatchExecutionId.Type
  ) {
    yield* Ref.update(actorsRef, (actors) => HashMap.remove(actors, batchId));

    yield* Effect.logInfo("BatchActorRegistry: actor removed").pipe(Effect.annotateLogs({ batchId }));
  });

  return BatchActorRegistry.of({ register, lookup, remove });
});

export const BatchActorRegistryLive = Layer.effect(BatchActorRegistry, serviceEffect);
