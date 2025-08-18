import { describe, expect, it } from "@effect/vitest";
import {
  validateAllStepSchemas,
  validateStepData,
  validateStepSchema,
  validateWorkflowJson,
  type WorkflowDefinition,
} from "@/features/form-system";
import example from "./example-workflow";

describe("Form System - Schema Validation (Ajv)", () => {
  it("validates example WorkflowDefinition JSON", () => {
    const res = validateWorkflowJson(example);
    expect(res.valid).toBe(true);
    expect(res.errors ?? null).toBe(null);
  });

  it("fails when required properties are missing", () => {
    const { initial: _omit, ...rest } = example as any;
    const res = validateWorkflowJson(rest);
    expect(res.valid).toBe(false);
    expect(Array.isArray(res.errors)).toBe(true);
  });

  it("validates step schema and step data", () => {
    const wf = example as unknown as WorkflowDefinition;
    const step0 = wf.steps[0]!;

    const schemaOk = validateStepSchema(step0.schema);
    expect(schemaOk.valid).toBe(true);

    const dataValid = validateStepData(step0.schema, {
      sku: "SKU-1",
      location: "LOC-1",
    });
    expect(dataValid.valid).toBe(true);

    const dataInvalid = validateStepData(step0.schema, { sku: "SKU-1" });
    expect(dataInvalid.valid).toBe(false);
  });

  it("validates all step schemas", () => {
    const wf = example as unknown as WorkflowDefinition;
    const res = validateAllStepSchemas(wf);
    expect(res.ok).toBe(true);
  });
});
