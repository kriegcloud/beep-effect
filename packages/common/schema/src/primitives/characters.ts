import { $SchemaId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived";
import { ArrayUtils } from "@beep/utils";
import * as Str from "effect/String";

const $I = $SchemaId.create("primitives/characters");

export class UppercaseLetter extends StringLiteralKit(
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z"
).annotations(
  $I.annotations("UppercaseLetter", {
    description: "Uppercase letter",
  })
) {}

export declare namespace UppercaseLetter {
  export type Type = typeof UppercaseLetter.Type;
  export type Encoded = typeof UppercaseLetter.Encoded;
}

export class LowercaseChar extends StringLiteralKit(
  ...ArrayUtils.NonEmptyReadonly.mapNonEmpty(UppercaseLetter.Options, Str.toLowerCase)
).annotations(
  $I.annotations("LowercaseChar", {
    description: "Lowercase letter",
  })
) {}

export declare namespace LowercaseChar {
  export type Type = typeof LowercaseChar.Type;
  export type Encoded = typeof LowercaseChar.Encoded;
}

export class DigitCharacter extends StringLiteralKit("0", "1", "2", "3", "4", "5", "6", "7", "8", "9").annotations(
  $I.annotations("DigitCharacter", {
    description: "Digit character",
  })
) {}

export declare namespace DigitCharacter {
  export type Type = typeof DigitCharacter.Type;
  export type Encoded = typeof DigitCharacter.Encoded;
}

export class AlphaNumericCharacter extends StringLiteralKit(
  ...DigitCharacter.Options,
  ...LowercaseChar.Options,
  ...UppercaseLetter.Options
).annotations(
  $I.annotations("AlphaNumericCharacter", {
    description: "Alpha numeric character",
  })
) {}

export declare namespace AlphaNumericCharacter {
  export type Type = typeof AlphaNumericCharacter.Type;
  export type Encoded = typeof AlphaNumericCharacter.Encoded;
}
