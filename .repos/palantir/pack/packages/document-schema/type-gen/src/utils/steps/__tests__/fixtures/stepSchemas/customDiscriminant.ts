import { Schema } from "@palantir/pack.schema";

const customDiscriminant = {
  "Animal": {
    "type": "union",
    "name": "Animal",
    "variants": {
      "cat": {
        "type": "ref",
        "refType": "record",
        "name": "Cat",
      },
      "dog": {
        "type": "ref",
        "refType": "record",
        "name": "Dog",
      },
    },
    "discriminant": "kind",
  },
  "Cat": {
    "type": "record",
    "name": "Cat",
    "docs": "A cat",
    "fields": {
      "meow": {
        "type": "string",
      },
      "whiskers": {
        "type": "double",
      },
    },
  },
  "Dog": {
    "type": "record",
    "name": "Dog",
    "docs": "A dog",
    "fields": {
      "bark": {
        "type": "string",
      },
      "tailWags": {
        "type": "double",
      },
    },
  },
} satisfies Schema<any>;

export default customDiscriminant;
