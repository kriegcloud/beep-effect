"use client";

/**
 * React bindings for ElevenLabs Scribe realtime transcription.
 *
 * @category hooks
 * @since 0.0.0
 * @packageDocumentation
 */

import { A } from "@beep/utils";
import * as O from "@beep/utils/Option";
import { AudioFormat, CommitStrategy, RealtimeEvents, Scribe } from "@elevenlabs/client";
import { Data, Effect } from "effect";
import * as P from "effect/Predicate";
import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CommittedTranscriptMessage,
  MicrophoneOptions,
  PartialTranscriptMessage,
  RealtimeConnection,
  ScribeAuthErrorMessage,
  ScribeErrorMessage,
  ScribeQuotaExceededErrorMessage,
} from "@elevenlabs/client";

/**
 * ElevenLabs Scribe enum exports used by the `@beep/ui` speech components.
 *
 * @category hooks
 * @since 0.0.0
 */
export { AudioFormat, CommitStrategy };

/**
 * Connection status for the realtime Scribe hook.
 *
 * @category type-level
 * @since 0.0.0
 */
export type ScribeStatus = "idle" | "connecting" | "connected";

/**
 * Connection credentials supplied when starting a Scribe session.
 *
 * @category type-level
 * @since 0.0.0
 */
interface ScribeConnectOptions {
  readonly token: string;
}

/**
 * Browser microphone options accepted by the UI hook.
 *
 * @category type-level
 * @since 0.0.0
 */
interface UseScribeMicrophoneOptions {
  readonly autoGainControl?: undefined | boolean;
  readonly channelCount?: undefined | number;
  readonly deviceId?: undefined | string;
  readonly echoCancellation?: undefined | boolean;
  readonly noiseSuppression?: undefined | boolean;
}

/**
 * Runtime configuration and callbacks for `useScribe`.
 *
 * @category type-level
 * @since 0.0.0
 */
interface UseScribeOptions {
  readonly audioFormat?: undefined | AudioFormat;
  readonly baseUri?: undefined | string;
  readonly commitStrategy?: undefined | CommitStrategy;
  readonly languageCode?: undefined | string;
  readonly microphone?: undefined | UseScribeMicrophoneOptions;
  readonly minSilenceDurationMs?: undefined | number;
  readonly minSpeechDurationMs?: undefined | number;
  readonly modelId?: undefined | string;
  readonly onAuthError?: undefined | ((data: ScribeAuthErrorMessage) => void);
  readonly onCommittedTranscript?: undefined | ((data: CommittedTranscriptMessage) => void);
  readonly onError?: undefined | ((error: Error | Event) => void);
  readonly onPartialTranscript?: undefined | ((data: PartialTranscriptMessage) => void);
  readonly onQuotaExceededError?: undefined | ((data: ScribeQuotaExceededErrorMessage) => void);
  readonly sampleRate?: undefined | number;
  readonly vadSilenceThresholdSecs?: undefined | number;
  readonly vadThreshold?: undefined | number;
}

/**
 * State and controls returned by `useScribe`.
 *
 * @category type-level
 * @since 0.0.0
 */
interface UseScribeResult {
  readonly clearTranscripts: () => void;
  readonly committedTranscripts: ReadonlyArray<CommittedTranscriptMessage>;
  readonly connect: (options: ScribeConnectOptions) => Promise<void>;
  readonly disconnect: () => void;
  readonly error: string | null;
  readonly isConnected: boolean;
  readonly partialTranscript: string;
  readonly status: ScribeStatus;
}

const defaultModelId = "scribe_v2_realtime";

const makeScribeError = (message: string): Error => new DOMException(message, "ScribeConnectionError");

const messageToError = (data: ScribeErrorMessage): Error => makeScribeError(data.error);

const unknownToError = (cause: unknown): Error =>
  cause instanceof Error ? cause : makeScribeError(P.isString(cause) ? cause : "Unable to start Scribe session");

const closeEventToError = (event: CloseEvent): Error =>
  makeScribeError(event.reason === "" ? `Scribe connection closed with code ${event.code}` : event.reason);

class ScribeConnectionFailure extends Data.TaggedError("ScribeConnectionFailure")<{
  readonly error: Error;
}> {}

const toScribeConnectionFailure = (cause: unknown): ScribeConnectionFailure =>
  new ScribeConnectionFailure({ error: unknownToError(cause) });

const toMicrophoneOptions = (
  microphone: undefined | UseScribeMicrophoneOptions
): undefined | MicrophoneOptions["microphone"] =>
  microphone === undefined
    ? undefined
    : {
        ...O.getSomesStruct({ autoGainControl: O.fromUndefinedOr(microphone.autoGainControl) }),
        ...O.getSomesStruct({ channelCount: O.fromUndefinedOr(microphone.channelCount) }),
        ...O.getSomesStruct({ deviceId: O.fromUndefinedOr(microphone.deviceId) }),
        ...O.getSomesStruct({ echoCancellation: O.fromUndefinedOr(microphone.echoCancellation) }),
        ...O.getSomesStruct({ noiseSuppression: O.fromUndefinedOr(microphone.noiseSuppression) }),
      };

/**
 * Manage an ElevenLabs realtime Scribe connection from React components.
 *
 * @category hooks
 * @since 0.0.0
 */
export function useScribe(options: UseScribeOptions): UseScribeResult {
  const optionsRef = useRef(options);
  const connectionRef = useRef<RealtimeConnection | null>(null);
  const [status, setStatus] = useState<ScribeStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [partialTranscript, setPartialTranscript] = useState("");
  const [committedTranscripts, setCommittedTranscripts] = useState<ReadonlyArray<CommittedTranscriptMessage>>(
    A.empty<CommittedTranscriptMessage>()
  );

  optionsRef.current = options;

  const clearTranscripts = useCallback(() => {
    setPartialTranscript("");
    setCommittedTranscripts(A.empty<CommittedTranscriptMessage>());
  }, []);

  const disconnect = useCallback(() => {
    connectionRef.current?.close();
    connectionRef.current = null;
    setStatus("idle");
  }, []);

  const connect = useCallback(
    ({ token }: ScribeConnectOptions): Promise<void> => {
      let handledError = false;
      const handleUnhandledError = (failure: ScribeConnectionFailure): Effect.Effect<never, Error> => {
        const scribeError = failure.error;
        if (!handledError) {
          setError(scribeError.message);
          setStatus("idle");
          optionsRef.current.onError?.(scribeError);
        }
        return Effect.fail(scribeError);
      };

      return Effect.runPromise(
        Effect.gen(function* () {
          disconnect();
          setError(null);
          setStatus("connecting");

          const connection = yield* Effect.try({
            try: () => {
              const currentOptions = optionsRef.current;
              const baseOptions = {
                token,
                modelId: currentOptions.modelId ?? defaultModelId,
                ...O.getSomesStruct({ baseUri: O.fromUndefinedOr(currentOptions.baseUri) }),
                ...O.getSomesStruct({ commitStrategy: O.fromUndefinedOr(currentOptions.commitStrategy) }),
                ...O.getSomesStruct({ languageCode: O.fromUndefinedOr(currentOptions.languageCode) }),
                ...O.getSomesStruct({ minSilenceDurationMs: O.fromUndefinedOr(currentOptions.minSilenceDurationMs) }),
                ...O.getSomesStruct({ minSpeechDurationMs: O.fromUndefinedOr(currentOptions.minSpeechDurationMs) }),
                ...O.getSomesStruct({
                  vadSilenceThresholdSecs: O.fromUndefinedOr(currentOptions.vadSilenceThresholdSecs),
                }),
                ...O.getSomesStruct({ vadThreshold: O.fromUndefinedOr(currentOptions.vadThreshold) }),
              };
              const { audioFormat, sampleRate } = currentOptions;
              const hasManualAudio = audioFormat !== undefined || sampleRate !== undefined;

              if (hasManualAudio && (audioFormat === undefined || sampleRate === undefined)) {
                throw makeScribeError("audioFormat and sampleRate must be provided together for manual Scribe audio.");
              }

              const microphoneOptions = toMicrophoneOptions(currentOptions.microphone);
              return hasManualAudio && audioFormat !== undefined && sampleRate !== undefined
                ? Scribe.connect({
                    ...baseOptions,
                    audioFormat,
                    sampleRate,
                  })
                : Scribe.connect({
                    ...baseOptions,
                    ...O.getSomesStruct({ microphone: O.fromUndefinedOr(microphoneOptions) }),
                  });
            },
            catch: toScribeConnectionFailure,
          });

          connectionRef.current = connection;

          yield* Effect.callback<void, ScribeConnectionFailure>((resume) => {
            let settled = false;

            const settleResolve = () => {
              if (!settled) {
                settled = true;
                setStatus("connected");
                resume(Effect.void);
              }
            };

            const settleReject = (scribeError_1: Error) => {
              handledError = true;
              setError(scribeError_1.message);
              optionsRef.current.onError?.(scribeError_1);
              if (!settled) {
                settled = true;
                setStatus("idle");
                resume(Effect.fail(new ScribeConnectionFailure({ error: scribeError_1 })));
              }
            };

            connection.on(RealtimeEvents.OPEN, settleResolve);
            connection.on(RealtimeEvents.CLOSE, (event_1) => {
              if (connectionRef.current === connection) {
                connectionRef.current = null;
              }
              setStatus("idle");
              if (!settled) {
                settleReject(closeEventToError(event_1));
              }
            });
            connection.on(RealtimeEvents.ERROR, (data) => settleReject(messageToError(data)));
            connection.on(RealtimeEvents.AUTH_ERROR, (data_2) => {
              optionsRef.current.onAuthError?.(data_2);
              settleReject(makeScribeError(data_2.error));
            });
            connection.on(RealtimeEvents.QUOTA_EXCEEDED, (data_3) => {
              optionsRef.current.onQuotaExceededError?.(data_3);
              settleReject(makeScribeError(data_3.error));
            });
            connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data_4) => {
              setPartialTranscript(data_4.text);
              optionsRef.current.onPartialTranscript?.(data_4);
            });
            connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data_5) => {
              setPartialTranscript("");
              setCommittedTranscripts((transcripts) => A.append(transcripts, data_5));
              optionsRef.current.onCommittedTranscript?.(data_5);
            });
          });
        }).pipe(Effect.catch(handleUnhandledError))
      );
    },
    [disconnect]
  );

  useEffect(() => disconnect, [disconnect]);

  return {
    clearTranscripts,
    committedTranscripts,
    connect,
    disconnect,
    error,
    isConnected: status === "connected",
    partialTranscript,
    status,
  };
}
