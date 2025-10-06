/**
 * Semantic validation for WorkflowDefinition (v1)
 * Location: apps/web/src/features/form-system/validation/semantic.ts
 */

import * as F from "effect/Function";
import * as O from "effect/Option";
import type { SemanticIssue, TransitionDefinition, ValidationResult, WorkflowDefinition } from "../model/types";
/** Main semantic validator */
export function validateWorkflow(workflow: WorkflowDefinition): ValidationResult {
  const issues: SemanticIssue[] = [];

  // Step maps and duplicate detection
  const idToIndex = new Map<string, number>();
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = F.pipe(O.fromNullable(workflow.steps[i]), O.getOrThrow);
    const id = step.id;
    if (idToIndex.has(id)) {
      issues.push({
        code: "DUPLICATE_STEP_ID",
        message: `Duplicate step id: ${id}`,
        path: `/steps/${i}`,
        severity: "error",
        info: { id },
      });
    } else {
      idToIndex.set(id, i);
    }
  }

  // Initial step must exist
  if (!idToIndex.has(workflow.initial)) {
    issues.push({
      code: "INITIAL_STEP_NOT_FOUND",
      message: `Initial step not found: ${workflow.initial}`,
      path: "/initial",
      severity: "error",
      info: { initial: workflow.initial },
    });
  }

  // Transition references must be valid
  const outgoing = new Map<string, TransitionDefinition[]>();
  for (let i = 0; i < workflow.transitions.length; i++) {
    const t = F.pipe(O.fromNullable(workflow.transitions[i]), O.getOrThrow);

    if (!idToIndex.has(t.from)) {
      issues.push({
        code: "UNKNOWN_TRANSITION_REF",
        message: `Transition.from references unknown step: ${t.from}`,
        path: `/transitions/${i}/from`,
        severity: "error",
        info: { ref: t.from, kind: "from" },
      });
    }
    if (!idToIndex.has(t.to)) {
      issues.push({
        code: "UNKNOWN_TRANSITION_REF",
        message: `Transition.to references unknown step: ${t.to}`,
        path: `/transitions/${i}/to`,
        severity: "error",
        info: { ref: t.to, kind: "to" },
      });
    }
    if (!outgoing.has(t.from)) outgoing.set(t.from, []);
    outgoing.get(t.from)!.push(t);
  }

  // Reachability: steps not reachable from initial
  const reachable = computeReachable(workflow.initial, outgoing);
  for (let i = 0; i < workflow.steps.length; i++) {
    const step = F.pipe(O.fromNullable(workflow.steps[i]), O.getOrThrow);
    const id = step.id;
    if (!reachable.has(id)) {
      issues.push({
        code: "UNREACHABLE_STEP",
        message: `Step is not reachable from initial: ${id}`,
        path: `/steps/${i}`,
        severity: "error",
        info: { id },
      });
    }
  }

  // Terminal path existence: at least one reachable terminal node
  if (idToIndex.has(workflow.initial) && reachable.size > 0) {
    const hasTerminal = Array.from(reachable).some((id) => (outgoing.get(id) ?? []).length === 0);
    if (!hasTerminal) {
      issues.push({
        code: "NO_TERMINAL_PATH",
        message: "No terminal path: all reachable steps have outgoing transitions",
        severity: "error",
      });
    }
  }

  // Missing default transition warning per step with outbound edges
  for (const [from, list] of outgoing) {
    if (list.length === 0) continue;
    const hasDefault = list.some((t) => t.when === undefined || t.when === true);
    if (!hasDefault) {
      const idx = idToIndex.get(from);
      issues.push({
        code: "MISSING_DEFAULT_TRANSITION",
        message: `Step '${from}' has no default (unconditional) transition; conditions may be non-exhaustive`,
        path: idx !== undefined ? `/steps/${idx}` : undefined,
        severity: "warning",
        info: { from },
      });
    }
  }

  const ok = issues.every((i) => i.severity !== "error");
  return { ok, issues };
}

function computeReachable(initial: string, outgoing: Map<string, TransitionDefinition[]>): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [];
  if (initial) {
    queue.push(initial);
    visited.add(initial);
  }
  while (queue.length) {
    const cur = queue.shift()!;
    const outs = outgoing.get(cur) ?? [];
    for (const t of outs) {
      if (!visited.has(t.to)) {
        visited.add(t.to);
        queue.push(t.to);
      }
    }
  }
  return visited;
}
