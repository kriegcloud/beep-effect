import { DiscriminatedStruct } from "@beep/schema/generics";
import type { StringTypes, StructTypes } from "@beep/types";
import * as Data from "effect/Data";
import { NodeId } from "./NodeId";

export class NodeFactory extends Data.TaggedClass("NodeFactory") {
  readonly make = <
    const Literal extends StringTypes.NonEmptyString<string>,
    const Fields extends StructTypes.StructFieldsWithStringKeys,
  >(
    literal: Literal,
    fields: Fields
  ) =>
    DiscriminatedStruct("node")(literal, {
      ...fields,
      id: NodeId,
    });
}
