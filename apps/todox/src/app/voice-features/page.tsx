"use client";
import { $TodoxId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { Button } from "@beep/ui/components/button";
import { SimpleLayout } from "@beep/ui/layouts";
import { Atom, Registry, useAtom, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import * as Effect from "effect/Effect";
import { LiveWaveform } from "../../components/ui/live-waveform";

const $I = $TodoxId.create("app/voice-features/page");
class WaveformMode extends BS.StringLiteralKit("static", "scrolling").annotations(
  $I.annotations("WaveformMode", {
    description: "The mode of the live waveform",
  })
) {}

export declare namespace WaveformMode {
  export type Type = typeof WaveformMode.Type;
}

const activeAudioAtom = Atom.make(false);
const processingAudioAtom = Atom.make(false);
const modeAtom = Atom.make<WaveformMode.Type>(WaveformMode.Enum.static);

const handleToggleActiveAtom = Atom.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;

    const active = registry.get(activeAudioAtom);
    registry.set(activeAudioAtom, !active);
    if (!active) {
      registry.set(processingAudioAtom, false);
    }
  })
);

const handleToggleProcessingAtom = Atom.fn(
  Effect.fn(function* () {
    const registry = yield* Registry.AtomRegistry;

    const processing = registry.get(processingAudioAtom);
    registry.set(processingAudioAtom, !processing);
    if (!processing) {
      registry.set(activeAudioAtom, false);
    }
  })
);

const Page = () => {
  const active = useAtomValue(activeAudioAtom);
  const processing = useAtomValue(processingAudioAtom);
  const [mode, setMode] = useAtom(modeAtom);
  const handleToggleActive = useAtomSet(handleToggleActiveAtom);
  const handleToggleProcessing = useAtomSet(handleToggleProcessingAtom);

  return (
    <SimpleLayout>
      <div className="bg-card w-full rounded-lg border p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Live Audio Waveform</h3>
          <p className="text-muted-foreground text-sm">
            Real-time microphone input visualization with audio reactivity
          </p>
        </div>
        <div className="space-y-4">
          <LiveWaveform
            active={active}
            processing={processing}
            height={80}
            barWidth={3}
            barGap={2}
            mode={mode}
            fadeEdges={true}
            barColor="gray"
            historySize={120}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" variant={active ? "default" : "outline"} onClick={() => handleToggleActive()}>
              {active ? "Stop" : "Start"} Listening
            </Button>
            <Button size="sm" variant={processing ? "default" : "outline"} onClick={() => handleToggleProcessing()}>
              {processing ? "Stop" : "Start"} Processing
            </Button>
            <Button size="sm" variant="outline" onClick={() => setMode(mode === "static" ? "scrolling" : "static")}>
              Mode: {mode === "static" ? "Static" : "Scrolling"}
            </Button>
          </div>
        </div>
      </div>
    </SimpleLayout>
  );
};

export default Page;
