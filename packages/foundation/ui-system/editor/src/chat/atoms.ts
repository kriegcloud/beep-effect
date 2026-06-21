/**
 * Per-editor `@effect/atom` state and Lexical-binding atoms shared across the
 * chat composer surface (send, typeahead, footer). Per the repo atom-first law
 * the composer holds no React hook state: every piece of per-composer state is
 * an `Atom.family` keyed by the `LexicalEditor` instance, so multiple composers
 * on one page never share state and Lexical command/listener registrations are
 * torn down via atom finalizers (never `useEffect`).
 *
 * The atoms work without a `RegistryProvider` (the default global registry), so
 * the composer still renders in Storybook where no provider is mounted.
 *
 * @packageDocumentation \@beep/editor/chat/atoms
 * @since 0.0.0
 */

import { A, O } from "@beep/utils";
import { Effect, Layer } from "effect";
import { Atom } from "effect/unstable/reactivity";
import {
  $createParagraphNode,
  $getRoot,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
} from "lexical";
import { DEFAULT_MAX_ATTACHMENT_BYTES, fileToAttachment, revokeAttachment } from "./attachments.tsx";
import { SEND_MESSAGE_COMMAND } from "./commands.ts";
import { ComposerFeatures } from "./config.ts";
import type { LexicalEditor } from "lexical";
import type { ComposerAttachment } from "./attachments.tsx";

/**
 * Per-editor resolved {@link ComposerFeatures}. The composer writes the
 * defaults-filled features here; other atoms read `sendOn` and the flags from
 * it. Defaults to {@link ComposerFeatures.make} so an unmounted read is valid.
 *
 * @category atoms
 * @since 0.0.0
 */
export const featuresAtom = Atom.family((_editor: LexicalEditor) =>
  Atom.make<ComposerFeatures>(ComposerFeatures.make())
);

/**
 * Per-editor typeahead menu-open state. Tracked as idempotent booleans (not a
 * counter): the typeahead `onOpen` fires on every query change, so a `+1/-1`
 * counter would never rebalance.
 *
 * @category atoms
 * @since 0.0.0
 */
export const menusOpenAtom = Atom.family((_editor: LexicalEditor) =>
  Atom.make<{ readonly slash: boolean; readonly mention: boolean }>({ slash: false, mention: false })
);

/**
 * Per-editor derived flag: whether any typeahead menu is open. Subscribes to
 * {@link menusOpenAtom}.
 *
 * @category atoms
 * @since 0.0.0
 */
export const anyMenuOpenAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    const menus = get(menusOpenAtom(editor));
    return menus.slash || menus.mention;
  })
);

/**
 * Per-editor captured attachments. Writable; the composer pushes captured files
 * and revokes object URLs on removal/unmount.
 *
 * @category atoms
 * @since 0.0.0
 */
export const attachmentsAtom = Atom.family((_editor: LexicalEditor) =>
  Atom.make<ReadonlyArray<ComposerAttachment>>([])
);

/**
 * Per-editor max captured attachment size in bytes. Seeded from the composer's
 * `maxAttachmentBytes` prop so the capture runtime fns (picker + drag-drop) read
 * the same bound without threading it through React props. Defaults to
 * {@link DEFAULT_MAX_ATTACHMENT_BYTES}.
 *
 * @category atoms
 * @since 0.0.0
 */
export const maxAttachmentBytesAtom = Atom.family((_editor: LexicalEditor) =>
  Atom.make<number>(DEFAULT_MAX_ATTACHMENT_BYTES)
);

/**
 * Per-editor upload-port callback. The composer seeds the consumer's `onAttach`
 * here (once per mount); {@link captureAttachmentsFn} reads it at capture time
 * and notifies the app with the raw captured files. Defaults to a no-op so an
 * unseeded read is valid (e.g. in Storybook with no provider).
 *
 * @category atoms
 * @since 0.0.0
 */
export const onAttachAtom = Atom.family((_editor: LexicalEditor) =>
  Atom.make<(files: ReadonlyArray<File>) => void>(() => undefined)
);

/**
 * Captures the picked/dropped files within the size bound, dropping any that
 * exceed it ({@link fileToAttachment} returns `O.none()` for those).
 *
 * @category utilities
 * @since 0.0.0
 */
// Internal capture helper (not exported — keeps it off the public dual-arity
// surface; the runtime `captureAttachmentsFn` is the public capture entry).
const captureFiles = (files: ReadonlyArray<File>, maxBytes: number): ReadonlyArray<ComposerAttachment> =>
  A.getSomes(A.map(files, (file) => fileToAttachment(file, maxBytes)));

/**
 * The composer's `@effect/atom` runtime. Empty-layered: the composer's mutation
 * logic needs no services, only the `FnContext` to read/write the per-editor
 * atoms. Mutations are modeled as {@link Atom.runtime.fn} atoms so the
 * capture/remove *logic* lives in the runtime rather than in component handlers
 * (per the repo atom-first law).
 *
 * @category atoms
 * @since 0.0.0
 */
export const composerRuntime = Atom.runtime(Layer.empty);

/**
 * Capture-attachments mutation, modeled as a runtime `fn` atom. Writing
 * `{ editor, files }` runs the capture pipeline entirely inside the runtime: it
 * notifies the per-editor {@link onAttachAtom} upload-port with the raw files,
 * then appends the in-bound {@link captureFiles} results to
 * {@link attachmentsAtom}. The size bound is read from {@link maxAttachmentBytesAtom}.
 * Both the footer picker and the drag-drop binding drive this same path.
 *
 * @category atoms
 * @since 0.0.0
 */
export const captureAttachmentsFn = composerRuntime.fn<{
  readonly editor: LexicalEditor;
  readonly files: ReadonlyArray<File>;
}>()(({ editor, files }, get) =>
  Effect.sync(() => {
    if (A.isReadonlyArrayEmpty(files)) return;
    get(onAttachAtom(editor))(files);
    const captured = captureFiles(files, get(maxAttachmentBytesAtom(editor)));
    // `FnContext.set` writes a value (no updater form), so the append reads the
    // current attachments via `get` and writes the concatenated array.
    if (A.isReadonlyArrayNonEmpty(captured)) {
      get.set(attachmentsAtom(editor), [...get(attachmentsAtom(editor)), ...captured]);
    }
  })
);

/**
 * Remove-attachment mutation, modeled as a runtime `fn` atom. Writing
 * `{ editor, id }` revokes the removed attachment's object URL (if found) and
 * filters it out of {@link attachmentsAtom}, entirely inside the runtime.
 *
 * @category atoms
 * @since 0.0.0
 */
export const removeAttachmentFn = composerRuntime.fn<{
  readonly editor: LexicalEditor;
  readonly id: string;
}>()(({ editor, id }, get) =>
  Effect.sync(() => {
    const previous = get(attachmentsAtom(editor));
    O.match(
      A.findFirst(previous, (attachment) => attachment.id === id),
      { onNone: () => undefined, onSome: revokeAttachment }
    );
    get.set(
      attachmentsAtom(editor),
      A.filter(previous, (attachment) => attachment.id !== id)
    );
  })
);

/**
 * Lexical editor-error sink, modeled as a runtime `fn` atom so the failure logs
 * through the Effect runtime rather than `Effect.runSync` in the editor's config
 * callback. `ChatComposer` wires `initialConfig.onError` to dispatch this via
 * `useAtomSet`, so editor errors are observed (not swallowed) while staying
 * within the atom-first law.
 *
 * @category atoms
 * @since 0.0.0
 */
export const logEditorErrorFn = composerRuntime.fn<Error>()((error) =>
  Effect.logError("ChatComposer Lexical editor error", error)
);

/**
 * Per-editor live character count of the editor's plain text. The read fn
 * registers a Lexical update listener (torn down via the atom finalizer) and
 * pushes the new length with `get.setSelf` on every change.
 *
 * @category atoms
 * @since 0.0.0
 */
export const characterCountAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    get.addFinalizer(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => get.setSelf($getRoot().getTextContent().length));
      })
    );
    return editor.getEditorState().read(() => $getRoot().getTextContent().length);
  })
);

/**
 * Per-editor Enter-to-send key binding. The read fn registers
 * `KEY_ENTER_COMMAND` at `COMMAND_PRIORITY_HIGH` (torn down via the atom
 * finalizer) and applies the configured send policy:
 *
 * - bail when a typeahead menu is open (the lower-priority menu takes Enter),
 * - bail during IME composition (`isComposing` / keyCode 229),
 * - `sendOn="enter"` ⇒ plain Enter sends (any modifier inserts a newline),
 * - `sendOn="modifierEnter"` ⇒ Cmd/Ctrl+Enter sends (plain Enter newlines).
 *
 * The send policy and menu-open flag are read with `get.once` inside the
 * handler so toggling either never re-registers the command.
 *
 * @category atoms
 * @since 0.0.0
 */
export const sendKeyBindingAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    get.addFinalizer(
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (event === null) return false;
          if (get.once(anyMenuOpenAtom(editor))) return false;
          // IME guard: never send mid-composition (`isComposing` is the modern,
          // well-supported signal; the legacy `keyCode === 229` fallback is dropped
          // as deprecated).
          if (event.isComposing) return false;
          const sendOn = get.once(featuresAtom(editor)).sendOn;
          const hasModifier = event.ctrlKey || event.metaKey;
          const send = sendOn === "enter" ? !event.shiftKey && !event.altKey && !hasModifier : hasModifier;
          if (!send) return false;
          event.preventDefault();
          editor.dispatchCommand(SEND_MESSAGE_COMMAND, undefined);
          return true;
        },
        COMMAND_PRIORITY_HIGH
      )
    );
    return undefined;
  })
);

/**
 * Boxed send handler. Function values are boxed so the backing atom is a
 * writable state atom (a bare function initial value makes `Atom.make` build a
 * derived read atom instead).
 *
 * @category models
 * @since 0.0.0
 */
export interface SendHandlerBox {
  readonly run: () => boolean | void;
}

/**
 * Per-editor convenience send handler. `run` returns `true` to signal a turn was
 * dispatched (the binding then clears the editor in place). The composer writes
 * the consumer's `onSend` here; the default is a no-op that reports no dispatch.
 *
 * @category atoms
 * @since 0.0.0
 */
export const onSendAtom = Atom.family((_editor: LexicalEditor) => Atom.make<SendHandlerBox>({ run: () => undefined }));

/**
 * Per-editor `SEND_MESSAGE_COMMAND` handler registered at
 * `COMMAND_PRIORITY_LOW`. On send it invokes the per-editor {@link onSendAtom};
 * when that reports `true` the editor is cleared in place — `$getRoot().clear()`
 * then a fresh empty paragraph re-selected — keeping focus and a valid
 * selection (`registerRichText` does not handle `CLEAR_EDITOR_COMMAND`).
 *
 * @category atoms
 * @since 0.0.0
 */
export const sendCommandBindingAtom = Atom.family((editor: LexicalEditor) =>
  Atom.make((get) => {
    get.addFinalizer(
      editor.registerCommand(
        SEND_MESSAGE_COMMAND,
        () => {
          if (get.once(onSendAtom(editor)).run() === true) {
            editor.update(() => {
              const root = $getRoot();
              root.clear();
              const paragraph = $createParagraphNode();
              root.append(paragraph);
              paragraph.select();
            });
          }
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
    return undefined;
  })
);
