import { describe, expect, it } from "@effect/vitest";
import type { WorkflowDefinition } from "@/features/form-system";
import { validateWorkflow } from "@/features/form-system";
import example from "./example-workflow";

const EXAMPLE = example as unknown as WorkflowDefinition;

describe("Form System - Semantic Validation", () => {
  it("valid example workflow passes (no errors, warnings allowed)", () => {
    const res = validateWorkflow(EXAMPLE);
    expect(res.ok).toBe(true);
    expect(res.issues.filter((i) => i.severity === "error").length).toBe(0);
    // Allow warnings like MISSING_DEFAULT_TRANSITION
  });

  it("detects duplicate step ids", () => {
    const dup: WorkflowDefinition = {
      ...EXAMPLE,
      steps: [...EXAMPLE.steps, { ...EXAMPLE.steps[0]!, id: EXAMPLE.steps[0]!.id }],
    };
    const res = validateWorkflow(dup);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => i.code === "DUPLICATE_STEP_ID")).toBe(true);
  });

  it("detects unknown transition references", () => {
    const bad: WorkflowDefinition = {
      ...EXAMPLE,
      transitions: [...EXAMPLE.transitions, { from: "__missing__", to: "done" }],
    };
    const res = validateWorkflow(bad);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => i.code === "UNKNOWN_TRANSITION_REF")).toBe(true);
  });

  it("flags unreachable steps", () => {
    const bad: WorkflowDefinition = {
      ...EXAMPLE,
      steps: [...EXAMPLE.steps, { id: "ghost", schema: { type: "object" } }],
    };
    const res = validateWorkflow(bad);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => i.code === "UNREACHABLE_STEP")).toBe(true);
  });

  it("warns when a step with outgoing transitions has no default transition", () => {
    // Create a case where 'adjust' has only conditional transitions (no default)
    const bad: WorkflowDefinition = {
      ...EXAMPLE,
      transitions: [
        { from: "product", to: "adjust" },
        { from: "adjust", to: "confirm", when: { ">": [{ var: "delta" }, 0] } },
        { from: "confirm", to: "done" },
      ],
    };
    const res = validateWorkflow(bad);
    expect(res.issues.some((i) => i.code === "MISSING_DEFAULT_TRANSITION")).toBe(true);
  });

  it("detects when there is no terminal path (cycle)", () => {
    const cyc: WorkflowDefinition = {
      ...EXAMPLE,
      transitions: [
        { from: "product", to: "adjust" },
        { from: "adjust", to: "product" },
      ],
    };
    const res = validateWorkflow(cyc);
    expect(res.ok).toBe(false);
    expect(res.issues.some((i) => i.code === "NO_TERMINAL_PATH")).toBe(true);
  });
});
