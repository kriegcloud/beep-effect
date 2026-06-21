/**
 * Feature-flagged chat composer surface for `@beep/editor`: the generic
 * mechanism (config, commands, toolbar, slash/mention typeahead menus, attachment
 * capture, send/character-count) that an app configures and injects product
 * meaning into. The bare `EditorComposer` remains for non-chat consumers.
 *
 * @packageDocumentation \@beep/editor/chat
 * @since 0.0.0
 */

/**
 * Per-editor `@effect/atom` state and Lexical-binding atoms.
 *
 * @example
 * ```ts
 * import { menusOpenAtom } from "@beep/editor/chat"
 *
 * console.log(typeof menusOpenAtom) // "function"
 * ```
 *
 * @since 0.0.0
 * @category atoms
 */
export * from "./atoms.ts";
/**
 * The pure attachment model: `ComposerAttachment`, capture validation, and
 * object-URL helpers (no atom/React deps).
 *
 * @example
 * ```ts
 * import { isImageAttachment } from "@beep/editor/chat"
 *
 * console.log(typeof isImageAttachment) // "function"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./attachment-model.ts";
/**
 * Attachment capture binding + components (drag-drop, plugin, chip strip).
 *
 * @example
 * ```ts
 * import { AttachmentChips } from "@beep/editor/chat"
 *
 * console.log(AttachmentChips.name) // "AttachmentChips"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./attachments.tsx";
/**
 * The `ChatComposer` component.
 *
 * @example
 * ```ts
 * import { ChatComposer } from "@beep/editor/chat"
 *
 * console.log(ChatComposer.name) // "ChatComposer"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./chat-composer.tsx";
/**
 * Send / stop Lexical commands.
 *
 * @example
 * ```ts
 * import { SEND_MESSAGE_COMMAND } from "@beep/editor/chat"
 *
 * console.log(SEND_MESSAGE_COMMAND.type) // "SEND_MESSAGE_COMMAND"
 * ```
 *
 * @since 0.0.0
 * @category commands
 */
export * from "./commands.ts";
/**
 * Feature-flag config and product-injection types.
 *
 * @example
 * ```ts
 * import { defaultChatFeatures } from "@beep/editor/chat"
 *
 * console.log(defaultChatFeatures.sendOn) // "enter"
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./config.ts";
/**
 * Enter-to-send plugin and character-count hook.
 *
 * @example
 * ```ts
 * import { useCharacterCount } from "@beep/editor/chat"
 *
 * console.log(typeof useCharacterCount) // "function"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./send.tsx";
/**
 * The default formatting / insert `/` command set.
 *
 * @example
 * ```ts
 * import { defaultChatSlashItems } from "@beep/editor/chat"
 *
 * console.log(defaultChatSlashItems.length > 0) // true
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export * from "./slash-items.tsx";
/**
 * The fixed formatting toolbar plugin.
 *
 * @example
 * ```ts
 * import { FixedToolbarPlugin } from "@beep/editor/chat"
 *
 * console.log(FixedToolbarPlugin.name) // "FixedToolbarPlugin"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./toolbar.tsx";
/**
 * Slash / mention typeahead plugins and combobox ARIA wiring.
 *
 * @example
 * ```ts
 * import { SlashPlugin } from "@beep/editor/chat"
 *
 * console.log(SlashPlugin.name) // "SlashPlugin"
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./typeahead.tsx";
