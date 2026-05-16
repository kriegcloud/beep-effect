/**
 * React bindings for ElevenLabs Scribe realtime transcription.
 *
 * @category hooks
 * @since 0.0.0
 * @packageDocumentation
 */
"use client";

import { A } from "@beep/utils";
import {
  AudioFormat,
  CommitStrategy,
  type CommittedTranscriptMessage,
  type MicrophoneOptions,
  type PartialTranscriptMessage,
  type RealtimeConnection,
  RealtimeEvents,
  Scribe,
  type ScribeAuthErrorMessage,
  type ScribeErrorMessage,
  type ScribeQuotaExceededErrorMessage,
} from "@elevenlabs/client";
import { Effect } from "effect";
import * as P from "effect/Predicate";
import { useCallback, useEffect, useRef, useState } from "react";

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

const toMicrophoneOptions = (
  microphone: undefined | UseScribeMicrophoneOptions
): undefined | MicrophoneOptions["microphone"] =>
  microphone === undefined
    ? undefined
    : {
        ...(microphone.autoGainControl === undefined ? {} : { autoGainControl: microphone.autoGainControl }),
        ...(microphone.channelCount === undefined ? {} : { channelCount: microphone.channelCount }),
        ...(microphone.deviceId === undefined ? {} : { deviceId: microphone.deviceId }),
        ...(microphone.echoCancellation === undefined ? {} : { echoCancellation: microphone.echoCancellation }),
        ...(microphone.noiseSuppression === undefined ? {} : { noiseSuppression: microphone.noiseSuppression }),
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
      disconnect();
      setError(null);
      setStatus("connecting");

      let handledError = false;
      try {
        const currentOptions = optionsRef.current;
        const baseOptions = {
          token,
          modelId: currentOptions.modelId ?? defaultModelId,
          ...(currentOptions.baseUri === undefined ? {} : { baseUri: currentOptions.baseUri }),
          ...(currentOptions.commitStrategy === undefined ? {} : { commitStrategy: currentOptions.commitStrategy }),
          ...(currentOptions.languageCode === undefined ? {} : { languageCode: currentOptions.languageCode }),
          ...(currentOptions.minSilenceDurationMs === undefined
            ? {}
            : { minSilenceDurationMs: currentOptions.minSilenceDurationMs }),
          ...(currentOptions.minSpeechDurationMs === undefined
            ? {}
            : { minSpeechDurationMs: currentOptions.minSpeechDurationMs }),
          ...(currentOptions.vadSilenceThresholdSecs === undefined
            ? {}
            : { vadSilenceThresholdSecs: currentOptions.vadSilenceThresholdSecs }),
          ...(currentOptions.vadThreshold === undefined ? {} : { vadThreshold: currentOptions.vadThreshold }),
        };
        const { audioFormat, sampleRate } = currentOptions;
        const hasManualAudio = audioFormat !== undefined || sampleRate !== undefined;

        if (hasManualAudio && (audioFormat === undefined || sampleRate === undefined)) {
          throw makeScribeError("audioFormat and sampleRate must be provided together for manual Scribe audio.");
        }

        const microphoneOptions = toMicrophoneOptions(currentOptions.microphone);
        const connection =
          hasManualAudio && audioFormat !== undefined && sampleRate !== undefined
            ? Scribe.connect({
                ...baseOptions,
                audioFormat,
                sampleRate,
              })
            : Scribe.connect({
                ...baseOptions,
                ...(microphoneOptions === undefined ? {} : { microphone: microphoneOptions }),
              });

        connectionRef.current = connection;

        return Effect.runPromise(
          Effect.callback<void, Error>((resume) => {
            let settled = false;

            const settleResolve = () => {
              if (!settled) {
                settled = true;
                setStatus("connected");
                resume(Effect.void);
              }
            };

            const settleReject = (scribeError: Error) => {
              handledError = true;
              setError(scribeError.message);
              optionsRef.current.onError?.(scribeError);
              if (!settled) {
                settled = true;
                setStatus("idle");
                resume(Effect.fail(scribeError));
              }
            };

            connection.on(RealtimeEvents.OPEN, settleResolve);
            connection.on(RealtimeEvents.CLOSE, (event) => {
              if (connectionRef.current === connection) {
                connectionRef.current = null;
              }
              setStatus("idle");
              if (!settled) {
                settleReject(closeEventToError(event));
              }
            });
            connection.on(RealtimeEvents.ERROR, (data) => settleReject(messageToError(data)));
            connection.on(RealtimeEvents.AUTH_ERROR, (data) => {
              optionsRef.current.onAuthError?.(data);
              settleReject(makeScribeError(data.error));
            });
            connection.on(RealtimeEvents.QUOTA_EXCEEDED, (data) => {
              optionsRef.current.onQuotaExceededError?.(data);
              settleReject(makeScribeError(data.error));
            });
            connection.on(RealtimeEvents.PARTIAL_TRANSCRIPT, (data) => {
              setPartialTranscript(data.text);
              optionsRef.current.onPartialTranscript?.(data);
            });
            connection.on(RealtimeEvents.COMMITTED_TRANSCRIPT, (data) => {
              setPartialTranscript("");
              setCommittedTranscripts((transcripts) => A.append(transcripts, data));
              optionsRef.current.onCommittedTranscript?.(data);
            });
          })
        ).catch((cause: unknown) => {
          const scribeError = unknownToError(cause);
          if (!handledError) {
            setError(scribeError.message);
            setStatus("idle");
            optionsRef.current.onError?.(scribeError);
          }
          throw scribeError;
        });
      } catch (cause) {
        const scribeError = unknownToError(cause);
        if (!handledError) {
          setError(scribeError.message);
          setStatus("idle");
          optionsRef.current.onError?.(scribeError);
        }
        return Promise.reject(scribeError);
      }
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
