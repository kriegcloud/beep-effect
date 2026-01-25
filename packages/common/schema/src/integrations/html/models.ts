import { $SchemaId } from "@beep/identity/packages";
import { thunkTrue } from "@beep/utils";
import * as S from "effect/Schema";
import * as Literals from "./literal-kits";

const $I = $SchemaId.create("integrations/html/models");

export class Attributes extends S.Record({
  key: Literals.HtmlAttribute,
  value: S.String,
}).annotations(
  $I.annotations("Attributes", {
    description: "Attributes of an HTML tag",
  })
) {}

export declare namespace Attributes {
  export type Type = typeof Attributes.Type;
  export type Encoded = typeof Attributes.Encoded;
}

export class ParserOptions extends S.Class<ParserOptions>($I`ParserOptions`)({
  decodeEntities: S.optionalWith(S.Boolean, {
    default: thunkTrue,
  }).annotations({
    default: true,
    description: "Whether to decode HTML entities.",
  }),
  lowerCaseTags: S.optionalWith(S.Boolean, {
    default: thunkTrue,
  }).annotations({
    default: true,
    description: "Whether to convert tag names to lowercase.",
  }),
  lowerCaseAttributeNames: S.optionalWith(S.Boolean, {
    default: thunkTrue,
  }).annotations({
    default: true,
    description: "Whether to convert attribute names to lowercase.",
  }),
}) {}
