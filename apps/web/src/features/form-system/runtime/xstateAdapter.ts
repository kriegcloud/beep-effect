/**
 * XState adapter for WorkflowDefinition (v1)
 * Location: apps/web/src/features/form-system/runtime/xstateAdapter.ts
 */

import { assertEvent, assign, createMachine, type ProvidedActor } from "xstate";
import type {
  EvaluationContext,
  JsonLogicRule,
  JsonObject,
  JsonValue,
  TransitionDefinition,
  WorkflowDefinition,
} from "../model/types";
import { validateStepData } from "../validation/schema";
export type EvaluateFn = (
  rule: JsonLogicRule | undefined,
  ctx: EvaluationContext,
) => boolean;

export type NextEvent = { type: "NEXT"; context: EvaluationContext };
export type BackEvent = { type: "BACK" };
export type RunEvent = {
  type: "RUN";
  id: string;
  input?: unknown;
  assignKey?: string;
};
export type RunSuccessEvent = {
  type: "RUN_SUCCESS";
  id: string;
  assignKey?: string;
  result: JsonValue;
};
export type RunFailureEvent = {
  type: "RUN_FAILURE";
  id: string;
  assignKey?: string;
  error: unknown;
};
export type ResetEvent = { type: "RESET" };
export type LoadSnapshotEvent = { type: "LOAD_SNAPSHOT"; snapshot: Snapshot };
export type Events =
  | NextEvent
  | BackEvent
  | RunEvent
  | RunSuccessEvent
  | RunFailureEvent
  | ResetEvent
  | LoadSnapshotEvent;

export type ActorRegistry = Record<
  string,
  (input?: unknown) => Promise<JsonValue>
>;

export interface WorkflowMachineContext {
  history: string[];
  external: Record<string, JsonValue>;
  answers: Record<string, JsonObject>;
}

export interface Snapshot {
  value: string; // current step id
  context: WorkflowMachineContext;
}

/**
 * Build a simple XState machine where each step is a state, and transitions
 * occur on the `NEXT` event using optional guard conditions.
 *
 * - States with no outgoing transitions are marked `final`.
 * - Transition priorities are respected by insertion order.
 */
export function buildMachine(
  def: WorkflowDefinition,
  evaluate: EvaluateFn,
  actors?: ActorRegistry,
  options?: { snapshot?: Snapshot },
) {
  const outgoing = groupOutgoing(def.transitions);

  const states: Record<string, any> = {};
  // Action to run an actor and send back completion
  const runActor = ({ event, self }: { event: Events; self: any }) => {
    assertEvent(event, "RUN");
    const { id, input, assignKey } = event as RunEvent;
    const fn = actors?.[id];
    if (!fn) return;
    Promise.resolve()
      .then(() => fn(input))
      .then((result) =>
        self.send({
          type: "RUN_SUCCESS",
          id,
          assignKey,
          result,
        } satisfies RunSuccessEvent),
      )
      .catch((error) =>
        self.send({
          type: "RUN_FAILURE",
          id,
          assignKey,
          error,
        } satisfies RunFailureEvent),
      );
  };

  const commonOn = {
    RUN: { actions: runActor },
    RUN_SUCCESS: {
      actions: assign({
        external: (args: {
          context: WorkflowMachineContext;
          event: Events;
        }) => {
          const { context, event } = args;
          assertEvent(event, "RUN_SUCCESS");
          const e = event as RunSuccessEvent;
          const key = e.assignKey ?? e.id;
          return { ...(context.external ?? {}), [key]: e.result } as Record<
            string,
            JsonValue
          >;
        },
      }),
    },
    RUN_FAILURE: {
      actions: assign({
        external: (args: {
          context: WorkflowMachineContext;
          event: Events;
        }) => {
          const { context, event } = args;
          assertEvent(event, "RUN_FAILURE");
          const e = event as RunFailureEvent;
          const key = `${e.assignKey ?? e.id}__error`;
          const value: JsonValue =
            e.error instanceof Error
              ? (e.error.message ?? String(e.error))
              : typeof e.error === "string" ||
                  typeof e.error === "number" ||
                  typeof e.error === "boolean" ||
                  e.error === null
                ? (e.error as JsonValue)
                : String(e.error);
          return { ...(context.external ?? {}), [key]: value } as Record<
            string,
            JsonValue
          >;
        },
      }),
    },
  } as const;

  for (const step of def.steps) {
    const outs = outgoing.get(step.id) ?? [];
    // BACK transition candidates to each possible previous step (static targets with guarded conditions)
    const backTransitions = def.steps.map((s) => ({
      target: `#${s.id}`,
      guard: (args: { context: WorkflowMachineContext }) => {
        const { context } = args;
        return (
          Array.isArray(context.history) &&
          context.history[context.history.length - 1] === s.id
        );
      },
      actions: assign({
        history: (args: { context: WorkflowMachineContext }) => {
          const { context } = args;
          return context.history.slice(0, -1);
        },
      }),
    }));

    if (outs.length === 0) {
      // Terminal in terms of NEXT, but keep BACK and actor events available
      states[step.id] = {
        id: step.id,
        on: { ...commonOn, BACK: backTransitions },
      };
    } else {
      // Sort by priority (lower first), undefined last
      const ordered = [...outs].sort(
        (a, b) =>
          (a.priority ?? Number.POSITIVE_INFINITY) -
          (b.priority ?? Number.POSITIVE_INFINITY),
      );
      states[step.id] = {
        id: step.id,
        on: {
          ...commonOn,
          NEXT: ordered.map((t) => ({
            target: `#${t.to}`,
            // Validate current step data before evaluating rule; only then allow transition
            guard: (args: {
              context: WorkflowMachineContext;
              event: Events;
            }) => {
              const { context, event } = args;
              assertEvent(event, "NEXT");
              const ev = event as NextEvent;
              const valid = validateStepData(
                step.schema,
                ev.context.currentStepAnswers,
              ).valid as boolean;
              if (!valid) return false;
              const mergedCtx: EvaluationContext = {
                answers: {
                  ...(context.answers ?? {}),
                  ...(ev.context.answers ?? {}),
                } as Record<string, JsonObject>,
                currentStepAnswers: ev.context.currentStepAnswers as
                  | JsonObject
                  | undefined,
                externalContext: {
                  ...(ev.context.externalContext ?? {}),
                  ...(context.external ?? {}),
                } as JsonObject,
              };
              return evaluate(t.when, mergedCtx);
            },
            actions: assign({
              history: (args: { context: WorkflowMachineContext }) => {
                const { context } = args;
                return [...(context.history ?? []), step.id];
              },
              answers: (args: {
                context: WorkflowMachineContext;
                event: Events;
              }) => {
                const { context, event } = args;
                assertEvent(event, "NEXT");
                const ev = event as NextEvent;
                const curr = (ev.context.currentStepAnswers ??
                  {}) as JsonObject;
                return {
                  ...(context.answers ?? {}),
                  [step.id]: curr,
                } as Record<string, JsonObject>;
              },
            }),
          })),
          BACK: backTransitions,
        },
      };
    }
  }

  const initialContext: WorkflowMachineContext = options?.snapshot?.context ?? {
    history: [],
    external: {},
    answers: {},
  };
  const initialStateId = options?.snapshot?.value ?? def.initial;

  return createMachine({
    types: {} as {
      context: WorkflowMachineContext;
      events: Events;
    },
    id: def.id,
    context: initialContext,
    initial: initialStateId,
    states,
    on: {
      RESET: {
        target: `#${def.initial}`,
        actions: assign(
          () =>
            ({
              history: [],
              external: {},
              answers: {},
            }) satisfies WorkflowMachineContext,
        ),
      },
      LOAD_SNAPSHOT: [
        ...def.steps.map((s) => ({
          target: `#${s.id}`,
          guard: (args: { event: LoadSnapshotEvent }) => {
            const { event } = args;
            return event.snapshot.value === s.id;
          },
          actions: assign<
            WorkflowMachineContext,
            LoadSnapshotEvent,
            undefined,
            Events,
            ProvidedActor
          >((args) => {
            const { event } = args;
            return event.snapshot.context;
          }),
        })),
      ],
    },
  });
}

function groupOutgoing(transitions: readonly TransitionDefinition[]) {
  const m = new Map<string, TransitionDefinition[]>();
  for (const t of transitions) {
    if (!m.has(t.from)) m.set(t.from, []);
    m.get(t.from)!.push(t);
  }
  return m;
}
