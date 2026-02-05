import { $KnowledgeServerId } from "@beep/identity/packages";
import { BatchNotFoundError, InvalidStateTransitionError } from "@beep/knowledge-domain/errors";
import type { BatchState } from "@beep/knowledge-domain/value-objects";
import type { KnowledgeEntityIds } from "@beep/shared-domain";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as Ref from "effect/Ref";

const $I = $KnowledgeServerId.create("Workflow/BatchStateMachine");

type StateTag = BatchState["_tag"];

const ALLOWED_TRANSITIONS: HashMap.HashMap<StateTag, ReadonlyArray<StateTag>> = HashMap.make(
	[
		"BatchState.Pending" as StateTag,
		["BatchState.Extracting", "BatchState.Cancelled", "BatchState.Failed"] as ReadonlyArray<StateTag>,
	],
	[
		"BatchState.Extracting" as StateTag,
		[
			"BatchState.Resolving",
			"BatchState.Completed",
			"BatchState.Failed",
			"BatchState.Cancelled",
		] as ReadonlyArray<StateTag>,
	],
	[
		"BatchState.Resolving" as StateTag,
		["BatchState.Completed", "BatchState.Failed", "BatchState.Cancelled"] as ReadonlyArray<StateTag>,
	],
	["BatchState.Completed" as StateTag, [] as ReadonlyArray<StateTag>],
	["BatchState.Failed" as StateTag, ["BatchState.Pending"] as ReadonlyArray<StateTag>],
	["BatchState.Cancelled" as StateTag, [] as ReadonlyArray<StateTag>]
);

const isTransitionAllowed = (currentTag: StateTag, nextTag: StateTag): boolean =>
	F.pipe(
		HashMap.get(ALLOWED_TRANSITIONS, currentTag),
		O.map((allowed) => A.contains(allowed, nextTag)),
		O.getOrElse(() => false)
	);

export interface BatchStateMachineShape {
	readonly create: (
		batchId: KnowledgeEntityIds.BatchExecutionId.Type
	) => Effect.Effect<BatchState>;

	readonly getState: (
		batchId: KnowledgeEntityIds.BatchExecutionId.Type
	) => Effect.Effect<BatchState, BatchNotFoundError>;

	readonly transition: (
		batchId: KnowledgeEntityIds.BatchExecutionId.Type,
		nextState: BatchState
	) => Effect.Effect<BatchState, InvalidStateTransitionError | BatchNotFoundError>;

	readonly canTransition: (currentTag: string, nextTag: string) => boolean;
}

export class BatchStateMachine extends Context.Tag($I`BatchStateMachine`)<
	BatchStateMachine,
	BatchStateMachineShape
>() {}

const serviceEffect: Effect.Effect<BatchStateMachineShape> = Effect.gen(function* () {
	const statesRef = yield* Ref.make(HashMap.empty<string, BatchState>());

	const create: BatchStateMachineShape["create"] = Effect.fn("BatchStateMachine.create")(
		function* (batchId: KnowledgeEntityIds.BatchExecutionId.Type) {
			const initial: BatchState = { _tag: "BatchState.Pending" as const, batchId };

			yield* Ref.update(statesRef, HashMap.set<string, BatchState>(batchId, initial));

			yield* Effect.logInfo("BatchStateMachine: batch created").pipe(
				Effect.annotateLogs({ batchId, state: initial._tag })
			);

			return initial;
		}
	);

	const getState: BatchStateMachineShape["getState"] = Effect.fn("BatchStateMachine.getState")(
		function* (batchId: KnowledgeEntityIds.BatchExecutionId.Type) {
			const states = yield* Ref.get(statesRef);
			return yield* F.pipe(
				HashMap.get(states, batchId),
				O.match({
					onNone: () => Effect.fail(new BatchNotFoundError({ batchId })),
					onSome: Effect.succeed,
				})
			);
		}
	);

	const transition: BatchStateMachineShape["transition"] = Effect.fn("BatchStateMachine.transition")(
		function* (
			batchId: KnowledgeEntityIds.BatchExecutionId.Type,
			nextState: BatchState
		) {
			const currentState = yield* getState(batchId);

			if (!isTransitionAllowed(currentState._tag, nextState._tag)) {
				return yield* new InvalidStateTransitionError({
						batchId,
						currentState: currentState._tag,
						attemptedState: nextState._tag,
					})
			}

			yield* Ref.update(statesRef, HashMap.set<string, BatchState>(batchId, nextState));

			yield* Effect.logInfo("BatchStateMachine: state transitioned").pipe(
				Effect.annotateLogs({
					batchId,
					from: currentState._tag,
					to: nextState._tag,
				})
			);

			return nextState;
		}
	);

	const canTransition: BatchStateMachineShape["canTransition"] = (currentTag, nextTag) =>
		isTransitionAllowed(currentTag as StateTag, nextTag as StateTag);

	return BatchStateMachine.of({ create, getState, transition, canTransition });
});

export const BatchStateMachineLive = Layer.effect(BatchStateMachine, serviceEffect);
