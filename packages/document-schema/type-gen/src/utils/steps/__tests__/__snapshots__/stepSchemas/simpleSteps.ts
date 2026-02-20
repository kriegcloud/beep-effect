
import { Schema } from "@palantir/pack.schema";

const schema = (
{
  "ObjectNode": {
    "type": "record",
    "name": "ObjectNode",
    "fields": {
      "x": {
        "type": "double"
      },
      "y": {
        "type": "double"
      },
      "object": {
        "type": "string"
      },
      "label": {
        "type": "optional",
        "item": {
          "type": "string"
        }
      },
      "edges": {
        "type": "array",
        "items": {
          "type": "ref",
          "refType": "record",
          "name": "Edge"
        }
      }
    },
    "docs": "A node in the graph"
  },
  "TextBox": {
    "type": "record",
    "name": "TextBox",
    "fields": {
      "x": {
        "type": "double"
      },
      "y": {
        "type": "double"
      },
      "text": {
        "type": "string"
      }
    },
    "docs": "A text box in the graph"
  },
  "Edge": {
    "type": "record",
    "name": "Edge",
    "fields": {
      "source": {
        "type": "ref",
        "refType": "record",
        "name": "ObjectNode"
      },
      "target": {
        "type": "ref",
        "refType": "record",
        "name": "ObjectNode"
      }
    },
    "docs": "An edge in the graph"
  },
  "Node": {
    "discriminant": "type",
    "name": "Node",
    "type": "union",
    "variants": {
      "object": {
        "type": "ref",
        "name": "ObjectNode",
        "refType": "record"
      },
      "textBox": {
        "type": "ref",
        "name": "TextBox",
        "refType": "record"
      }
    }
  }
}
) satisfies Schema<any>;

export default schema;
