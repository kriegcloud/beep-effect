"use client";
import "@beep/ui/organisms/audio-recorder/audio-recorder.css";
import { SimpleLayout } from "@beep/ui/layouts/simple";
import { AudioRecorder, useAudioRecorder } from "@beep/ui/organisms";
import { AudioVisualizer, LiveAudioVisualizer } from "@beep/ui/organisms/visualize-audio";
import Box from "@mui/material/Box";
import React from "react";

export default function Page() {
  const [blob, setBlob] = React.useState<Blob>();
  const recorder = useAudioRecorder();

  return (
    <SimpleLayout>
      <Box>
        <AudioRecorder onRecordingComplete={setBlob} recorderControls={recorder} />

        {recorder.mediaRecorder && (
          <LiveAudioVisualizer mediaRecorder={recorder.mediaRecorder} width={200} height={75} />
        )}

        {blob && <AudioVisualizer blob={blob} width={500} height={75} barWidth={1} gap={0} barColor={"#f76565"} />}

        {blob && <AudioVisualizer blob={blob} width={500} height={75} barWidth={4} gap={4} barColor={"lightblue"} />}
      </Box>
    </SimpleLayout>
  );
}
