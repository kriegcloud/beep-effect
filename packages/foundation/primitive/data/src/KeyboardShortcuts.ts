/**
 * Curated keyboard shortcut constants for common app and desktop commands.
 *
 * The canonical shortcut value follows WAI-ARIA `aria-keyshortcuts` and W3C
 * UI Events key names. Platform display labels and Tauri accelerator strings
 * are carried as separate fields because UI text and runtime registration have
 * different compatibility constraints.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as internal from "./internal/data/keyboard-shortcuts.ts";

// -------------------------------------------------------------------------------------
// types
// -------------------------------------------------------------------------------------

/**
 * Supported shortcut platform identifiers.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutPlatform } from "@beep/data/KeyboardShortcuts"
 *
 * const platform: KeyboardShortcutPlatform = "macos"
 * console.log(platform)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutPlatform = (typeof internal.KeyboardShortcutPlatformValues)[number];

/**
 * Shortcut scope identifiers.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutScope } from "@beep/data/KeyboardShortcuts"
 *
 * const scope: KeyboardShortcutScope = "app"
 * console.log(scope)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutScope = (typeof internal.KeyboardShortcutScopeValues)[number];

/**
 * Runtime registration support status for a shortcut chord.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutRuntimeSupport } from "@beep/data/KeyboardShortcuts"
 *
 * const support: KeyboardShortcutRuntimeSupport = "supported"
 * console.log(support)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutRuntimeSupport = (typeof internal.KeyboardShortcutRuntimeSupportValues)[number];

/**
 * Shortcut category identifiers used for grouping command rows.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutCategory } from "@beep/data/KeyboardShortcuts"
 *
 * const category: KeyboardShortcutCategory = "clipboard"
 * console.log(category)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutCategory = (typeof internal.KeyboardShortcutCategoryValues)[number];

/**
 * Source metadata entry for a curated shortcut reference.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutSourceValues, type KeyboardShortcutSource } from "@beep/data/KeyboardShortcuts"
 *
 * const source: KeyboardShortcutSource = KeyboardShortcutSourceValues[0]
 * console.log(source.url)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutSource = (typeof internal.KeyboardShortcutSourceValues)[number];

/**
 * Source identifier used by shortcut data rows.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutSourceId } from "@beep/data/KeyboardShortcuts"
 *
 * const sourceId: KeyboardShortcutSourceId = "appleMacKeyboardShortcuts"
 * console.log(sourceId)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutSourceId = KeyboardShortcutSource["id"];

/**
 * Lower-camel command name used as the stable shortcut command id.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutCommandName } from "@beep/data/KeyboardShortcuts"
 *
 * const name: KeyboardShortcutCommandName = "copy"
 * console.log(name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutCommandName = (typeof internal.KeyboardShortcutCommandNameValues)[number];

/**
 * PascalCase command label derived from a shortcut command name.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutCommandLabel } from "@beep/data/KeyboardShortcuts"
 *
 * const label: KeyboardShortcutCommandLabel = "Copy"
 * console.log(label)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutCommandLabel = (typeof internal.KeyboardShortcutCommandLabelValues)[number];

/**
 * A platform-specific shortcut chord for one command.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutDataValues, type KeyboardShortcutChordData } from "@beep/data/KeyboardShortcuts"
 *
 * const chord: KeyboardShortcutChordData = KeyboardShortcutDataValues[0].shortcuts[0]
 * console.log(chord.value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutChordData = (typeof internal.KeyboardShortcutDataValues)[number]["shortcuts"][number];

/**
 * Canonical WAI-ARIA/UI Events shortcut literal.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutValue } from "@beep/data/KeyboardShortcuts"
 *
 * const shortcut: KeyboardShortcutValue = "Meta+C"
 * console.log(shortcut)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutValue = KeyboardShortcutChordData["value"];

/**
 * Platform display literal for rendering a shortcut hint.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutDisplay } from "@beep/data/KeyboardShortcuts"
 *
 * const display: KeyboardShortcutDisplay = "⌘C"
 * console.log(display)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutDisplay = KeyboardShortcutChordData["display"];

/**
 * Tauri/muda accelerator literal for chords that can be represented at runtime.
 *
 * @example
 * ```typescript
 * import type { KeyboardShortcutTauriAccelerator } from "@beep/data/KeyboardShortcuts"
 *
 * const accelerator: KeyboardShortcutTauriAccelerator = "Cmd+C"
 * console.log(accelerator)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutTauriAccelerator = Extract<
  KeyboardShortcutChordData,
  { readonly tauriAccelerator: string }
>["tauriAccelerator"];

/**
 * A curated shortcut command row for a single platform and command name.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutDataValues, type KeyboardShortcutData } from "@beep/data/KeyboardShortcuts"
 *
 * const entry: KeyboardShortcutData = KeyboardShortcutDataValues[0]
 * console.log(entry.name)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type KeyboardShortcutData = (typeof internal.KeyboardShortcutDataValues)[number];

// -------------------------------------------------------------------------------------
// constants
// -------------------------------------------------------------------------------------

/**
 * Supported shortcut platform identifiers.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutPlatformValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutPlatformValues)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutPlatformValues: typeof internal.KeyboardShortcutPlatformValues =
  internal.KeyboardShortcutPlatformValues;

/**
 * Shortcut scope identifiers.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutScopeValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutScopeValues)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutScopeValues: typeof internal.KeyboardShortcutScopeValues =
  internal.KeyboardShortcutScopeValues;

/**
 * Runtime registration support statuses.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutRuntimeSupportValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutRuntimeSupportValues)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutRuntimeSupportValues: typeof internal.KeyboardShortcutRuntimeSupportValues =
  internal.KeyboardShortcutRuntimeSupportValues;

/**
 * Shortcut category identifiers.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutCategoryValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutCategoryValues)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutCategoryValues: typeof internal.KeyboardShortcutCategoryValues =
  internal.KeyboardShortcutCategoryValues;

/**
 * Source metadata for curated shortcut references.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutSourceValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutSourceValues[0].publisher)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutSourceValues: typeof internal.KeyboardShortcutSourceValues =
  internal.KeyboardShortcutSourceValues;

/**
 * Stable shortcut command names.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutCommandNameValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutCommandNameValues[0])
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutCommandNameValues: typeof internal.KeyboardShortcutCommandNameValues =
  internal.KeyboardShortcutCommandNameValues;

/**
 * PascalCase shortcut command labels.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutCommandLabelValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(KeyboardShortcutCommandLabelValues[0])
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutCommandLabelValues: typeof internal.KeyboardShortcutCommandLabelValues =
  internal.KeyboardShortcutCommandLabelValues;

/**
 * macOS shortcut command data.
 *
 * @example
 * ```typescript
 * import { MacOSKeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(MacOSKeyboardShortcutDataValues[0].platform)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const MacOSKeyboardShortcutDataValues: typeof internal.MacOSKeyboardShortcutDataValues =
  internal.MacOSKeyboardShortcutDataValues;

/**
 * Windows shortcut command data.
 *
 * @example
 * ```typescript
 * import { WindowsKeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(WindowsKeyboardShortcutDataValues[0].platform)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const WindowsKeyboardShortcutDataValues: typeof internal.WindowsKeyboardShortcutDataValues =
  internal.WindowsKeyboardShortcutDataValues;

/**
 * Portable Linux app shortcut defaults where GNOME and KDE broadly agree.
 *
 * @example
 * ```typescript
 * import { LinuxKeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(LinuxKeyboardShortcutDataValues[0].platform)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const LinuxKeyboardShortcutDataValues: typeof internal.LinuxKeyboardShortcutDataValues =
  internal.LinuxKeyboardShortcutDataValues;

/**
 * GNOME-specific app and shell shortcut defaults.
 *
 * @example
 * ```typescript
 * import { LinuxGnomeKeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(LinuxGnomeKeyboardShortcutDataValues[0].platform)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const LinuxGnomeKeyboardShortcutDataValues: typeof internal.LinuxGnomeKeyboardShortcutDataValues =
  internal.LinuxGnomeKeyboardShortcutDataValues;

/**
 * KDE Plasma and KStandardShortcut defaults.
 *
 * @example
 * ```typescript
 * import { LinuxKdePlasmaKeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * console.log(LinuxKdePlasmaKeyboardShortcutDataValues[0].platform)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const LinuxKdePlasmaKeyboardShortcutDataValues: typeof internal.LinuxKdePlasmaKeyboardShortcutDataValues =
  internal.LinuxKdePlasmaKeyboardShortcutDataValues;

/**
 * Combined shortcut command data across all supported platform datasets.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcutDataValues } from "@beep/data/KeyboardShortcuts"
 *
 * const firstShortcut = KeyboardShortcutDataValues[0]
 * console.log(firstShortcut.label)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const KeyboardShortcutDataValues: typeof internal.KeyboardShortcutDataValues =
  internal.KeyboardShortcutDataValues;
