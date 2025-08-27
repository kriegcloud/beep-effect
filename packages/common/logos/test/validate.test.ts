import * as l from "@beep/logos/v2";
import { describe, expect, test } from "@effect/vitest";
import { v4 as uuid } from "uuid";

describe("validate", () => {
  test("rules engine passes validation", () => {
    const root = l.RootGroup.make({
      logicalOp: "and",
    });
    l.addGroup(root, { logicalOp: "and" });
    l.addRuleToGroup(
      root,
      l.NumberRule.gt({
        field: "number",
        value: 18,
      })
    );

    const result = l.validate(root);
    expect(result.isValid).toBeTruthy();
  });

  test("rules engine validation fails validation with invalid group", () => {
    const root = l.RootGroup.make({
      logicalOp: "and",
    });

    root.rules.push({
      node: "group",
      id: uuid(),
      // @ts-expect-error
      logicalOp: "neither",
      parentId: root.id,
      rules: [],
    });

    const result = l.validate(root);
    console.log(result);
    expect(result.isValid).toBeFalsy();

    expect(!result.isValid && result.reason).toBeTruthy();
  });

  test("rules engine validation fails validation with invalid rule", () => {
    const root = l.RootGroup.make({ logicalOp: "and" });

    root.rules.push({
      node: "rule",
      id: uuid(),
      field: "number",
      parentId: root.id,
      op: { _tag: "gt", value: 18 },
      // @ts-expect-error
      _tag: "integer",
    });

    const result = l.validate(root);
    expect(result.isValid).toBeFalsy();
    expect(!result.isValid && result.reason).toBeTruthy();
  });
});
