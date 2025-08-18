# TODOS
- use `nx` instead of `turborepo`
- create documentation generators
- create iam domain layer
- create vibe code tooling (claude, windsurf, cursor)
- 

## Form System — Typed Workflow DSL (Effect Schema)

The form system provides a typed DSL to define multi-step workflows with compile-time safety and JSON Schema generation (draft 2020-12).

Exports from `apps/web/src/features/form-system/index.ts`:

- `createTypedWorkflow` — typed builder
- `validateWorkflowJson`, `validateAllStepSchemas` — Ajv validations
- `validateWorkflow` — semantic validator
- `buildMachine`, `evaluateJsonLogic` — runtime

### Define steps and transitions

```ts
import { Schema } from "effect";
import { createTypedWorkflow } from "@/features/form-system";

// Effect step schemas
const Product = Schema.Struct({
  sku: Schema.propertySignature(Schema.String).annotations({ title: "SKU" }),
  location: Schema.propertySignature(Schema.String).annotations({ title: "Location" }),
  lotControlled: Schema.optional(Schema.Boolean).annotations({ title: "Lot controlled?" }),
});

const Adjust = Schema.Struct({
  delta: Schema.propertySignature(Schema.Int).annotations({ title: "Adjustment (+/-)" }),
});

// Build a workflow
const wf = createTypedWorkflow({
  id: "inventory-adjustment",
  version: "1.0.0",
  initial: "product",
  metadata: { title: "Inventory Adjustment" },
})
  .step("product", Product, { title: "Select Product" })
  .step("adjust", Adjust, { title: "Adjust Quantity" })
  // Conditional transition using JsonLogic (typed helpers available)
  .when(
    "product",
    "adjust",
    { "==": [{ var: "external.productDetails.lotControlled" }, false] },
    1,
  )
  .build();
```

Typed JsonLogic helpers (optional):

```ts
const b = createTypedWorkflow({ id: "x", version: "1", initial: "s" })
  .step("s", Schema.Struct({ ok: Schema.Boolean }))
  .when("s", "s", b.eq(b.varExternal("some.flag"), true));
```

### Validate workflow JSON

```ts
import { validateWorkflowJson, validateAllStepSchemas, validateWorkflow } from "@/features/form-system";

const overall = validateWorkflowJson(wf);
const steps = validateAllStepSchemas(wf);
const semantic = validateWorkflow(wf);
```

### Demo: run with typed workflow

The demo at `apps/web/src/app/form-demo/page.tsx` uses the typed example exported from:

- `apps/web/src/features/form-system/examples/inventory-adjustment.typed.ts`

You can tweak the example and see the runtime behavior (XState v5 + JsonLogic) in the demo.