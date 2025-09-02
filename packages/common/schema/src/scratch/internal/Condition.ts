import { NodeId } from "@beep/schema/scratch/internal/NodeId";
import type { StringTypes, StructTypes } from "@beep/types";
import { LiteralWithDefault } from "../../custom";
import { NodeFactory } from "./NodeFactory";

export namespace ConditionFactory {
  export const make = <
    const Type extends StringTypes.NonEmptyString<string>,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    type: Type,
    fields: Fields
  ) =>
    new NodeFactory().make("condition", {
      type: LiteralWithDefault(type),
      parentId: NodeId,
      id: NodeId,
      ...fields,
    });
}
