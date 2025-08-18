/**
 * Inventory Adjustment workflow built with the typed DSL
 * Location: apps/web/src/features/form-system/examples/inventory-adjustment.typed.ts
 */

import { Schema } from "effect";
import type { WorkflowDefinition } from "@/features/form-system";
import { createTypedWorkflow } from "@/features/form-system/dsl/typed";

// Step schemas using Effect Schema
const Product = Schema.Struct({
  sku: Schema.propertySignature(Schema.String).annotations({ title: "SKU" }),
  location: Schema.propertySignature(Schema.String).annotations({
    title: "Location",
  }),
  lotControlled: Schema.optional(Schema.Boolean).annotations({
    title: "Lot controlled?",
  }),
});

const Lot = Schema.Struct({
  lotNumber: Schema.propertySignature(Schema.String).annotations({
    title: "Lot Number",
  }),
});

const Adjust = Schema.Struct({
  delta: Schema.propertySignature(Schema.Int).annotations({
    title: "Adjustment (+/-)",
  }),
  reason: Schema.propertySignature(Schema.String).annotations({
    title: "Reason",
  }),
});

const Confirm = Schema.Struct({
  confirm: Schema.propertySignature(Schema.Literal(true)).annotations({
    title: "Confirm",
  }),
});

const Done = Schema.Struct({});

export function buildInventoryAdjustmentTyped(): WorkflowDefinition {
  return createTypedWorkflow({
    id: "inventory-adjustment",
    version: "1.0.0",
    initial: "product",
    metadata: {
      title: "Inventory Adjustment",
      description: "Simple 4-step flow: product -> adjust -> confirm -> done",
    },
  })
    .step("product", Product, { title: "Select Product" })
    .step("lot", Lot, { title: "Enter Lot Number" })
    .step("adjust", Adjust, { title: "Adjust Quantity" })
    .step("confirm", Confirm, { title: "Confirm" })
    .step("done", Done, { title: "Done" })
    .when(
      "product",
      "lot",
      {
        "==": [{ var: "external.productDetails.lotControlled" }, true],
      },
      1,
    )
    .when(
      "product",
      "adjust",
      {
        "==": [{ var: "external.productDetails.lotControlled" }, false],
      },
      2,
    )
    .go("lot", "adjust")
    .go("adjust", "confirm")
    .go("confirm", "done")
    .build();
}

export const inventoryAdjustmentTyped: WorkflowDefinition =
  buildInventoryAdjustmentTyped();
