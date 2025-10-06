import type { UnsafeTypes } from "@beep/types";
import { describe, expect, it } from "@effect/vitest";
import {
  validateWorkflow as semanticValidate,
  validateAllStepSchemas,
  validateWorkflowJson,
  type WorkflowDefinition,
} from "@/features/form-system";
import { buildInventoryAdjustmentTyped } from "@/features/form-system/examples/inventory-adjustment.typed";
import example from "./example-workflow";

/**
 * Typed DSL should produce a valid WorkflowDefinition and align with the canonical example.
 */
describe("Form System - Typed DSL (Effect Schema)", () => {
  it("builds Inventory Adjustment and validates JSON + semantics", () => {
    const wf = buildInventoryAdjustmentTyped();

    // Ajv: overall workflow JSON validation
    const overall = validateWorkflowJson(wf);
    expect(overall.valid).toBe(true);

    // Ajv: each step schema is valid JSON Schema
    const steps = validateAllStepSchemas(wf as WorkflowDefinition);
    expect(steps.ok).toBe(true);

    // Semantic validator: references, reachability, defaults
    const sem = semanticValidate(wf as WorkflowDefinition);
    expect(sem.ok).toBe(true);

    // Basic structural checks against the canonical example
    const canonical = example as unknown as WorkflowDefinition;
    expect(wf.id).toBe(canonical.id);
    expect(wf.version).toBe(canonical.version);
    expect(wf.initial).toBe(canonical.initial);
    expect(wf.steps.map((s) => s.id)).toEqual(canonical.steps.map((s) => s.id));
    expect(wf.transitions.map((t) => `${t.from}->${t.to}`)).toEqual(
      canonical.transitions.map((t) => `${t.from}->${t.to}`)
    );

    // Confirm top-priority transition first
    expect(wf.transitions[0]!.to).toBe("lot");

    // Required fields for 'product' step
    const product = wf.steps.find((s) => s.id === "product")!;
    expect(product.schema).toBeTruthy();
    const productReq = (product.schema as UnsafeTypes.UnsafeAny).required ?? [];
    expect(productReq).toEqual(["sku", "location"]);

    // Confirm step enforces confirm === true (const true or enum [true])
    const confirm = wf.steps.find((s) => s.id === "confirm")!;
    const confirmProp = (confirm.schema as UnsafeTypes.UnsafeAny).properties?.confirm ?? {};
    const hasConstTrue = confirmProp.const === true;
    const hasEnumTrue = Array.isArray(confirmProp.enum) && confirmProp.enum[0] === true;
    expect(hasConstTrue || hasEnumTrue).toBe(true);
  });
});
