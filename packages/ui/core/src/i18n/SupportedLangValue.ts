import { StringLiteralKit } from "@beep/schema/derived";

export class SupportedLangValue extends StringLiteralKit("en", "fr", "cn", "ar") {}

export declare namespace SupportedLangValue {
  export type Type = typeof SupportedLangValue.Type;
  export type Encoded = typeof SupportedLangValue.Encoded;
}
