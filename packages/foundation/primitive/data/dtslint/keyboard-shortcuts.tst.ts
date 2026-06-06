import { KeyboardShortcutDataValues, KeyboardShortcutPlatformValues } from "@beep/data/KeyboardShortcuts";
import { describe, expect, it } from "tstyche";
import type {
  KeyboardShortcutCommandLabel,
  KeyboardShortcutCommandName,
  KeyboardShortcutData,
  KeyboardShortcutDisplay,
  KeyboardShortcutPlatform,
  KeyboardShortcutRuntimeSupport,
  KeyboardShortcutSourceId,
  KeyboardShortcutTauriAccelerator,
  KeyboardShortcutValue,
} from "@beep/data/KeyboardShortcuts";

describe("KeyboardShortcuts", () => {
  it("exports platform literal values", () => {
    expect(KeyboardShortcutPlatformValues).type.toBe<
      readonly ["macos", "windows", "linux", "linuxGnome", "linuxKdePlasma"]
    >();
    expect<"macos">().type.toBeAssignableTo<KeyboardShortcutPlatform>();
    expect<"linuxGnome">().type.toBeAssignableTo<KeyboardShortcutPlatform>();
    expect<"ios">().type.not.toBeAssignableTo<KeyboardShortcutPlatform>();
  });

  it("exports command name and PascalCase label literals", () => {
    expect<"copy">().type.toBeAssignableTo<KeyboardShortcutCommandName>();
    expect<"pasteAndMatchStyle">().type.toBeAssignableTo<KeyboardShortcutCommandName>();
    expect<"Copy">().type.toBeAssignableTo<KeyboardShortcutCommandLabel>();
    expect<"PasteAndMatchStyle">().type.toBeAssignableTo<KeyboardShortcutCommandLabel>();
    expect<"paste and match style">().type.not.toBeAssignableTo<KeyboardShortcutCommandLabel>();
  });

  it("distinguishes canonical shortcut values from display strings", () => {
    expect<"Meta+C">().type.toBeAssignableTo<KeyboardShortcutValue>();
    expect<"Control+C">().type.toBeAssignableTo<KeyboardShortcutValue>();
    expect<"Ctrl+C">().type.not.toBeAssignableTo<KeyboardShortcutValue>();
    expect<"⌘C">().type.toBeAssignableTo<KeyboardShortcutDisplay>();
    expect<"Ctrl+C">().type.toBeAssignableTo<KeyboardShortcutDisplay>();
  });

  it("exports Tauri accelerator and runtime support literals", () => {
    expect<"Cmd+C">().type.toBeAssignableTo<KeyboardShortcutTauriAccelerator>();
    expect<"Ctrl+C">().type.toBeAssignableTo<KeyboardShortcutTauriAccelerator>();
    expect<"Command-C">().type.not.toBeAssignableTo<KeyboardShortcutTauriAccelerator>();
    expect<"supported">().type.toBeAssignableTo<KeyboardShortcutRuntimeSupport>();
    expect<"layoutSensitive">().type.toBeAssignableTo<KeyboardShortcutRuntimeSupport>();
  });

  it("exports source identifiers and row data types", () => {
    expect<"appleMacKeyboardShortcuts">().type.toBeAssignableTo<KeyboardShortcutSourceId>();
    expect<"mudaAccelerator">().type.toBeAssignableTo<KeyboardShortcutSourceId>();
    expect<"randomBlogPost">().type.not.toBeAssignableTo<KeyboardShortcutSourceId>();
    expect(KeyboardShortcutDataValues[0]).type.toBeAssignableTo<KeyboardShortcutData>();
  });
});
