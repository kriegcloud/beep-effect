/**
 * Chat composer: an editable rich-text surface that sends or edit-regenerates
 * an assistant turn.
 *
 * Wraps `@beep/editor`'s {@link EditorComposer}. Because the composer only
 * surfaces its content via `onSerializedChange` (it exposes no imperative editor
 * handle), the latest serialized state is held in a ref and the persisted draft
 * is mirrored into {@link draftAtoms} on every change. Loading a draft or an
 * {@link editTargetAtom} content into the editor is done by recomputing the
 * `initialState` and remounting the composer via a changing `key`.
 *
 * On submit the serialized state is projected to a `@beep/md` document via
 * {@link editorStateToDocument} and dispatched through {@link runTurnAtom} as a
 * {@link SendTurnRequest} (new message) or {@link EditTurnRequest} (when an edit
 * target is set). Ctrl/Cmd+Enter sends; the send control is disabled while a
 * turn is streaming.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */
"use client";

import {
  draftAtoms,
  EditTurnRequest,
  editTargetAtom,
  reportDecodeFailureAtom,
  runTurnAtom,
  SendTurnRequest,
  streamingTurnAtom,
} from "@beep/agents-client/Chat.atoms";
import { EditorComposer } from "@beep/editor";
import { documentToEditorState, editorStateToDocument } from "@beep/lexical-schema";
import { Button } from "@beep/ui/components/button";
import { A, O } from "@beep/utils";
import { useAtomMount, useAtomSet, useAtomValue } from "@effect/atom-react";
import { Effect, Exit } from "effect";
import { useCallback, useMemo, useRef } from "react";
import type { SerializedEditorState } from "@beep/lexical-schema";
import type * as Md from "@beep/md/Md.model";
import type * as WorkspaceIdentity from "@beep/shared-domain/identity/Workspace";
import type { JSX, KeyboardEvent } from "react";

type ThreadId = WorkspaceIdentity.ThreadId;

const documentToState = (document: Md.Document): O.Option<SerializedEditorState> =>
  Exit.match(Effect.runSyncExit(documentToEditorState(document)), {
    onSuccess: O.some,
    onFailure: O.none,
  });

/**
 * The thread composer. Persists drafts, loads edit targets, and dispatches
 * send/edit turns.
 *
 * @example
 * ```tsx
 * import { Composer } from "@/chat/ui/Composer"
 *
 * console.log(Composer.name) // "Composer"
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export function Composer({ threadId }: { readonly threadId: ThreadId }): JSX.Element {
  const draftAtom = draftAtoms(threadId);
  const draft = useAtomValue(draftAtom);
  const setDraft = useAtomSet(draftAtom);
  const editTarget = useAtomValue(editTargetAtom);
  const setEditTarget = useAtomSet(editTargetAtom);
  const runTurn = useAtomSet(runTurnAtom);
  const streaming = O.isSome(useAtomValue(streamingTurnAtom));

  // keep the report + turn fibers subscribed — unobserved fn atoms get
  // interrupted by the registry (POC lesson, ported verbatim). EditorComposer
  // already drops out-of-schema states internally, so onSerializedChange only
  // ever sees valid content; the decode-failure fiber stays mounted as the
  // contracted observability sink for that path.
  useAtomMount(reportDecodeFailureAtom);
  useAtomMount(runTurnAtom);

  // latest serialized state from the editor — EditorComposer exposes no editor
  // handle, so we mirror its content through onSerializedChange.
  const latest = useRef<O.Option<SerializedEditorState>>(O.none());

  const isEditing = O.isSome(editTarget);

  // initial content + a key so switching thread / edit-target remounts the
  // composer with the right state loaded. Editing wins over the draft.
  const initial = useMemo<O.Option<SerializedEditorState>>(
    () =>
      O.match(editTarget, {
        onNone: () => O.flatMap(draft, documentToState),
        onSome: (t) => documentToState(t.content),
      }),
    // draft intentionally excluded: re-keying on every keystroke would reset the
    // editor. The draft seeds the editor only on thread/edit-target switches.
    [threadId, editTarget]
  );

  const composerKey = O.match(editTarget, {
    onNone: () => `thread:${threadId}`,
    onSome: (t) => `edit:${t.turnId}`,
  });

  const onSerializedChange = useCallback(
    (state: SerializedEditorState) => {
      latest.current = O.some(state);
      // mirror unsent content as a draft (only while composing a fresh message;
      // edit-target content is not persisted as a draft).
      if (!isEditing) {
        const document = editorStateToDocument(state);
        const isEmpty = A.isReadonlyArrayEmpty(document.children);
        setDraft(isEmpty ? O.none() : O.some(document));
      }
    },
    [isEditing, setDraft]
  );

  const submit = useCallback(() => {
    if (streaming) return;
    // no content captured yet, or an empty document — nothing to send.
    if (O.isNone(latest.current)) return;
    const content = editorStateToDocument(latest.current.value);
    if (A.isReadonlyArrayEmpty(content.children)) return;
    runTurn(
      O.match(editTarget, {
        onNone: () => SendTurnRequest.make({ threadId, content }),
        onSome: (t) => EditTurnRequest.make({ threadId, turnId: t.turnId, content }),
      })
    );
    latest.current = O.none();
    setDraft(O.none());
    setEditTarget(O.none());
  }, [streaming, editTarget, runTurn, setDraft, setEditTarget, threadId]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        submit();
      }
    },
    [submit]
  );

  return (
    <div className="border-t bg-background p-3" data-testid="composer">
      {isEditing ? (
        <div className="mb-2 flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs text-muted-foreground">
          <span>Editing message — sending will rewrite the thread from this point.</span>
          <Button variant="ghost" size="sm" onClick={() => setEditTarget(O.none())}>
            Cancel
          </Button>
        </div>
      ) : null}
      <div className="rounded-md border bg-background px-3 py-2" onKeyDown={onKeyDown} data-testid="composer-input">
        <EditorComposer
          key={composerKey}
          {...O.map(initial, (initialState) => ({ initialState })).pipe(O.getOrElse(() => ({})))}
          placeholder="Message… (Ctrl+Enter to send)"
          className="relative block min-h-12 focus:outline-none"
          onSerializedChange={onSerializedChange}
        />
      </div>
      <div className="mt-2 flex justify-end">
        <Button type="button" onClick={submit} disabled={streaming} data-testid="composer-send">
          {streaming ? "…" : isEditing ? "Rewrite" : "Send"}
        </Button>
      </div>
    </div>
  );
}
