import { TypeRule } from "@beep/logos/v2/rules";
import { expect, test } from "vitest";

test("value is truth", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isTruthy",
  });
  const result = TypeRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is falsy", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isFalsy",
  });
  const result = TypeRule.validate(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is null", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isNull",
  });
  const result = TypeRule.validate(rule, null);
  expect(result).toBeTruthy();
});

// test("value is not null", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isNotNull",
//     },
//
//   };
//   const result = TypeRule.validate(rule, {});
//   expect(result).toBeTruthy();
// });

test("value is undefined", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isUndefined",
  });
  const result = TypeRule.validate(rule, undefined);
  expect(result).toBeTruthy();
});

// test("value is not undefined", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isDefined",
//     },
//
//   };
//   const result = TypeRule.validate(rule, false);
//   expect(result).toBeTruthy();
// });

test("value is string", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isString",
  });
  const result = TypeRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

// test("value is not string", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isNotString",
//     },
//
//   };
//   const result = TypeRule.validate(rule, 12345);
//   expect(result).toBeTruthy();
// });

test("value is number", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isNumber",
  });
  const result = TypeRule.validate(rule, 123.4);
  expect(result).toBeTruthy();
});

// test("value is not number", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isNotNumber",
//     },
//
//   };
//   const result = TypeRule.validate(rule, "12345");
//   expect(result).toBeTruthy();
// });

test("value is boolean", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isBoolean",
  });
  const result = TypeRule.validate(rule, false);
  expect(result).toBeTruthy();
});

// test("value is not boolean", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isNotBoolean",
//     },
//
//   };
//   const result = TypeRule.validate(rule, "false");
//   expect(result).toBeTruthy();
// });

test("value is array", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isArray",
  });
  const result = TypeRule.validate(rule, []);
  expect(result).toBeTruthy();
});

// test("value is not array", () => {
//   const rule = {
//     field: "name",
//     op: {
//       _tag: "isNotArray",
//     },
//
//   };
//   const result = TypeRule.validate(rule, "[]");
//   expect(result).toBeTruthy();
// });

test("value is object", () => {
  const rule = TypeRule.make({
    field: "name",
    op: "isObject",
  });
  const result = TypeRule.validate(rule, { name: "bob" });
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: TypeRule.Input.Type = {
    field: "name",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
    },
  };
  const result = TypeRule.validate(rule, undefined);
  expect(result).toBeFalsy();
});
