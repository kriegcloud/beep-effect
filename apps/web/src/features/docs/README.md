# Form System (Foundations)

Location: `apps/web/src/features/form-system/`

This directory contains the initial foundation for a JSON-driven, multi-step workflow form system.

- Canonical model types: `model/types.ts`
- JSON Schema for workflows: `model/workflow.schema.json` (Draft 2020-12)
- Semantic validation: `validation/semantic.ts`
- Example workflow: `examples/inventory-adjustment.workflow.json`

## Model Overview

A workflow is a directed graph of steps connected by transitions. Steps carry their own JSON Schema used by the renderer. Transitions may be conditional via JsonLogic rules.

Key types:

- `WorkflowDefinition`: root container with `id`, `version`, `initial`, `steps`, `transitions`.
- `StepDefinition`: `id`, `schema` (JSON Schema), optional `title`, `description`, `uiSchema`, `annotations`.
- `TransitionDefinition`: `from`, `to`, optional `when` (JsonLogic rule) and `priority`.

## Semantic Validation

Use `validateWorkflow(workflow)` to check:

- Duplicate step IDs
- Initial step exists
- All transition references exist
- Unreachable steps (from the initial)
- At least one terminal path exists
- Warning when a step with outgoing edges has no default (unconditional) transition

Returns `{ ok, issues }` where `ok` is false if any error-level issues exist.

## Next Steps

- Wire Ajv to validate `WorkflowDefinition` against `model/workflow.schema.json` and step `schema`s.
- Implement DSL builder that outputs `WorkflowDefinition` JSON.
- Add execution engine (XState) and JsonLogic evaluation.
- Integrate with JSONForms renderer.

## Details for Next Steps (implemented)

### Ajv validation

Exports in `validation/schema.ts` (re-exported via `index.ts`): `createAjv()`, `getAjv()`, `validateWorkflowJson()`, `validateStepSchema()`, `validateStepData()`, `validateAllStepSchemas()`, `validateAnswersByStep()`.

Example:

```ts
import example from "@/features/form-system/examples/inventory-adjustment.workflow.json";
import {
  validateWorkflowJson,
  validateAllStepSchemas,
  validateStepData,
  type WorkflowDefinition,
} from "@/features/form-system";

const { valid, errors, data } = validateWorkflowJson(example);
if (!valid) console.error(errors);
if (valid) {
  const wf = data as WorkflowDefinition;
  console.log(validateAllStepSchemas(wf));
  console.log(
    validateStepData(wf.steps[0]!.schema, { sku: "SKU-1", location: "LOC-1" }),
  );
}
```

### DSL builder

Located at `dsl/builder.ts`: `createWorkflow(...)` and `step(...)` help build a `WorkflowDefinition`.

```ts
import { createWorkflow, step } from "@/features/form-system";

const wf = createWorkflow({ id: "demo", version: "1.0.0", initial: "a" })
  .steps(
    step("a", {
      type: "object",
      properties: { ok: { type: "boolean", title: "OK?" } },
      required: ["ok"],
    }),
    step("b", { type: "object", properties: {} }),
  )
  .go("a", "b")
  .build();
```

### Execution engine (XState) + JsonLogic

Located at `runtime/xstateAdapter.ts` and `runtime/jsonLogicEvaluator.ts`.

```ts
import { buildMachine, evaluateJsonLogic } from "@/features/form-system";
import { createActor } from "xstate";

const machine = buildMachine(wf, evaluateJsonLogic);
const actor = createActor(machine).start();

actor.send({
  type: "NEXT",
  context: {
    answers: { a: { ok: true } },
    currentStepAnswers: { ok: true },
    externalContext: {},
  },
});
```

### JSONForms integration

`renderer/jsonformsAdapter.tsx` exposes `<StepForm />` using Material renderers and the shared Ajv.

```tsx
import { StepForm } from "@/features/form-system";

<StepForm
  step={wf.steps[0]!}
  data={formData}
  onChange={setFormData}
/>;
```

Notes:

- In Next.js, we render `<StepForm />` client-side via `next/dynamic(..., { ssr: false })` to avoid hydration ID mismatches.
- The demo page casts the JSON example to `unknown as WorkflowDefinition` to bypass overly-strict structural inference during import; runtime validation covers correctness.

### Demo

See `apps/web/src/app/form-demo/page.tsx` and the example at `examples/inventory-adjustment.workflow.json`.

## Status & Upcoming Work

- Verify hydration mismatch is gone at `/form-demo`; consider enabling SSR later with stable IDs.
- Add UX: Back button, progress indicator, disable Next when invalid, inline errors.
- Add Reset/Restart control and improved debug (show transition evaluation and JsonLogic conditions).
- Add more example workflows and external context usage.
- Consider moving Ajv singleton/config to a shared package for consistency.
- Add tests for navigation, validation gating, hydration behavior.
