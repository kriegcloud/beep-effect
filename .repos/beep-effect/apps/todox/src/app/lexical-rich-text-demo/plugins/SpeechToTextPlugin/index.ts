"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import * as Permissions from "@effect/platform-browser/Permissions";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type { LexicalCommand, LexicalEditor, RangeSelection } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  REDO_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

import useReport from "../../hooks/useReport";

const $I = $TodoxId.create("lexical/plugins/SpeechToTextPlugin");

// ============================================================================
// Errors
// ============================================================================

export class SpeechRecognitionPermissionError extends S.TaggedError<SpeechRecognitionPermissionError>()(
  $I`SpeechRecognitionPermissionError`,
  {
    state: S.Literal("denied", "prompt", "granted"),
    cause: S.optional(S.Defect),
  },
  $I.annotations("SpeechRecognitionPermissionError", {
    description: "Error thrown when microphone permission is denied or request fails",
  })
) {
  static readonly fromState = (state: PermissionState) =>
    new SpeechRecognitionPermissionError({ state: state as "denied" | "prompt" | "granted" });

  static readonly fromCause = (cause: unknown) => new SpeechRecognitionPermissionError({ state: "denied", cause });
}

// ============================================================================
// Permission State Type
// ============================================================================

export type MicrophonePermissionState = "granted" | "denied" | "prompt" | "checking" | "error";

// ============================================================================
// Commands
// ============================================================================

export const SPEECH_TO_TEXT_COMMAND: LexicalCommand<boolean> = createCommand("SPEECH_TO_TEXT_COMMAND");

const VOICE_COMMANDS: Readonly<
  Record<string, (arg0: { readonly editor: LexicalEditor; readonly selection: RangeSelection }) => void>
> = {
  "\n": ({ selection }) => {
    selection.insertParagraph();
  },
  redo: ({ editor }) => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  },
  undo: ({ editor }) => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  },
};

export const SUPPORT_SPEECH_RECOGNITION: boolean =
  typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

// ============================================================================
// Permission Effect
// ============================================================================

const checkMicrophonePermissionEffect = Effect.gen(function* () {
  const permissions = yield* Permissions.Permissions;

  const permissionStatus = yield* permissions
    .query("microphone")
    .pipe(Effect.catchTag("PermissionsError", (e) => Effect.fail(SpeechRecognitionPermissionError.fromCause(e))));

  if (permissionStatus.state === "denied") {
    return yield* Effect.fail(SpeechRecognitionPermissionError.fromState("denied"));
  }

  if (permissionStatus.state === "prompt") {
    const tempStream = yield* Effect.tryPromise({
      catch: SpeechRecognitionPermissionError.fromCause,
      try: () => navigator.mediaDevices.getUserMedia({ audio: true }),
    });

    A.forEach(tempStream.getTracks(), (track) => track.stop());
  }

  return "granted" as const;
}).pipe(Effect.withSpan("SpeechToTextPlugin.checkMicrophonePermission"));

// ============================================================================
// Hook
// ============================================================================

function useMicrophonePermission() {
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime, "SpeechToTextPlugin.permission");
  const [permissionState, setPermissionState] = useState<MicrophonePermissionState>("checking");

  const checkPermission = useCallback(() => {
    setPermissionState("checking");
    void runPromise(
      checkMicrophonePermissionEffect.pipe(
        Effect.tap(() => Effect.sync(() => setPermissionState("granted"))),
        Effect.catchAll((error) =>
          Effect.gen(function* () {
            yield* Effect.logWarning("Microphone permission error", { state: error.state });
            yield* Effect.sync(() => {
              setPermissionState(error.state === "denied" ? "denied" : "error");
            });
          })
        ),
        Effect.catchAllDefect((defect) =>
          Effect.gen(function* () {
            yield* Effect.logError("Unexpected error checking microphone permission", { defect });
            yield* Effect.sync(() => setPermissionState("error"));
          })
        )
      )
    );
  }, [runPromise]);

  return { permissionState, checkPermission };
}

// ============================================================================
// Plugin Component
// ============================================================================

function SpeechToTextPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const { permissionState, checkPermission } = useMicrophonePermission();
  const SpeechRecognition =
    typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;
  const recognition = useRef<InstanceType<NonNullable<typeof SpeechRecognition>> | null>(null);
  const report = useReport();

  useEffect(() => {
    if (!SpeechRecognition) return;

    if (isEnabled && permissionState === "granted" && recognition.current === null) {
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.addEventListener("result", (event: SpeechRecognitionEvent) => {
        const resultItem = event.results.item(event.resultIndex);
        const { transcript } = resultItem.item(0);
        report(transcript);

        if (!resultItem.isFinal) {
          return;
        }

        editor.update(() => {
          const selection = $getSelection();

          if ($isRangeSelection(selection)) {
            const command = VOICE_COMMANDS[Str.trim(Str.toLowerCase(transcript))];

            if (command) {
              command({
                editor,
                selection,
              });
            } else if (O.isSome(Str.match(/\s*\n\s*/)(transcript))) {
              selection.insertParagraph();
            } else {
              selection.insertText(transcript);
            }
          }
        });
      });
    }

    if (recognition.current) {
      if (isEnabled && permissionState === "granted") {
        recognition.current.start();
      } else {
        recognition.current.stop();
      }
    }

    return () => {
      if (recognition.current !== null) {
        recognition.current.stop();
      }
    };
  }, [SpeechRecognition, editor, isEnabled, permissionState, report]);

  useEffect(() => {
    return editor.registerCommand(
      SPEECH_TO_TEXT_COMMAND,
      (_isEnabled: boolean) => {
        if (_isEnabled) {
          if (permissionState === "checking" || permissionState === "prompt") {
            checkPermission();
          }
          if (permissionState === "granted") {
            setIsEnabled(true);
          } else if (permissionState !== "denied") {
            // Permission check in progress, enable will happen when granted
            setIsEnabled(true);
          }
          // If denied, do nothing - permission error was already logged in checkPermission
        } else {
          setIsEnabled(false);
        }
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor, permissionState, checkPermission]);

  useEffect(() => {
    if (isEnabled && permissionState === "granted" && recognition.current === null) {
      // Permission was just granted, recognition will be set up in the other effect
    } else if (isEnabled && permissionState === "denied") {
      setIsEnabled(false);
    }
  }, [isEnabled, permissionState]);

  return null;
}

export default SUPPORT_SPEECH_RECOGNITION ? SpeechToTextPlugin : () => null;
