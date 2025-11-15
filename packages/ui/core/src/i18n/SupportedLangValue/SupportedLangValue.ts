import { stringLiteralKit } from "@beep/schema/kits";

export const { Options, Schema, Enum } = stringLiteralKit("en", "fr", "cn", "ar");

export type Type = typeof Schema.Type;
