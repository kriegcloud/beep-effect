import type { BS } from "@beep/schema";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";
import { GroupLayout, LabelElement, LabelStringKind, Layout } from "../ui-schema";

/**
 * Adds the given {@code labelName} to the {@code layout} if it exists
 * @param layout
 *      The layout which is to receive the label
 * @param labelName
 *      The name of the schema
 */
export const addLabel = (layout: Layout.Type, labelName: string) => {
  if (!isEmpty(labelName)) {
    const fixedLabel = startCase(labelName);
    if (S.is(GroupLayout)(layout)) {
      // layout.label = fixedLabel
      return GroupLayout.make({
        ...layout,
        label: O.some(
          LabelStringKind.make({
            value: fixedLabel,
          })
        ),
      });
    }
    const label: LabelElement.Type = LabelElement.make({
      type: "Label",
      text: fixedLabel,
    });
    return Layout.make({
      ...layout,
      elements: [...layout.elements, label],
    });
  }
  return layout;
};

/**
 * Returns whether the given {@code jsonSchema} is a combinator ({@code oneOf}, {@code anyOf}, {@code allOf}) at the root level
 * @param jsonSchema
 *      the schema to check
 */
export const isCombinator = (jsonSchema: BS.JsonSchema.Type): boolean => {
  return (
    !isEmpty(jsonSchema) && (!isEmpty(jsonSchema.oneOf) || !isEmpty(jsonSchema.anyOf) || !isEmpty(jsonSchema.allOf))
  );
};
