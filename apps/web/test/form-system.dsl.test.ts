import { describe, expect, it } from "@effect/vitest";
import {
  createWorkflow,
  step,
  validateWorkflow,
  type WorkflowDefinition,
} from "@/features/form-system";

describe("Form System - DSL Builder", () => {
  it("builds a workflow and sorts transitions by priority", () => {
    const wf = createWorkflow({ id: "dsl", version: "1.0.0", initial: "a" })
      .steps(
        step("a", { type: "object", properties: { x: { type: "number" } } }),
        step("b", { type: "object" }),
        step("c", { type: "object" }),
      )
      .when("a", "b", true, 1)
      .go("a", "c")
      .build();

    const res = validateWorkflow(wf as WorkflowDefinition);
    expect(res.ok).toBe(true);

    // priority 1 transition should come before the default
    expect(wf.transitions[0]!.to).toBe("b");
    expect(wf.transitions[1]!.to).toBe("c");
  });
});
