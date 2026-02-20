import { Schema } from "@palantir/pack.schema";

const refTypes = {
  "Document": {
    "type": "record",
    "name": "Document",
    "docs": "A record containing all reference types",
    "fields": {
      "id": {
        "type": "string",
      },
      "docRef": {
        "type": "docRef",
      },
      "userRef": {
        "type": "userRef",
      },
      "objectRef": {
        "type": "objectRef",
      },
      "mediaRef": {
        "type": "mediaRef",
      },
      "optionalDocRef": {
        "type": "optional",
        "item": {
          "type": "docRef",
        },
      },
      "docRefArray": {
        "type": "array",
        "items": {
          "type": "docRef",
        },
      },
      "userRefArray": {
        "type": "array",
        "items": {
          "type": "userRef",
        },
      },
    },
  },
} satisfies Schema<any>;

export default refTypes;
