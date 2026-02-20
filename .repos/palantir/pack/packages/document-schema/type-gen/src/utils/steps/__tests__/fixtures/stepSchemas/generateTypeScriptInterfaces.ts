import { Schema } from "@palantir/pack.schema";

const generateTypeScriptInterfaces = {
  "Node": {
    "type": "union",
    "name": "Node",
    "variants": {
      "object": {
        "type": "ref",
        "refType": "record",
        "name": "ObjectNode",
      },
      "text-box": {
        "type": "ref",
        "refType": "record",
        "name": "TextBox",
      },
    },
    "discriminant": "type",
  },
  "Edge": {
    "type": "record",
    "name": "Edge",
    "docs": "Represents an edge in a graph",
    "fields": {
      "source": {
        "type": "ref",
        "refType": "record",
        "name": "ObjectNode",
      },
      "target": {
        "type": "ref",
        "refType": "record",
        "name": "ObjectNode",
      },
    },
  },
  "ObjectNode": {
    "type": "record",
    "name": "ObjectNode",
    "fields": {
      "x": {
        "type": "double",
      },
      "y": {
        "type": "double",
      },
      "label": {
        "type": "optional",
        "item": {
          "type": "string",
        },
      },
      "color": {
        "type": "optional",
        "item": {
          "type": "string",
        },
      },
    },
  },
  "TextBox": {
    "type": "record",
    "name": "TextBox",
    "docs": "Represents a text box in a graph",
    "fields": {
      "x": {
        "type": "double",
      },
      "y": {
        "type": "double",
      },
      "text": {
        "type": "string",
      },
    },
  },
} satisfies Schema<any>;

export default generateTypeScriptInterfaces;
