import { TypeRule } from "@beep/logos/v2/rules";
import { expect, test } from "vitest";

test("value is truth", () => {
  const rule = TypeRule.isTruthy({
    field: "name",
  });
  const result = TypeRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is falsy", () => {
  const rule = TypeRule.isFalsy({
    field: "name",
  });
  const result = TypeRule.validate(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is null", () => {
  const rule = TypeRule.isNull({
    field: "name",
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
  const rule = TypeRule.isUndefined({
    field: "name",
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
  const rule = TypeRule.isString({
    field: "name",
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
  const rule = TypeRule.isNumber({
    field: "name",
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
  const rule = TypeRule.isBoolean({
    field: "name",
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
  const rule = TypeRule.isArray({
    field: "name",
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
  const rule = TypeRule.isObject({
    field: "name",
  });
  const result = TypeRule.validate(rule, { name: "bob" });
  expect(result).toBeTruthy();
});
