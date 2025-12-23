"use client";
import React from "react";

export interface recorderControls {
  readonly startRecording: () => void;
  readonly stopRecording: () => void;
  readonly togglePauseResume: () => void;
  readonly recordingBlob?: undefined | Blob;
  readonly isRecording: boolean;
  readonly isPaused: boolean;
  readonly recordingTime: number;
  readonly mediaRecorder?: undefined | MediaRecorder;
}

export type MediaAudioTrackConstraints = Pick<
  MediaTrackConstraints,
  | "deviceId"
  | "groupId"
  | "autoGainControl"
  | "channelCount"
  | "echoCancellation"
  | "noiseSuppression"
  | "sampleRate"
  | "sampleSize"
>;
type UseAudioRecorder = (
  audioTrackConstraints?: undefined | MediaAudioTrackConstraints,
  onNotAllowedOrFound?: undefined | ((exception: DOMException) => any),
  mediaRecorderOptions?: undefined | MediaRecorderOptions
) => recorderControls;
/**
 * @returns Controls for the recording. Details of returned controls are given below
 *
 *
 * @details `startRecording`: Calling this method would result in the recording to start. Sets `isRecording` to true
 * @details `stopRecording`: This results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
 * @details `togglePauseResume`: Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
 * @details `recordingBlob`: This is the recording blob that is created after `stopRecording` has been called
 * @details `isRecording`: A boolean value that represents whether a recording is currently in progress
 * @details `isPaused`: A boolean value that represents whether a recording in progress is paused
 * @details `recordingTime`: Number of seconds that the recording has gone on. This is updated every second
 * @details `mediaRecorder`: The current mediaRecorder in use
 * @param audioTrackConstraints
 * @param onNotAllowedOrFound
 * @param mediaRecorderOptions
 */
export const useAudioRecorder: UseAudioRecorder = (
  audioTrackConstraints?: undefined | MediaAudioTrackConstraints,
  onNotAllowedOrFound?: undefined | ((exception: DOMException) => any),
  mediaRecorderOptions?: undefined | MediaRecorderOptions
) => {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isPaused, setIsPaused] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [mediaRecorder, setMediaRecorder] = React.useState<MediaRecorder>();
  const [timerInterval, setTimerInterval] = React.useState<NodeJS.Timeout>();
  const [recordingBlob, setRecordingBlob] = React.useState<Blob>();

  const _startTimer: () => void = React.useCallback(() => {
    const interval = setInterval(() => {
      setRecordingTime((time) => time + 1);
    }, 1000);
    setTimerInterval(interval);
  }, [setRecordingTime, setTimerInterval]);

  const _stopTimer: () => void = React.useCallback(() => {
    timerInterval != null && clearInterval(timerInterval);
    setTimerInterval(undefined);
  }, [timerInterval, setTimerInterval]);

  /**
   * Calling this method would result in the recording to start. Sets `isRecording` to true
   */
  const startRecording: () => void = React.useCallback(() => {
    if (timerInterval != null) return;

    navigator.mediaDevices
      .getUserMedia({ audio: audioTrackConstraints ?? true })
      .then((stream) => {
        setIsRecording(true);
        const recorder: MediaRecorder = new MediaRecorder(stream, mediaRecorderOptions);
        setMediaRecorder(recorder);
        recorder.start();
        _startTimer();

        recorder.addEventListener("dataavailable", (event) => {
          setRecordingBlob(event.data);
          recorder.stream.getTracks().forEach((t) => t.stop());
          setMediaRecorder(undefined);
        });
      })
      .catch((err: DOMException) => {
        console.log(err.name, err.message, err.cause);
        onNotAllowedOrFound?.(err);
      });
  }, [
    timerInterval,
    setIsRecording,
    setMediaRecorder,
    _startTimer,
    setRecordingBlob,
    onNotAllowedOrFound,
    mediaRecorderOptions,
  ]);

  /**
   * Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
   */
  const stopRecording: () => void = React.useCallback(() => {
    mediaRecorder?.stop();
    _stopTimer();
    setRecordingTime(0);
    setIsRecording(false);
    setIsPaused(false);
  }, [mediaRecorder, setRecordingTime, setIsRecording, setIsPaused, _stopTimer]);

  /**
   * Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
   */
  const togglePauseResume: () => void = React.useCallback(() => {
    if (isPaused) {
      setIsPaused(false);
      mediaRecorder?.resume();
      _startTimer();
    } else {
      setIsPaused(true);
      _stopTimer();
      mediaRecorder?.pause();
    }
  }, [mediaRecorder, setIsPaused, _startTimer, _stopTimer]);

  return {
    startRecording,
    stopRecording,
    togglePauseResume,
    recordingBlob,
    isRecording,
    isPaused,
    recordingTime,
    mediaRecorder,
  };
};
// const useAudioRecorder:
