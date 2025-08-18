/**
 * XState adapter for WorkflowDefinition (v1)
 * Location: apps/web/src/features/form-system/runtime/xstateAdapter.ts
 */

import { assertEvent, assign, createMachine } from "xstate";
import type {
  EvaluationContext,
  JsonLogicRule,
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
export type Events = NextEvent | BackEvent;

/**
 * Build a simple XState machine where each step is a state, and transitions
 * occur on the `NEXT` event using optional guard conditions.
 *
 * - States with no outgoing transitions are marked `final`.
 * - Transition priorities are respected by insertion order.
 */
export function buildMachine(def: WorkflowDefinition, evaluate: EvaluateFn) {
  const outgoing = groupOutgoing(def.transitions);

  const states: Record<string, any> = {};
  for (const step of def.steps) {
    const outs = outgoing.get(step.id) ?? [];
    // BACK transition candidates to each possible previous step (static targets with guarded conditions)
    const backTransitions = def.steps.map((s) => ({
      target: s.id,
      guard: ({ context }: { context: { history: string[] } }) =>
        Array.isArray(context.history) &&
        context.history[context.history.length - 1] === s.id,
      actions: assign({
        history: ({ context }: { context: { history: string[] } }) =>
          context.history.slice(0, -1),
      }),
    }));

    if (outs.length === 0) {
      // Terminal in terms of NEXT, but keep BACK available
      states[step.id] = { on: { BACK: backTransitions } };
    } else {
      // Sort by priority (lower first), undefined last
      const ordered = [...outs].sort(
        (a, b) =>
          (a.priority ?? Number.POSITIVE_INFINITY) -
          (b.priority ?? Number.POSITIVE_INFINITY),
      );
      states[step.id] = {
        on: {
          NEXT: ordered.map((t) => ({
            target: t.to,
            // Validate current step data before evaluating rule; only then allow transition
            guard: ({ event }: { event: Events }) => {
              assertEvent(event, "NEXT");
              const ev = event;
              const valid = validateStepData(
                step.schema,
                ev.context.currentStepAnswers,
              ).valid;
              if (!valid) return false;
              return evaluate(t.when, ev.context);
            },
            actions: assign({
              history: ({ context }: { context: { history: string[] } }) => [
                ...(context.history ?? []),
                step.id,
              ],
            }),
          })),
          BACK: backTransitions,
        },
      };
    }
  }

  return createMachine({
    id: def.id,
    context: { history: [] as string[] },
    initial: def.initial,
    states,
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
