import { Schema } from "@palantir/pack.schema";

const simpleRecord = {
  "Person": {
    "type": "record",
    "name": "Person",
    "docs": "A person record",
    "fields": {
      "name": {
        "type": "string",
      },
      "age": {
        "type": "double",
      },
      "email": {
        "type": "optional",
        "item": {
          "type": "string",
        },
      },
    },
  },
} satisfies Schema<any>;

export default simpleRecord;
