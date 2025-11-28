import { isKeyHotkey } from "is-hotkey";
import type { KeyboardEvent } from "react";

import { IS_APPLE } from "./environment";

/** Hotkey mappings for each platform. */
const HOTKEYS = {
  bold: "mod+b",
  cmdk: "mod+k",
  compose: ["down", "left", "right", "up", "backspace", "enter"],
  deleteBackward: "shift?+backspace",
  deleteForward: "shift?+delete",
  down: "down",
  enter: "enter",
  escape: "escape",
  extendBackward: "shift+left",
  extendForward: "shift+right",
  insertSoftBreak: "shift+enter",
  italic: "mod+i",
  modEnter: "mod+enter",
  moveBackward: "left",
  moveForward: "right",
  moveWordBackward: "ctrl+left",
  moveWordForward: "ctrl+right",
  save: "mod+s",
  space: "space",
  splitBlock: "enter",
  tab: "tab",
  undo: "mod+z",
  untab: "shift+tab",
  up: "up",
};

const APPLE_HOTKEYS = {
  deleteBackward: ["ctrl+backspace", "ctrl+h"],
  deleteForward: ["ctrl+delete", "ctrl+d"],
  deleteLineBackward: "cmd+shift?+backspace",
  deleteLineForward: ["cmd+shift?+delete", "ctrl+k"],
  deleteWordBackward: "opt+shift?+backspace",
  deleteWordForward: "opt+shift?+delete",
  extendLineBackward: "opt+shift+up",
  extendLineForward: "opt+shift+down",
  moveLineBackward: "opt+up",
  moveLineForward: "opt+down",
  moveWordBackward: "opt+left",
  moveWordForward: "opt+right",
  redo: "cmd+shift+z",
  transposeCharacter: "ctrl+t",
};

const WINDOWS_HOTKEYS = {
  deleteWordBackward: "ctrl+shift?+backspace",
  deleteWordForward: "ctrl+shift?+delete",
  redo: ["ctrl+y", "ctrl+shift+z"],
};

/** Create a platform-aware hotkey checker. */

const create = (key: string) => {
  const generic = (HOTKEYS as any)[key];
  const apple = (APPLE_HOTKEYS as any)[key];
  const windows = (WINDOWS_HOTKEYS as any)[key];
  const isGeneric = generic && isKeyHotkey(generic);
  const isApple = apple && isKeyHotkey(apple);
  const isWindows = windows && isKeyHotkey(windows);

  return (event: KeyboardEvent) => {
    if (isGeneric?.(event)) return true;
    if (IS_APPLE && isApple?.(event)) return true;
    if (!IS_APPLE && isWindows?.(event)) return true;

    return false;
  };
};

export const Keys = {
  isBold: create("bold"),
  isCmdk: create("cmdk"),
  isCompose: create("compose"),
  isDeleteBackward: create("deleteBackward"),
  isDeleteForward: create("deleteForward"),
  isDeleteLineBackward: create("deleteLineBackward"),
  isDeleteLineForward: create("deleteLineForward"),
  isDeleteWordBackward: create("deleteWordBackward"),
  isDeleteWordForward: create("deleteWordForward"),
  isEnter: create("enter"),
  isEscape: create("escape"),
  isExtendBackward: create("extendBackward"),
  isExtendForward: create("extendForward"),
  isExtendLineBackward: create("extendLineBackward"),
  isExtendLineForward: create("extendLineForward"),
  isItalic: create("italic"),
  isModEnter: create("modEnter"),
  isMoveBackward: create("moveBackward"),
  isMoveForward: create("moveForward"),
  isMoveLineBackward: create("moveLineBackward"),
  isMoveLineForward: create("moveLineForward"),
  isMoveWordBackward: create("moveWordBackward"),
  isMoveWordForward: create("moveWordForward"),
  isRedo: create("redo"),
  isSave: create("save"),
  isSoftBreak: create("insertSoftBreak"),
  isSpace: create("space"),
  isSplitBlock: create("splitBlock"),
  isTransposeCharacter: create("transposeCharacter"),
  isUndo: create("undo"),
};
