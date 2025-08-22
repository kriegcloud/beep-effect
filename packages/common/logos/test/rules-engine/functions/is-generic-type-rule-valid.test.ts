import { GenericTypeRule } from "@beep/logos";

import { expect, test } from "vitest";

test("value is truth", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: { _tag: "isTruthy" },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "bob");
  expect(result).toBeTruthy();
});

test("value is falsy", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isFalsy",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is null", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNull",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, null);
  expect(result).toBeTruthy();
});

test("value is not null", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotNull",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, {});
  expect(result).toBeTruthy();
});

test("value is undefined", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isUndefined",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, undefined);
  expect(result).toBeTruthy();
});

test("value is not undefined", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isDefined",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, false);
  expect(result).toBeTruthy();
});

test("value is string", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isString",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "alice");
  expect(result).toBeTruthy();
});

test("value is not string", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotString",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, 12345);
  expect(result).toBeTruthy();
});

test("value is number", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNumber",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, 123.4);
  expect(result).toBeTruthy();
});

test("value is not number", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotNumber",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "12345");
  expect(result).toBeTruthy();
});

test("value is boolean", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isBoolean",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, false);
  expect(result).toBeTruthy();
});

test("value is not boolean", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotBoolean",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "false");
  expect(result).toBeTruthy();
});

test("value is array", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isArray",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, []);
  expect(result).toBeTruthy();
});

test("value is not array", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotArray",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "[]");
  expect(result).toBeTruthy();
});

test("value is object", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isObject",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, { name: "bob" });
  expect(result).toBeTruthy();
});

test("value is not array", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      _tag: "isNotObject",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "{}");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: {
      // @ts-expect-error
      _tag: "is_more_awesome_than",
    },
    type: "genericType",
  };
  const result = GenericTypeRule.validate(rule, undefined);
  expect(result).toBeFalsy();
});
