import { $UISpreadsheetId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { TaggedUnion as TaggedUnionFactory } from "@beep/schema/core";
import type { StructTypes } from "@beep/types";

const $I = $UISpreadsheetId.create("interpreter/models/NodeKind");

const makeTaggedStruct =
  <L extends number>(lit: L) =>
  <Fields extends StructTypes.StructFieldsWithStringKeys>(fields: Fields) =>
    TaggedUnionFactory("kind" as const)(lit, fields);

export class NodeKind extends BS.MappedLiteralKit(
  ["Ref", 0],
  ["CellRange", 1],
  ["NumberLiteral", 2],
  ["Addition", 3],
  ["Substraction", 4],
  ["Multiplication", 5],
  ["Division", 6],
  ["Modulo", 7],
  ["Exponent", 8],
  ["UnaryPlus", 9],
  ["UnaryMinus", 10]
).annotations(
  $I.annotations("NodeKind", {
    description: "The NodeKind",
  })
) {}

export declare namespace NodeKind {
  export type Type = typeof NodeKind.Type;
  export type Encoded = typeof NodeKind.Encoded;
}

export const makeExpression = {
  Ref: makeTaggedStruct(NodeKind.DecodedEnum.Ref),
  CellRange: makeTaggedStruct(NodeKind.DecodedEnum.CellRange),
  NumberLiteral: makeTaggedStruct(NodeKind.DecodedEnum.NumberLiteral),
  Addition: makeTaggedStruct(NodeKind.DecodedEnum.Addition),
  Substraction: makeTaggedStruct(NodeKind.DecodedEnum.Substraction),
  Multiplication: makeTaggedStruct(NodeKind.DecodedEnum.Multiplication),
  Division: makeTaggedStruct(NodeKind.DecodedEnum.Division),
  Modulo: makeTaggedStruct(NodeKind.DecodedEnum.Modulo),
  Exponent: makeTaggedStruct(NodeKind.DecodedEnum.Exponent),
  UnaryPlus: makeTaggedStruct(NodeKind.DecodedEnum.UnaryPlus),
  UnaryMinus: makeTaggedStruct(NodeKind.DecodedEnum.UnaryMinus),
} as const;
