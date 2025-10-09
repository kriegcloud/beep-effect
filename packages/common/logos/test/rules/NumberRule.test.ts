import { expect, test } from "bun:test";
import { NumberRule } from "../../src/v2/rules";

test("number is equal to", () => {
  const rule = NumberRule.eq({
    field: "names",
    value: 2,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number does not equal to", () => {
  const rule = NumberRule.ne({
    field: "names",
    value: 1,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than", () => {
  const rule = NumberRule.gt({
    field: "names",
    value: 1,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is greater than or equal to", () => {
  const rule = NumberRule.gte({
    field: "names",
    value: 2,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than", () => {
  const rule = NumberRule.lt({
    field: "names",
    value: 3,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});

test("number is less than or equal to", () => {
  const rule = NumberRule.lte({
    field: "names",
    value: 2,
  });
  const result = NumberRule.validate(rule, 2);
  expect(result).toBeTruthy();
});
