/**
 * Uppercase ASCII alphabet useful for template literal helpers.
 *
 * Scope these literals when deriving column prefixes or environment tags so
 * TypeScript keeps the resulting template literal narrow.
 *
 * @example
 * import type { UpperLetter } from "@beep/types/char.types";
 *
 * const envFlag: UpperLetter = "A";
 * void envFlag;
 *
 * @category Types/Literals
 * @since 0.1.0
 */
export type UpperLetter =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z";
