
import { Schema } from "@palantir/pack.schema";

const schema = (
{
  "Cat": {
    "type": "record",
    "name": "Cat",
    "fields": {
      "meow": {
        "type": "string"
      },
      "whiskers": {
        "type": "double"
      }
    },
    "docs": "A cat"
  },
  "Dog": {
    "type": "record",
    "name": "Dog",
    "fields": {
      "bark": {
        "type": "string"
      },
      "tailWags": {
        "type": "double"
      }
    },
    "docs": "A dog"
  },
  "Animal": {
    "discriminant": "kind",
    "name": "Animal",
    "type": "union",
    "variants": {
      "cat": {
        "type": "ref",
        "name": "Cat",
        "refType": "record"
      },
      "dog": {
        "type": "ref",
        "name": "Dog",
        "refType": "record"
      }
    }
  }
}
) satisfies Schema<any>;

export default schema;
