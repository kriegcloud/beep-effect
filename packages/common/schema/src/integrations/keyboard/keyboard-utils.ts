import { $SchemaId } from "@beep/identity/packages";
import { StringLiteralKit } from "@beep/schema/derived";
import * as Str from "effect/String";

const $I = $SchemaId.create("integrations/keyboard/keyboard-utils");

export class SpecialKeyCode extends StringLiteralKit(
  "Space",
  "Enter",
  "Escape",
  "Backspace",
  "Tab",
  "ShiftLeft",
  "ControlLeft",
  "CtrlLeft",
  "AltLeft",
  "MetaLeft",
  {
    enumMapping: [
      ["Space", "space"],
      ["Enter", "enter"],
      ["Escape", "escape"],
      ["Backspace", "backspace"],
      ["Tab", "tab"],
      ["ShiftLeft", "shift"],
      ["CtrlLeft", "ctrl"],
      ["ControlLeft", "control"],
      ["AltLeft", "alt"],
      ["MetaLeft", "meta"],
    ],
  }
).annotations(
  $I.annotations("SpecialKeyCode", {
    title: "Special Key Code",
    description: "Special key modifiers for keyboard shortcuts",
  })
) {
  // static readonly keyCodeFromKey = (key: )
}

export declare namespace SpecialKeyCode {
  export type Type = typeof SpecialKeyCode.Type;
}

export class SpecialKey extends StringLiteralKit(
  "space",
  "enter",
  "escape",
  "backspace",
  "tab",
  "shift",
  "ctrl",
  "control",
  "alt",
  "meta",
  {
    enumMapping: [
      ["space", "Space"],
      ["enter", "Enter"],
      ["escape", "Escape"],
      ["backspace", "Backspace"],
      ["tab", "Tab"],
      ["shift", "ShiftLeft"],
      ["ctrl", "CtrlLeft"],
      ["control", "ControlLeft"],
      ["alt", "AltLeft"],
      ["meta", "MetaLeft"],
    ],
  }
).annotations(
  $I.annotations("SpecialKey", {
    title: "Special Key",
    description: "Special key modifiers for keyboard shortcuts",
  })
) {
  // static readonly keyCodeFromKey = (key: )
}

export declare namespace SpecialKey {
  export type Type = typeof SpecialKey.Type;
}

/**
 * Converts a key string to its corresponding keyboard event code
 * @param key - The key string to convert
 * @returns The keyboard event code
 */
export function getKeyCodeFromKey(key: string): string {
  // Handle single characters
  if (key.length === 1) {
    const upperKey = Str.toUpperCase(key);
    if (upperKey >= "A" && upperKey <= "Z") {
      return `Key${upperKey}`;
    }
    if (key >= "0" && key <= "9") {
      return `Digit${key}`;
    }
  }

  // Handle special keys
  const specialKeys: Record<string, string> = {
    space: "Space",
    enter: "Enter",
    escape: "Escape",
    backspace: "Backspace",
    tab: "Tab",
    shift: "ShiftLeft",
    ctrl: "ControlLeft",
    control: "ControlLeft",
    alt: "AltLeft",
    meta: "MetaLeft",
  };

  return specialKeys[Str.toLowerCase(key)] || key;
}
