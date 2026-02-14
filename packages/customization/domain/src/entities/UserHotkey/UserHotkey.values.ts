import { $CustomizationDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $CustomizationDomainId.create("entities/UserHotkey/UserHotkey.values");

export class ReservedModifierKeyword extends BS.StringLiteralKit(
  "shift",
  "alt",
  "meta",
  "mod",
  "ctrl",
  "control"
).annotations(
  $I.annotations("ReservedModifierKeyword", {
    description:
      "Reserved modifier keywords used in hotkey definitions. These represent the standard keyboard modifiers that can be combined with other keys to create keyboard shortcuts.",
  })
) {}

export declare namespace ReservedModifierKeyword {
  export type Type = typeof ReservedModifierKeyword.Type;
}

export class MappedKeyAccessor extends BS.StringLiteralKit(
  "esc",
  "return",
  "left",
  "right",
  "up",
  "down",
  "ShiftLeft",
  "ShiftRight",
  "AltLeft",
  "AltRight",
  "MetaLeft",
  "MetaRight",
  "OSLeft",
  "OSRight",
  "ControlLeft",
  "ControlRight"
).annotations(
  $I.annotations("MappedKeyAccessor", {
    description:
      "Accessor keys that map to normalized keyboard key names. These represent the raw key identifiers from keyboard events that get translated to their canonical MappedKey equivalents.",
  })
) {}

export declare namespace MappedKeyAccessor {
  export type Type = typeof MappedKeyAccessor.Type;
}

export class MappedKey extends BS.StringLiteralKit(
  "escape",
  "enter",
  "arrowleft",
  "arrowright",
  "arrowup",
  "arrowdown",
  "shift",
  "alt",
  "meta",
  "ctrl"
).annotations(
  $I.annotations("MappedKey", {
    description: "Mapped key values that represent normalized keyboard key names.",
  })
) {}

export declare namespace MappedKey {
  export type Type = typeof MappedKey.Type;
}

export const mappedKeys = {
  esc: "escape",
  return: "enter",
  left: "arrowleft",
  right: "arrowright",
  up: "arrowup",
  down: "arrowdown",
  ShiftLeft: "shift",
  ShiftRight: "shift",
  AltLeft: "alt",
  AltRight: "alt",
  MetaLeft: "meta",
  MetaRight: "meta",
  OSLeft: "meta",
  OSRight: "meta",
  ControlLeft: "ctrl",
  ControlRight: "ctrl",
} as const;

export class FormTag extends BS.StringLiteralKit(
  "input",
  "textarea",
  "select",
  "INPUT",
  "TEXTAREA",
  "searchbox",
  "slider",
  "spinbutton",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "textbox"
).annotations(
  $I.annotations("FormTag", {
    description:
      "HTML form element tag names and ARIA roles that represent interactive input controls - used to determine when hotkeys should be suppressed to allow normal text input behavior.",
  })
) {}

export declare namespace FormTag {
  export type Type = typeof FormTag.Type;
}

export const RecordStringUnknown = S.Record({ key: S.String, value: S.Unknown });
export const StringOrArrayOfStrings = S.Union(S.String, S.Array(S.String));

export class Keys extends StringOrArrayOfStrings.annotations(
  $I.annotations("Keys", {
    description: "Keys.",
  })
) {}

export declare namespace Keys {
  export type Type = typeof Keys.Type;
}

export class Scopes extends StringOrArrayOfStrings.annotations(
  $I.annotations("Scopes", {
    description:
      "Scopes define where a hotkey is active - can be a single scope string or an array of scope strings to limit hotkey activation to specific contexts or areas of the application.",
  })
) {}

export declare namespace Scopes {
  export type Type = typeof Scopes.Type;
}

export class EventListenerOptionsObject extends S.Class<EventListenerOptionsObject>($I`EventListenerOptionsObject`)(
  {
    capture: S.optionalWith(S.Boolean, { as: "Option" }),
    once: S.optionalWith(S.Boolean, { as: "Option" }),
    passive: S.optionalWith(S.Boolean, { as: "Option" }),
    signal: S.optionalWith(S.instanceOf(AbortSignal), { as: "Option" }),
  },
  $I.annotations("EventListenerOptionsObject", {
    description:
      "Event listener options object with optional capture, once, passive, and abort signal properties for fine-grained control over event handling behavior.",
  })
) {}

export class EventListenerOptions extends S.Union(EventListenerOptionsObject, S.Boolean).annotations(
  $I.annotations("EventListenerOptions", {
    description:
      "Event listener options - can be a boolean for capture mode or an object with detailed options including capture, once, passive, and abort signal.",
  })
) {}

export declare namespace EventListenerOptions {
  export type Type = typeof EventListenerOptions.Type;
}

export class KeyboardModifiers extends S.Class<KeyboardModifiers>($I`KeyboardModifiers`)(
  {
    alt: S.optional(S.Boolean),
    ctrl: S.optional(S.Boolean),
    meta: S.optional(S.Boolean),
    shift: S.optional(S.Boolean),
    mod: S.optional(S.Boolean),
    useKey: S.optional(S.Boolean),
  },
  $I.annotations("KeyboardModifiers", {
    description:
      "Keyboard modifier keys configuration for hotkey bindings. Supports alt, ctrl, meta (Command/Windows), shift, and mod (platform-aware: Command on macOS, Ctrl on Windows/Linux).",
  })
) {}

export class HotkeyParseOptions extends S.Class<HotkeyParseOptions>($I`HotKeyParseOptions`)(
  {
    hotkey: S.String,
    splitKey: S.optionalWith(S.String, { default: () => "+" }),
    sequenceSplitKey: S.optionalWith(S.String, { default: () => ">" }),
    useKey: S.optionalWith(S.Boolean, { default: () => false }),
    description: S.optionalWith(S.String, { as: "Option" }),
    metadata: S.optionalWith(RecordStringUnknown, { as: "Option" }),
  },
  $I.annotations("HotkeyParseOptions", {
    description: "Hotkey parse options - used to configure the behavior of the hotkey parser.",
  })
) {}

export class Hotkey extends KeyboardModifiers.extend<Hotkey>($I`Hotkey`)(
  {
    keys: S.optionalWith(S.Array(S.Trimmed), { as: "Option" }),
    scopes: S.optionalWith(Scopes, { as: "Option" }),
    description: S.optionalWith(S.String, { as: "Option" }),
    isSequence: S.optionalWith(S.Boolean, { as: "Option" }),
    hotkey: S.String,
    metadata: S.optionalWith(RecordStringUnknown, { as: "Option" }),
  },
  $I.annotations("Hotkey", {
    description:
      "Hotkey configuration with keyboard modifiers, key bindings, and optional metadata for customizable keyboard shortcuts.",
  })
) {
  static readonly mapCode = (key: string) => {
    const normalizedKey = Str.trim(key);

    return pipe(
      normalizedKey,
      O.liftPredicate(S.is(MappedKeyAccessor)),
      O.match({
        onNone: () => normalizedKey,
        onSome: (mappedKey) => mappedKeys[mappedKey],
      }),
      Str.toLowerCase,
      Str.replace(/key|digit|numpad/, "")
    );
  };

  static readonly isHotkeyModifier = S.is(ReservedModifierKeyword);

  static readonly parseKeysHookInput = (keys: string, delimiter = ","): ReadonlyArray<string> =>
    pipe(keys, Str.toLowerCase, Str.split(delimiter));

  static readonly parse = Effect.fn(function* (options: typeof HotkeyParseOptions.Encoded) {
    const { hotkey, sequenceSplitKey, splitKey, useKey, metadata, description } =
      yield* S.decode(HotkeyParseOptions)(options);

    const { keys, isSequence } = pipe(
      hotkey,
      O.liftPredicate(Str.includes(sequenceSplitKey)),
      O.match({
        onNone: () => ({
          isSequence: false,
          keys: pipe(hotkey, Str.toLocaleLowerCase(), Str.split(splitKey), A.map(Hotkey.mapCode)),
        }),
        onSome: () => ({
          isSequence: true,
          keys: pipe(
            hotkey,
            Str.toLocaleLowerCase(),
            Str.split(sequenceSplitKey),
            A.map((key) => Hotkey.mapCode(key))
          ),
        }),
      })
    );

    const containsModifier = (key: string) => A.contains(keys, key);

    const modifiers = new KeyboardModifiers({
      alt: containsModifier("alt"),
      ctrl: containsModifier("ctrl") || containsModifier("control"),
      meta: containsModifier("meta"),
      shift: containsModifier("shift"),
      mod: containsModifier("mod"),
      useKey,
    });

    const singleCharKeys = pipe(keys, A.filter(P.not(S.is(ReservedModifierKeyword))));

    return new Hotkey({
      ...modifiers,
      keys: O.some(singleCharKeys),
      isSequence: O.some(isSequence),
      hotkey,
      metadata,
      description,
      scopes: O.none(),
    });
  });
}
