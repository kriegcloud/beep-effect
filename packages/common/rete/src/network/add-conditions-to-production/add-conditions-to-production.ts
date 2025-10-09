import type { UnsafeTypes } from "@beep/types";
import type { $Schema, Condition, Production, Var } from "../../network/types";
import { Field } from "../../network/types";
import { isVar } from "../is-var";
export const addConditionsToProduction = <T extends $Schema, U>(
  production: Production<T, U>,
  id: number | string | Var.Type,
  attr: keyof T,
  value: Var.Type | UnsafeTypes.UnsafeAny,
  then: boolean
) => {
  const condition: Condition<T> = { shouldTrigger: then, nodes: [], vars: [] };
  const fieldTypes = [Field.Enum.IDENTIFIER, Field.Enum.ATTRIBUTE, Field.Enum.VALUE];
  for (const fieldType of fieldTypes) {
    if (fieldType === Field.Enum.IDENTIFIER) {
      if (isVar(id)) {
        const temp = id;
        temp.field = fieldType;
        condition.vars.push(temp);
      } else {
        condition.nodes.push([fieldType, id]);
      }
    } else if (fieldType === Field.Enum.ATTRIBUTE) {
      condition.nodes.push([fieldType, attr]);
    } else if (fieldType === Field.Enum.VALUE) {
      if (isVar(value)) {
        const temp = value;
        temp.field = fieldType;
        condition.vars.push(temp);
      } else {
        condition.nodes.push([fieldType, value]);
      }
    }
  }
  production.conditions.push(condition);
};
