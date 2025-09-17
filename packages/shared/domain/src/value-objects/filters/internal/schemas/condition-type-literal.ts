import {BS} from "@beep/schema";

export const OperatorTypeLiteralKit = BS.stringLiteralKit(
  "and",
  "or"
);

export class OperatorTypeLiteral extends OperatorTypeLiteralKit.Schema {
  static readonly Enum = OperatorTypeLiteralKit.Enum;
  static readonly Options = OperatorTypeLiteralKit.Options;
}

export namespace OperatorTypeLiteral {
  export type Type = typeof OperatorTypeLiteral.Type;
  export type Encoded = typeof OperatorTypeLiteral.Encoded;
}