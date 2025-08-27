import {
  ArrayLengthRule,
  ArrayValueRule,
  addGroup,
  addRuleToGroup,
  BooleanRule,
  HasEntryRule,
  HasKeyRule,
  HasValueRule,
  NumberRule,
  RootGroup,
  StringRule,
  TypeRule,
} from "@beep/logos/v2";

export const buildSampleRootGroup = () => {
  const root = RootGroup.make({
    logicalOp: "and",
  });

  const group = addGroup(root, { logicalOp: "and" });

  const firstRule = addRuleToGroup(
    group,
    NumberRule.gt({
      field: "number",
      value: 10,
    })
  );

  addRuleToGroup(
    group,
    NumberRule.lt({
      field: "number",
      value: 30,
    })
  );
  addRuleToGroup(
    root,
    StringRule.contains({
      field: "string",
      value: "bob",
      ignoreCase: false,
    })
  );
  addRuleToGroup(
    root,
    BooleanRule.isTrue({
      field: "boolean",
    })
  );
  addRuleToGroup(
    root,
    ArrayValueRule.contains({
      value: "alice",
      field: "array",
    })
  );
  addRuleToGroup(
    root,
    ArrayLengthRule.eq({
      value: 1,
      field: "array",
    })
  );
  addRuleToGroup(
    root,
    HasKeyRule.contains({
      field: "object",
      value: "name",
    })
  );
  addRuleToGroup(
    root,
    HasValueRule.contains({
      value: "bob",
      field: "object",
    })
  );
  addRuleToGroup(
    root,
    HasEntryRule.contains({
      value: {
        key: "name",
        value: "bob",
      },
      field: "object",
    })
  );
  addRuleToGroup(
    root,
    TypeRule.isTruthy({
      field: "generic",
    })
  );
  const orGroup = addGroup(root, { logicalOp: "or" });
  addRuleToGroup(
    orGroup,
    NumberRule.lt({
      field: "number",
      value: 30,
    })
  );
  addRuleToGroup(
    orGroup,
    StringRule.contains({
      field: "string",
      value: "bob",
      ignoreCase: false,
    })
  );

  return { root, firstRule } as const;
};
