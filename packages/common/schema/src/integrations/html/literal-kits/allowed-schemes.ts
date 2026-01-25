import { $SchemaId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived";

const $I = $SchemaId.create("integrations/html/literal-kits/allowed-schemes");

export class AllowedScheme extends StringLiteralKit("http", "data", "cid", "https", "mailto", "ftp", "tel")
  .annotations(
    $I.annotations("AllowedScheme", {
      description: "Allowed scheme",
    })
  )
  .annotations(
    $I.annotations("AllowedScheme", {
      description: "Allowed scheme",
    })
  ) {}

export declare namespace AllowedScheme {
  export type Type = typeof AllowedScheme.Type;
  export type Encoded = typeof AllowedScheme.Encoded;
}

export class AllowedSchemesAppliedToAttributes extends StringLiteralKit("href", "src", "cite").annotations(
  $I.annotations("AllowedSchemesAppliedToAttributes", {
    description: "Allowed schemes applied to attributes",
  })
) {}

export declare namespace AllowedSchemesAppliedToAttributes {
  export type Type = typeof AllowedSchemesAppliedToAttributes.Type;
  export type Encoded = typeof AllowedSchemesAppliedToAttributes.Encoded;
}
