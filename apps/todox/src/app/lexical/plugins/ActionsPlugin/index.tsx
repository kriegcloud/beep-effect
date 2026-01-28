"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeAtomRuntime, makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { SerializedDocument, SerializedEditorState } from "@beep/todox/app/lexical/schema";
import { Button } from "@beep/todox/components/ui/button";
import { withToast } from "@beep/ui/common";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as Clipboard from "@effect/platform-browser/Clipboard";
import { useAtomSet } from "@effect-atom/atom-react";
import { $createCodeNode, $isCodeNode } from "@lexical/code";
import {
  editorStateFromSerializedDocument,
  exportFile,
  importFile,
  serializedDocumentFromEditorState,
} from "@lexical/file";
import { $convertFromMarkdownString, $convertToMarkdownString } from "@lexical/markdown";
import { useCollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND } from "@lexical/yjs";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { LexicalEditor } from "lexical";
import {
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COLLABORATION_TAG,
  COMMAND_PRIORITY_EDITOR,
  HISTORIC_TAG,
} from "lexical";
import type { JSX } from "react";
import { useCallback, useEffect, useState } from "react";
import useFlashMessage from "../../hooks/useFlashMessage";
import useModal from "../../hooks/useModal";
import { INITIAL_SETTINGS } from "../../settings";
import { docFromHash, docToHash } from "../../utils/docSerialization";
import { PLAYGROUND_TRANSFORMERS } from "../MarkdownTransformers";
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from "../SpeechToTextPlugin";
import { SHOW_VERSIONS_COMMAND } from "../VersionsPlugin";

const $I = $TodoxId.create("app/lexical/index");

export class SendEditoryStateError extends S.TaggedError<SendEditoryStateError>($I`SendEditoryStateError`)(
  "SendEditoryStateError",
  {
    cause: S.Defect,
  },
  $I.annotations("SendEditoryStateError", {
    description: "An error which occurred while sending the editor state to the server.",
  })
) {}

export class EditorHttpClient extends Effect.Service<EditorHttpClient>()($I`EditorHttpClient`, {
  accessors: true,
  dependencies: [],
  effect: Effect.gen(function* () {
    const httpClient = yield* HttpClient.HttpClient;

    const sendEditorState = Effect.fn("EditorHttpClient.sendEditorState")(
      function* (editor: LexicalEditor) {
        const state = yield* S.decode(SerializedEditorState)(editor.getEditorState().toJSON());
        const request = yield* HttpClientRequest.post("/api/lexical/set-state").pipe(
          HttpClientRequest.setHeaders({
            Accept: "application/json",
            "Content-type": "application/json",
          }),
          HttpClientRequest.schemaBodyJson(SerializedEditorState)(state)
        );

        yield* httpClient.execute(request);
      },
      Effect.tapError(Effect.logError),
      Effect.catchTags({
        ParseError: Effect.die,
        HttpBodyError: Effect.die,
      })
    );

    const validateEditorState = Effect.fn("EditorHttpClient.validateEditorState")(function* (editor: LexicalEditor) {
      const state = yield* S.decode(SerializedEditorState)(editor.getEditorState().toJSON());
      yield* HttpClientRequest.post("/api/lexical/validate").pipe(
        HttpClientRequest.setHeaders({
          Accept: "application/json",
          "Content-type": "application/json",
        }),
        HttpClientRequest.schemaBodyJson(SerializedEditorState)(state),
        Effect.flatMap(httpClient.execute),
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(S.Boolean)),
        Effect.tapError(Effect.logError),
        Effect.catchTags({
          ParseError: Effect.die,
          HttpBodyError: Effect.die,
        })
      );
    });

    return {
      sendEditorState,
      validateEditorState,
    };
  }),
}) {}

const atomRuntime = makeAtomRuntime(() => EditorHttpClient.Default.pipe(Layer.provide(FetchHttpClient.layer)));

const sendEditorStateAtom = atomRuntime.fn(
  F.flow(
    EditorHttpClient.sendEditorState,
    withToast({
      onFailure: (error) => error.message,
      onDefect: () => "An unknown error occurred while sending the editor state to the server.",
      onSuccess: () => "Editor state sent successfully.",
      onWaiting: () => "Sending editor state...",
    })
  )
);

const validateEditorStateAtom = atomRuntime.fn(
  F.flow(
    EditorHttpClient.validateEditorState,
    withToast({
      onFailure: (error) => error.message,
      onDefect: () => "An unknown error occurred while validating the editor state.",
      onSuccess: () => "Editor state validated successfully.",
      onWaiting: () => "Validating editor state...",
    })
  )
);

const useEditorClient = () => {
  const sendEditorState = useAtomSet(sendEditorStateAtom);
  const validateEditorState = useAtomSet(validateEditorStateAtom);
  return {
    sendEditorState,
    validateEditorState,
  };
};

const shareDoc = Effect.fn("shareDoc")(function* (doc: SerializedDocument) {
  const url = yield* S.decode(S.URL)(window.location.toString());
  const clipboard = yield* Clipboard.Clipboard;
  url.hash = yield* docToHash(doc);
  const newUrl = url.toString();
  window.history.replaceState({}, "", newUrl);
  yield* clipboard.writeString(newUrl);
});

export default function ActionsPlugin({
  shouldPreserveNewLinesInMarkdown,
  useCollabV2,
}: {
  readonly shouldPreserveNewLinesInMarkdown: boolean;
  readonly useCollabV2: boolean;
}): JSX.Element {
  const runtime = useRuntime();

  const runClientPromise = makeRunClientPromise(runtime);
  const { sendEditorState, validateEditorState } = useEditorClient();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const [modal, showModal] = useModal();
  const showFlashMessage = useFlashMessage();
  const { isCollabActive } = useCollaborationContext();
  useEffect(() => {
    if (INITIAL_SETTINGS.isCollab) {
      return;
    }
    runClientPromise(
      Effect.gen(function* () {
        const doc = yield* docFromHash(window.location.hash);
        if (P.isString(doc)) {
          return yield* S.decode(S.parseJson(SerializedDocument))(doc);
        }
        return doc;
      })
    ).then((doc) => {
      if (doc && doc.source === "Playground") {
        editor.setEditorState(editorStateFromSerializedDocument(editor, doc));
        editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
      }
    });
  }, [editor]);
  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      editor.registerCommand<boolean>(
        CONNECTED_COMMAND,
        (payload) => {
          setConnected(payload);
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ dirtyElements, prevEditorState, tags }) => {
      // If we are in read only mode, send the editor state
      // to server and ask for validation if possible.
      if (!isEditable && dirtyElements.size > 0 && !tags.has(HISTORIC_TAG) && !tags.has(COLLABORATION_TAG)) {
        void validateEditorState(editor);
      }
      editor.getEditorState().read(() => {
        const root = $getRoot();
        const children = root.getChildren();

        if (children.length > 1) {
          setIsEditorEmpty(false);
        } else {
          if ($isParagraphNode(children[0])) {
            const paragraphChildren = children[0].getChildren();
            setIsEditorEmpty(paragraphChildren.length === 0);
          } else {
            setIsEditorEmpty(false);
          }
        }
      });
    });
  }, [editor, isEditable]);

  const handleMarkdownToggle = useCallback(() => {
    editor.update(() => {
      const root = $getRoot();
      const firstChild = root.getFirstChild();
      if ($isCodeNode(firstChild) && firstChild.getLanguage() === "markdown") {
        $convertFromMarkdownString(
          firstChild.getTextContent(),
          PLAYGROUND_TRANSFORMERS,
          undefined, // node
          shouldPreserveNewLinesInMarkdown
        );
      } else {
        const markdown = $convertToMarkdownString(
          PLAYGROUND_TRANSFORMERS,
          undefined, //node
          shouldPreserveNewLinesInMarkdown
        );
        const codeNode = $createCodeNode("markdown");
        codeNode.append($createTextNode(markdown));
        root.clear().append(codeNode);
        if (markdown.length === 0) {
          codeNode.select();
        }
      }
    });
  }, [editor, shouldPreserveNewLinesInMarkdown]);

  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <button
          type={"button"}
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText);
            setIsSpeechToText(!isSpeechToText);
          }}
          className={`action-button action-button-mic ${isSpeechToText ? "active" : ""}`}
          title="Speech To Text"
          aria-label={`${isSpeechToText ? "Enable" : "Disable"} speech to text`}
        >
          <i className="mic" />
        </button>
      )}
      <button
        type="button"
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON"
      >
        <i className="import" />
      </button>

      <button
        type="button"
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Playground ${new Date().toISOString()}`,
            source: "Playground",
          })
        }
        title="Export"
        aria-label="Export editor state to JSON"
      >
        <i className="export" />
      </button>
      <button
        type="button"
        className="action-button share"
        disabled={isCollabActive || INITIAL_SETTINGS.isCollab}
        onClick={() =>
          runClientPromise(
            shareDoc(
              serializedDocumentFromEditorState(editor.getEditorState(), {
                source: "Playground",
              })
            ).pipe(
              Effect.tap(() => Effect.succeed(showFlashMessage("URL copied to clipboard"))),
              Effect.mapError((e) =>
                P.isTagged("ClipboardError")(e)
                  ? Effect.sync(() => showFlashMessage("URL could not be copied to clipboard"))
                  : Effect.die(e)
              )
            )
          )
        }
        title="Share"
        aria-label="Share Playground link to current editor state"
      >
        <i className="share" />
      </button>
      <button
        type="button"
        className="action-button clear"
        disabled={isEditorEmpty}
        onClick={() => {
          showModal("Clear editor", (onClose) => <ShowClearDialog editor={editor} onClose={onClose} />);
        }}
        title="Clear"
        aria-label="Clear editor contents"
      >
        <i className="clear" />
      </button>
      <button
        type="button"
        className={`action-button ${!isEditable ? "unlock" : "lock"}`}
        onClick={() => {
          // Send latest editor state to commenting validation server
          if (isEditable) {
            sendEditorState(editor);
          }
          editor.setEditable(!editor.isEditable());
        }}
        title="Read-Only Mode"
        aria-label={`${!isEditable ? "Unlock" : "Lock"} read-only mode`}
      >
        <i className={!isEditable ? "unlock" : "lock"} />
      </button>
      <button
        type="button"
        className="action-button"
        onClick={handleMarkdownToggle}
        title="Convert From Markdown"
        aria-label="Convert from markdown"
      >
        <i className="markdown" />
      </button>
      {isCollabActive && (
        <>
          <button
            type="button"
            className="action-button connect"
            onClick={() => {
              editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
            }}
            title={`${connected ? "Disconnect" : "Connect"} Collaborative Editing`}
            aria-label={`${connected ? "Disconnect from" : "Connect to"} a collaborative editing server`}
          >
            <i className={connected ? "disconnect" : "connect"} />
          </button>
          {useCollabV2 && (
            <button
              type="button"
              className="action-button versions"
              onClick={() => {
                editor.dispatchCommand(SHOW_VERSIONS_COMMAND, undefined);
              }}
            >
              <i className="versions" />
            </button>
          )}
        </>
      )}
      {modal}
    </div>
  );
}

function ShowClearDialog({ editor, onClose }: { editor: LexicalEditor; onClose: () => void }): JSX.Element {
  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          variant="outline"
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
            editor.focus();
            onClose();
          }}
        >
          Clear
        </Button>{" "}
        <Button
          variant="outline"
          onClick={() => {
            editor.focus();
            onClose();
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}
