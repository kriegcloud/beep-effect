import { $SchemaId } from "@beep/identity/packages";
import { invariant } from "@beep/invariant";
import { MappedLiteralKit, StringLiteralKit } from "@beep/schema/derived";
import type { RecordTypes } from "@beep/types";
import { ArrayUtils, RecordUtils } from "@beep/utils";
import { thunk, thunkNull } from "@beep/utils/thunk";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import type * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

const $I = $SchemaId.create("integrations/keyboard/keyboard-layout-map");

export class KeyboardLayout extends StringLiteralKit(
  "qwerty",
  "dvorak",
  "colemak",
  "azerty",
  "qwertz",
  "unknown"
).annotations(
  $I.annotations("KeyboardLayout", {
    description: "The users keyboard layout.",
  })
) {}

export declare namespace KeyboardLayout {
  export type Type = typeof KeyboardLayout.Type;
}

export class LayoutDetectionResultMethod extends StringLiteralKit("api", "language", "fallback").annotations(
  $I.annotations("LayoutDetectionResultMethod", {
    description: "The method used to detect the users keyboard layout.",
  })
) {}

export declare namespace LayoutDetectionResultMethod {
  export type Type = typeof LayoutDetectionResultMethod.Type;
}
type MakeLayoutMapOptions<
  PhysicalMap extends R.ReadonlyRecord<string, string>,
  ToQwertyMap extends R.ReadonlyRecord<string, string>,
> = {
  readonly physicalMap: PhysicalMap;
  readonly toQwerty: ToQwertyMap;
};
export const makeLayoutMap = <
  const PhysicalMap extends R.ReadonlyRecord<string, string>,
  const ToQwertyMap extends R.ReadonlyRecord<string, string>,
>(
  opts: MakeLayoutMapOptions<PhysicalMap, ToQwertyMap>
): {
  readonly physicalMap: PhysicalMap;
  readonly toQwerty: ToQwertyMap;
  readonly fromQwerty: RecordTypes.ReversedRecord<ToQwertyMap>;
} =>
  ({
    physicalMap: opts.physicalMap,
    toQwerty: opts.toQwerty,
    fromQwerty: RecordUtils.reverseRecord(opts.toQwerty),
  }) as const;

export const DvorakMap = makeLayoutMap({
  physicalMap: {
    KeyA: "a",
    KeyB: "x",
    KeyC: "j",
    KeyD: "e",
    KeyE: ".",
    KeyF: "u",
    KeyG: "i",
    KeyH: "d",
    KeyI: "c",
    KeyJ: "h",
    KeyK: "t",
    KeyL: "n",
    KeyM: "m",
    KeyN: "b",
    KeyO: "r",
    KeyP: "l",
    KeyQ: "'",
    KeyR: "p",
    KeyS: "o",
    KeyT: "k",
    KeyU: "g",
    KeyV: "q",
    KeyW: ",",
    KeyX: "z",
    KeyY: "f",
    KeyZ: ";",
    Semicolon: "s",
    Quote: "-",
    Comma: "w",
    Period: "v",
    Slash: "z",
    Minus: "[",
    BracketLeft: "/",
    BracketRight: "=",
    Equal: "]",
  },
  toQwerty: {
    a: "a",
    b: "x",
    c: "j",
    d: "e",
    e: ".",
    f: "u",
    g: "i",
    h: "d",
    i: "c",
    j: "h",
    k: "t",
    l: "n",
    m: "m",
    n: "b",
    o: "r",
    p: "l",
    q: "'",
    r: "p",
    s: "o",
    t: "k",
    u: "g",
    v: "q",
    w: ",",
    x: "z",
    y: "f",
    z: ";",
    ";": "s",
    "'": "-",
    ",": "w",
    ".": "v",
    "/": "z",
    "-": "[",
    "[": "/",
    "]": "=",
    "=": "]",
  },
});

export const ColemakMap = {
  physicalMap: {
    KeyD: "g",
    KeyE: "f",
    KeyF: "e",
    KeyG: "d",
    KeyI: "l",
    KeyJ: "u",
    KeyK: "y",
    KeyL: ";",
    KeyN: "k",
    KeyO: ";",
    KeyP: "r",
    KeyR: "s",
    KeyS: "r",
    KeyT: "g",
    KeyU: "l",
    KeyY: "j",
    Semicolon: "o",
  },
} as const;

export const AzertyMap = {
  physicalMap: {
    KeyA: "q",
    KeyQ: "a",
    KeyW: "z",
    KeyZ: "w",
    KeyM: ",",
    Comma: "m",
    Period: ";",
    Semicolon: ".",
    Digit1: "&",
    Digit2: "é",
    Digit3: '"',
    Digit4: "'",
    Digit5: "(",
    Digit6: "-",
    Digit7: "è",
    Digit8: "_",
    Digit9: "ç",
    Digit0: "à",
  },
} as const;

export const QwertzMap = {
  physicalMap: {
    KeyY: "z",
    KeyZ: "y",
    Semicolon: "ö",
    Quote: "ä",
    BracketLeft: "ü",
    BracketRight: "+",
    Backslash: "#",
    Minus: "ß",
    Equal: "´",
  },
} as const;

const physicalMaps = {
  ...QwertzMap.physicalMap,
  ...DvorakMap.physicalMap,
  ...ColemakMap.physicalMap,
  ...AzertyMap.physicalMap,
} as const;

export const getKeySet = <T extends { readonly physicalMap: R.ReadonlyRecord<string, string> }>({
  physicalMap,
}: T): A.NonEmptyReadonlyArray<T["physicalMap"][keyof T["physicalMap"]]> =>
  F.pipe(
    Struct.entries(physicalMap),
    ArrayUtils.NonEmptyReadonly.mapNonEmpty(([_, value]) => value),
    HashSet.fromIterable<T["physicalMap"][keyof T["physicalMap"]]>,
    HashSet.toValues,
    ArrayUtils.NonEmptyReadonly.assertNonEmpty
  );

export class DvorakKeyCode extends StringLiteralKit(...getKeySet(DvorakMap)).annotations(
  $I.annotations("DvorakKeyCode", {
    description: "All possible key codes for the Dvorak keyboard layout.",
  })
) {}

export declare namespace DvorakKeyCode {
  export type Type = typeof DvorakKeyCode.Type;
}

export class QwertzKeyCode extends StringLiteralKit(
  ...getKeySet({
    physicalMap: {
      ...DvorakMap.toQwerty,
    },
  } as const)
).annotations(
  $I.annotations("QwertzKeyCode", {
    description: "All possible key codes for the Qwertz keyboard layout.",
  })
) {}

export declare namespace QwertzKeyCode {
  export type Type = typeof QwertzKeyCode.Type;
}

export class ColemakKeyCode extends StringLiteralKit(...getKeySet(ColemakMap)).annotations(
  $I.annotations("ColemakKeyCode", {
    description: "All possible key codes for the Colemak keyboard layout.",
  })
) {}

export declare namespace ColemakKeyCode {
  export type Type = typeof ColemakKeyCode.Type;
}

export class AzertyKeyCode extends StringLiteralKit(...getKeySet(AzertyMap)).annotations(
  $I.annotations("AzertyKeyCode", {
    description: "All possible key codes for the Azerty keyboard layout.",
  })
) {}

export declare namespace AzertyKeyCode {
  export type Type = typeof AzertyKeyCode.Type;
}

export const KeySet = F.pipe(
  Struct.entries(physicalMaps),
  ArrayUtils.NonEmptyReadonly.mapNonEmpty(([_, value]) => value),
  HashSet.fromIterable<(typeof physicalMaps)[keyof typeof physicalMaps]>,
  HashSet.toValues,
  ArrayUtils.NonEmptyReadonly.assertNonEmpty
);

export class KeyCode extends StringLiteralKit(...KeySet).annotations(
  $I.annotations("KeyCode", {
    description: "All possible key codes for keyboard layouts.",
  })
) {}

export declare namespace KeyCode {
  export type Type = typeof KeyCode.Type;
}

export const getLayoutMapping = Match.type<KeyboardLayout.Type>().pipe(
  Match.when(KeyboardLayout.Enum.dvorak, thunk(DvorakMap.physicalMap)),
  Match.when(KeyboardLayout.Enum.colemak, thunk(ColemakMap.physicalMap)),
  Match.when(KeyboardLayout.Enum.qwertz, thunk(QwertzMap.physicalMap)),
  Match.when(KeyboardLayout.Enum.azerty, thunk(AzertyMap.physicalMap)),
  Match.orElse(thunkNull)
);

export class CommonKeyCodes extends StringLiteralKit(
  // Letters
  "KeyA",
  "KeyB",
  "KeyC",
  "KeyD",
  "KeyE",
  "KeyF",
  "KeyG",
  "KeyH",
  "KeyI",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyM",
  "KeyN",
  "KeyO",
  "KeyP",
  "KeyQ",
  "KeyR",
  "KeyS",
  "KeyT",
  "KeyU",
  "KeyV",
  "KeyW",
  "KeyX",
  "KeyY",
  "KeyZ",

  // Numbers
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "Digit5",
  "Digit6",
  "Digit7",
  "Digit8",
  "Digit9",
  "Digit0",

  // Special keys
  "Space",
  "Enter",
  "Escape",
  "Backspace",
  "Tab",

  // Modifiers
  "ShiftLeft",
  "ShiftRight",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight"
).annotations(
  $I.annotations("CommonKeyCodes", {
    description: "Common key codes for keyboard layouts.",
  })
) {}

export declare namespace CommonKeyCodes {
  export type Type = typeof CommonKeyCodes.Type;
}

export class LayoutByRegion extends MappedLiteralKit(
  ["fr", "azerty"],
  ["de", "qwertz"],
  ["at", "qwertz"],
  ["ch", "qwertz"]
).annotations(
  $I.annotations("LayoutByRegion", {
    description: "Maps region codes to their keyboard layout.",
  })
) {}

export declare namespace LayoutByRegion {
  export type Type = typeof LayoutByRegion.Type;
}

export const convertKey = (key: KeyCode.Type, fromLayout: KeyboardLayout.Type, toLayout: KeyboardLayout.Type) => {
  const normalizedKey = Str.toLowerCase(key);
  if (Eq.equals(fromLayout)(toLayout)) return normalizedKey;

  if (fromLayout === KeyboardLayout.Enum.dvorak && toLayout === KeyboardLayout.Enum.qwerty) {
    invariant(S.is(DvorakKeyCode)(normalizedKey), "not a dvorak key", {
      file: "@beep/common/schema/src/integrations/keyboard/keyboard-layout-map.ts",
      line: 394,
      args: [key],
    });
    return DvorakMap.toQwerty[normalizedKey];
  }

  if (fromLayout === KeyboardLayout.Enum.qwerty && toLayout === KeyboardLayout.Enum.dvorak) {
    return S.decodeUnknownOption(QwertzKeyCode)(normalizedKey).pipe(
      O.match({
        onNone: thunk(key),
        onSome: (key) => DvorakMap.fromQwerty[key],
      })
    );
  }

  // For other layouts, use physical mapping
  const fromMapping = getLayoutMapping(fromLayout);
  const toMapping = getLayoutMapping(toLayout);

  if (fromMapping && toMapping) {
    const physicalKeyOpt = F.pipe(
      Struct.entries(fromMapping),
      A.findFirst(([_, v]) => Str.toLowerCase(v) === normalizedKey),
      O.flatMap(A.head),
      O.map((k) => toMapping[k as keyof typeof toMapping])
    );

    if (O.isSome(physicalKeyOpt)) {
      return physicalKeyOpt.value;
    }

    return normalizedKey;
  }
  return normalizedKey;
};
