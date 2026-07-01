/**
 * Feature-flagged chat composer surface for `@beep/editor`: the generic
 * mechanism (config, commands, toolbar, slash/mention typeahead menus, attachment
 * capture, send/character-count) that an app configures and injects product
 * meaning into. The bare `EditorComposer` remains for non-chat consumers.
 *
 * @packageDocumentation \@beep/editor/chat
 * @since 0.0.0
 */

export * from "./atoms.ts";
export * from "./attachment-model.ts";
export * from "./attachments.tsx";
export * from "./chat-composer.tsx";
export * from "./commands.ts";
export * from "./config.ts";
export * from "./send.tsx";
export * from "./slash-items.tsx";
export * from "./toolbar.tsx";
export * from "./typeahead.tsx";
