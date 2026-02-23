import { describe } from "bun:test";
import { prop, strictEqual } from "@beep/testkit";
import * as fc from "effect/FastCheck";
import * as S from "effect/Schema";

describe("prop() - Property-based testing", () => {
  describe("with array of arbitraries", () => {
    prop("should receive array values from Schema arbitraries", [S.String, S.Number], ([str, num]) => {
      strictEqual(typeof str, "string");
      strictEqual(typeof num, "number");
    });

    prop("should work with FastCheck arbitraries directly", [fc.string(), fc.integer()], ([str, num]) => {
      strictEqual(typeof str, "string");
      strictEqual(typeof num, "number");
    });

    prop("should work with single arbitrary", [S.Boolean], ([bool]) => {
      strictEqual(typeof bool, "boolean");
    });
  });

  describe("with object of arbitraries", () => {
    prop("should receive object values from Schema arbitraries", { name: S.String, age: S.Number }, (props) => {
      strictEqual(typeof props.name, "string");
      strictEqual(typeof props.age, "number");
    });

    prop("should work with FastCheck arbitraries in object form", { id: fc.uuid(), count: fc.nat() }, (props) => {
      strictEqual(typeof props.id, "string");
      strictEqual(typeof props.count, "number");
      strictEqual(props.count >= 0, true);
    });

    prop(
      "should work with mixed Schema and FastCheck arbitraries",
      { schemaStr: S.String, fcInt: fc.integer({ min: 0, max: 100 }) },
      (props) => {
        strictEqual(typeof props.schemaStr, "string");
        strictEqual(typeof props.fcInt, "number");
        strictEqual(props.fcInt >= 0 && props.fcInt <= 100, true);
      }
    );
  });

  describe("with FastCheck options", () => {
    prop(
      "should respect numRuns option",
      [S.String],
      ([str]) => {
        strictEqual(typeof str, "string");
      },
      { timeout: 5000, fastCheck: { numRuns: 10 } }
    );
  });
});
