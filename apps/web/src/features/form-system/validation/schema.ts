/**
 * JSON Schema validation for WorkflowDefinition and step data (Ajv)
 * Location: apps/web/src/features/form-system/validation/schema.ts
 */

import type Ajv from "ajv";
import type { ErrorObject } from "ajv";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";
import type { JSONSchema, WorkflowDefinition } from "../model/types";
import workflowSchema from "../model/workflow.schema.json";

/**
 * Create a configured Ajv instance. You may provide a custom instance instead.
 */
export function createAjv(): Ajv {
  const ajv = new Ajv2020({
    // Keep strictness reasonable; can be tightened later
    strict: false,
    allErrors: true,
    allowUnionTypes: true,
    coerceTypes: false,
    removeAdditional: false,
    discriminator: true,
  });
  addFormats(ajv);
  return ajv;
}

let _singletonAjv: Ajv | undefined;
export function getAjv(): Ajv {
  if (!_singletonAjv) _singletonAjv = createAjv();
  return _singletonAjv;
}

export interface SchemaValidationResult<T = unknown> {
  valid: boolean | Promise<unknown>;
  errors?: ErrorObject[] | null;
  data?: T;
}

/** Validate object shape of a WorkflowDefinition using JSON Schema */
export function validateWorkflowJson(input: unknown, ajv: Ajv = getAjv()): SchemaValidationResult<WorkflowDefinition> {
  const validate = ajv.compile(workflowSchema);
  const valid = validate(input) as boolean;
  return {
    valid,
    errors: validate.errors ?? null,
    data: valid ? (input as WorkflowDefinition) : undefined,
  };
}

/** Validate that a step JSON Schema itself is a valid JSON Schema */
export function validateStepSchema(schema: JSONSchema, ajv: Ajv = getAjv()): SchemaValidationResult<JSONSchema> {
  const valid = ajv.validateSchema(schema);
  return {
    valid,
    errors: ajv.errors ?? null,
    data: valid ? schema : undefined,
  };
}

/** Validate some data against a step's JSON Schema */
export function validateStepData(schema: JSONSchema, data: unknown, ajv: Ajv = getAjv()): SchemaValidationResult {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: validate.errors ?? null };
}

/** Validate all step schemas in a workflow (structure assumed valid). */
export function validateAllStepSchemas(
  workflow: WorkflowDefinition,
  ajv: Ajv = getAjv()
): { ok: boolean; errorsByStep: Record<string, ErrorObject[] | null> } {
  const errorsByStep: Record<string, ErrorObject[] | null> = {};
  let ok = true;
  for (const step of workflow.steps) {
    const res = validateStepSchema(step.schema, ajv);
    if (!res.valid) ok = false;
    errorsByStep[step.id] = res.errors ?? null;
  }
  return { ok, errorsByStep };
}

/** Validate a map of answers keyed by step id against each step's schema */
export function validateAnswersByStep(
  workflow: WorkflowDefinition,
  answers: Record<string, unknown>,
  ajv: Ajv = getAjv()
): { ok: boolean; results: Record<string, SchemaValidationResult> } {
  const results: Record<string, SchemaValidationResult> = {};
  let ok = true;
  for (const step of workflow.steps) {
    if (Object.prototype.hasOwnProperty.call(answers, step.id)) {
      const res = validateStepData(step.schema, answers[step.id], ajv);
      results[step.id] = res;
      if (!res.valid) ok = false;
    }
  }
  return { ok, results };
}
