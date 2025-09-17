import { BS } from "@beep/schema";

export const FilterTypeLiteralKit = BS.stringLiteralKit(
  "text",
  "numeric",
  "date",
  "select",
  "multi_select",
  "boolean",
  "date_range",
);

export class FilterTypeLiteral extends FilterTypeLiteralKit.Schema {
  static readonly Enum = FilterTypeLiteralKit.Enum;
  static readonly Options = FilterTypeLiteralKit.Options;
}

export namespace FilterTypeLiteral {
  export type Type = typeof FilterTypeLiteral.Type;
  export type Encoded = typeof FilterTypeLiteral.Encoded;
}