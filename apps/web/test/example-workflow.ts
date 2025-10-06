export default {
  id: "inventory-adjustment",
  version: "1.0.0",
  schemaVersion: "workflow.v1",
  initial: "product",
  steps: [
    {
      id: "product",
      title: "Select Product",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
          sku: { type: "string", title: "SKU" },
          location: { type: "string", title: "Location" },
          lotControlled: { type: "boolean", title: "Lot controlled?" },
        },
        required: ["sku", "location"],
      },
    },
    {
      id: "lot",
      title: "Enter Lot Number",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
          lotNumber: { type: "string", title: "Lot Number" },
        },
        required: ["lotNumber"],
      },
    },
    {
      id: "adjust",
      title: "Adjust Quantity",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
          delta: { type: "integer", title: "Adjustment (+/-)" },
          reason: { type: "string", title: "Reason" },
        },
        required: ["delta"],
      },
    },
    {
      id: "confirm",
      title: "Confirm",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
          confirm: { type: "boolean", const: true, title: "Confirm" },
        },
        required: ["confirm"],
      },
    },
    {
      id: "done",
      title: "Done",
      schema: {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {},
      },
    },
  ],
  transitions: [
    {
      from: "product",
      to: "lot",
      when: {
        "==": [{ var: "external.productDetails.lotControlled" }, true],
      },
      priority: 1,
    },
    {
      from: "product",
      to: "adjust",
      when: {
        "==": [{ var: "external.productDetails.lotControlled" }, false],
      },
      priority: 2,
    },
    { from: "lot", to: "adjust" },
    { from: "adjust", to: "confirm" },
    { from: "confirm", to: "done" },
  ],
  metadata: {
    title: "Inventory Adjustment",
    description: "Simple 4-step flow: product -> adjust -> confirm -> done",
  },
};
