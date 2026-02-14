"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeAtomRuntime, makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@beep/todox/components/ui/alert-dialog";
import { Button } from "@beep/todox/components/ui/button";
import { Toggle } from "@beep/todox/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/todox/components/ui/tooltip";
import { cn } from "@beep/todox/lib/utils";
import { withToast } from "@beep/ui/common";
import { liftContextMethod } from "@beep/utils/effect/lift-context-method";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import type * as HttpClientError from "@effect/platform/HttpClientError";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import { useAtomSet } from "@effect-atom/atom-react";
import { editorStateFromSerializedDocument } from "@lexical/file";
import type { Transformer } from "@lexical/markdown";
import { CollaborationContext } from "@lexical/react/LexicalCollaborationContext";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { CONNECTED_COMMAND, TOGGLE_CONNECT_COMMAND } from "@lexical/yjs";
import {
  ClockCounterClockwiseIcon,
  MicrophoneIcon,
  PlugIcon,
  PlugsConnectedIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Layer from "effect/Layer";
import type * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { LexicalEditor } from "lexical";
import {
  $getRoot,
  $isParagraphNode,
  CLEAR_EDITOR_COMMAND,
  CLEAR_HISTORY_COMMAND,
  COLLABORATION_TAG,
  COMMAND_PRIORITY_EDITOR,
  HISTORIC_TAG,
} from "lexical";
import type { JSX } from "react";
import { useContext, useEffect, useState } from "react";
import { SerializedDocument, SerializedEditorState } from "../../schema";
import { INITIAL_SETTINGS } from "../../settings";
import { docFromHash } from "../../utils";
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

export interface EditorHttpClientShape {
  readonly sendEditorState: (editor: LexicalEditor) => Effect.Effect<void, HttpClientError.HttpClientError, never>;
  readonly validateEditorState: (
    editor: LexicalEditor
  ) => Effect.Effect<void, ParseResult.ParseError | HttpClientError.HttpClientError, never>;
}

export class EditorHttpClient extends Context.Tag($I`EHttpClient`)<EditorHttpClient, EditorHttpClientShape>() {}
type ServiceEffect = Effect.Effect<EditorHttpClientShape, never, HttpClient.HttpClient>;
const serviceEffect: ServiceEffect = Effect.gen(function* () {
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

  return EditorHttpClient.of({
    sendEditorState,
    validateEditorState,
  });
});

export const EditorHttpClientLive = Layer.effect(EditorHttpClient, serviceEffect).pipe(
  Layer.provide(FetchHttpClient.layer)
);

const atomRuntime = makeAtomRuntime(() => EditorHttpClientLive);

const liftMethod = liftContextMethod(EditorHttpClient);

const sendEditorStateAtom = atomRuntime.fn(
  F.flow(
    liftMethod("sendEditorState"),
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
    liftMethod("validateEditorState"),
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

export default function ActionsPlugin({
  shouldPreserveNewLinesInMarkdown,
  useCollabV2,
  transformers = PLAYGROUND_TRANSFORMERS,
}: {
  readonly shouldPreserveNewLinesInMarkdown: boolean;
  readonly useCollabV2: boolean;
  readonly transformers?: ReadonlyArray<Transformer>;
}): JSX.Element {
  const runtime = useRuntime();

  const runClientPromise = makeRunClientPromise(runtime);
  const { validateEditorState } = useEditorClient();
  const [editor] = useLexicalComposerContext();
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isSpeechToText, setIsSpeechToText] = useState(false);
  const [connected, setConnected] = useState(false);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);
  const collabContext = useContext(CollaborationContext);
  const isCollabActive = collabContext?.isCollabActive ?? false;
  useEffect(() => {
    if (INITIAL_SETTINGS.isCollab) {
      return;
    }
    runClientPromise(
      Effect.gen(function* () {
        const doc = yield* docFromHash(window.location.hash);
        const parsedDoc = P.isString(doc) ? yield* S.decode(S.parseJson(SerializedDocument))(doc) : doc;

        if (parsedDoc && parsedDoc.source === "Playground") {
          editor.setEditorState(editorStateFromSerializedDocument(editor, parsedDoc));
          editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
        }
        return parsedDoc;
      })
    );
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
    return editor.registerUpdateListener(({ dirtyElements, tags }) => {
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

  return (
    <div className="absolute bottom-0 right-0 m-2.5 flex items-center gap-1">
      {/* Speech-to-Text Toggle */}
      {SUPPORT_SPEECH_RECOGNITION && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Toggle
                pressed={isSpeechToText}
                onPressedChange={(pressed) => {
                  editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, pressed);
                  setIsSpeechToText(pressed);
                }}
                size="sm"
                aria-label={`${isSpeechToText ? "Disable" : "Enable"} speech to text`}
                className={cn(
                  isSpeechToText && "animate-pulse bg-red-200 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                )}
              >
                <MicrophoneIcon className="size-4" />
              </Toggle>
            }
          />
          <TooltipContent>Speech to Text</TooltipContent>
        </Tooltip>
      )}

      {/* Clear */}
      <AlertDialog>
        <Tooltip>
          <TooltipTrigger
            render={
              <AlertDialogTrigger
                render={
                  <Button variant="ghost" size="icon-sm" disabled={isEditorEmpty} aria-label="Clear editor contents">
                    <TrashIcon className="size-4" />
                  </Button>
                }
              />
            }
          />
          <TooltipContent>Clear</TooltipContent>
        </Tooltip>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear editor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the editor? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
                editor.focus();
              }}
            >
              Clear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Collaboration Controls */}
      {isCollabActive && (
        <>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    editor.dispatchCommand(TOGGLE_CONNECT_COMMAND, !connected);
                  }}
                  aria-label={`${connected ? "Disconnect from" : "Connect to"} a collaborative editing server`}
                >
                  {connected ? <PlugsConnectedIcon className="size-4" /> : <PlugIcon className="size-4" />}
                </Button>
              }
            />
            <TooltipContent>{connected ? "Disconnect" : "Connect"}</TooltipContent>
          </Tooltip>

          {useCollabV2 && (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      editor.dispatchCommand(SHOW_VERSIONS_COMMAND, undefined);
                    }}
                    aria-label="View versions"
                  >
                    <ClockCounterClockwiseIcon className="size-4" />
                  </Button>
                }
              />
              <TooltipContent>Versions</TooltipContent>
            </Tooltip>
          )}
        </>
      )}
    </div>
  );
}
