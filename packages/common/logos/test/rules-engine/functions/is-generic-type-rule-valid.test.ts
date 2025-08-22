import { GenericTypeRule } from "@beep/logos";

import { expect, test } from "vitest";

test("value is truth", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    op: { _tag: "isTruthy" },
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
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
    _tag: "genericType",
  };
  const result = GenericTypeRule.validate(rule, "{}");
  expect(result).toBeTruthy();
});

test("invalid operator is handled", () => {
  const rule: GenericTypeRule.Input = {
    field: "name",
    // @ts-expect-error
    op: "is_more_awesome_than",
    _tag: "genericType",
  };
  const result = GenericTypeRule.validate(rule, undefined);
  expect(result).toBeFalsy();
});
