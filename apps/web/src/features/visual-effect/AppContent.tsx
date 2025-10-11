"use client";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import { AnimatePresence, MotionConfig, m } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavigationSidebar, PageHeader } from "@/features/visual-effect/components/layout";
import { QuickOpen } from "@/features/visual-effect/components/ui";
// Examples
import EffectAcquireRelease from "@/features/visual-effect/examples/effect-acquire-release";
import EffectAddFinalizer from "@/features/visual-effect/examples/effect-add-finalizer";
import EffectAll from "@/features/visual-effect/examples/effect-all";
import EffectAllShortCircuit from "@/features/visual-effect/examples/effect-all-short-circuit";
import EffectDie from "@/features/visual-effect/examples/effect-die";
import EffectEventually from "@/features/visual-effect/examples/effect-eventually";
import EffectFail from "@/features/visual-effect/examples/effect-fail";
import EffectForEach from "@/features/visual-effect/examples/effect-foreach";
import EffectOrElse from "@/features/visual-effect/examples/effect-orelse";
import EffectPartition from "@/features/visual-effect/examples/effect-partition";
import EffectPromise from "@/features/visual-effect/examples/effect-promise";
import EffectRace from "@/features/visual-effect/examples/effect-race";
import EffectRaceAll from "@/features/visual-effect/examples/effect-raceall";
import EffectRepeatSpaced from "@/features/visual-effect/examples/effect-repeat-spaced";
import EffectRepeatWhileOutput from "@/features/visual-effect/examples/effect-repeat-while-output";
import EffectRetryExponential from "@/features/visual-effect/examples/effect-retry-exponential";
import EffectRetryRecurs from "@/features/visual-effect/examples/effect-retry-recurs";
import EffectSleep from "@/features/visual-effect/examples/effect-sleep";
import EffectSucceed from "@/features/visual-effect/examples/effect-succeed";
import EffectSync from "@/features/visual-effect/examples/effect-sync";
import EffectTimeout from "@/features/visual-effect/examples/effect-timeout";
import EffectValidate from "@/features/visual-effect/examples/effect-validate";
import RefMake from "@/features/visual-effect/examples/ref-make";
import RefUpdateAndGet from "@/features/visual-effect/examples/ref-update-and-get";
import type { ExampleMeta } from "@/features/visual-effect/lib/example-types";
import { defaultSpring } from "@/features/visual-effect/motionConfig";
import { appItems, createExampleId } from "@/features/visual-effect/shared/appItems";
import { taskSounds } from "@/features/visual-effect/sounds/TaskSounds";

type ExampleComponent = React.ComponentType<{
  index: number;
  metadata: ExampleMeta;
  exampleId: string;
}>;

type PreparedExample = {
  id: string;
  metadata: ExampleMeta;
  index: number;
};

const exampleComponentById: Record<string, ExampleComponent> = {
  "effect-acquire-release": EffectAcquireRelease,
  "effect-add-finalizer": EffectAddFinalizer,
  "effect-all-short-circuit": EffectAllShortCircuit,
  "effect-all": EffectAll,
  "effect-die": EffectDie,
  "effect-eventually": EffectEventually,
  "effect-fail": EffectFail,
  "effect-foreach": EffectForEach,
  "effect-orelse": EffectOrElse,
  "effect-partition": EffectPartition,
  "effect-promise": EffectPromise,
  "effect-race": EffectRace,
  "effect-raceall": EffectRaceAll,
  "effect-repeat-spaced": EffectRepeatSpaced,
  "effect-repeat-while-output": EffectRepeatWhileOutput,
  "effect-retry-exponential": EffectRetryExponential,
  "effect-retry-recurs": EffectRetryRecurs,
  "effect-sleep": EffectSleep,
  "effect-succeed": EffectSucceed,
  "effect-sync": EffectSync,
  "effect-timeout": EffectTimeout,
  "effect-validate": EffectValidate,
  "ref-make": RefMake,
  "ref-update-and-get": RefUpdateAndGet,
};

function AppContentInner() {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    taskSounds.setMuted(isMuted);
  }, [isMuted]);

  const preparedExamples = useMemo(
    () =>
      F.pipe(
        appItems,
        A.filterMap((item, index) =>
          item.type === "example"
            ? O.some<PreparedExample>({
                id: createExampleId(item.metadata.name, item.metadata.variant),
                metadata: item.metadata,
                index,
              })
            : O.none()
        )
      ),
    []
  );

  const quickOpenItems = useMemo(
    () =>
      F.pipe(
        preparedExamples,
        A.map((item) => ({
          id: item.id,
          name: item.metadata.name,
          ...(item.metadata.variant ? { variant: item.metadata.variant } : {}),
          section: item.metadata.section,
        }))
      ),
    [preparedExamples]
  );

  const [currentExampleId, setCurrentExampleId] = useState<string | undefined>(() =>
    F.pipe(
      preparedExamples,
      A.get(0),
      O.map((item) => item.id),
      O.getOrUndefined
    )
  );

  const currentExampleOption = useMemo(
    () =>
      F.pipe(
        O.fromNullable(currentExampleId),
        O.flatMap((id) =>
          F.pipe(
            preparedExamples,
            A.findFirst((item) => item.id === id)
          )
        ),
        O.orElse(() => F.pipe(preparedExamples, A.get(0)))
      ),
    [currentExampleId, preparedExamples]
  );

  const currentExample = useMemo(() => O.getOrUndefined(currentExampleOption), [currentExampleOption]);

  const handleExampleSelect = useCallback((id: string) => {
    setCurrentExampleId(id);
  }, []);

  const ExampleComponent = currentExample ? exampleComponentById[currentExample.metadata.id] : undefined;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--color-background-default)]">
      <QuickOpen items={quickOpenItems} onSelect={handleExampleSelect} />

      <div className="relative flex w-full max-w-screen-2xl flex-col gap-8 pt-0 xl:flex-row xl:items-start xl:gap-10">
        <NavigationSidebar
          className="w-full flex-none rounded-3xl bg-[rgba(var(--mui-palette-background-paperChannel),0.92)] backdrop-blur-sm xl:sticky xl:top-0 xl:mb-0 xl:h-[calc(100vh-4rem)] xl:w-[25rem] xl:rounded-none"
          examples={quickOpenItems}
          currentExample={currentExample?.id}
          onExampleSelect={handleExampleSelect}
        />

        <main className="flex-1 pt-10 sm:pt-12">
          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-3">
            <PageHeader isMuted={isMuted} onMuteToggle={() => setIsMuted(!isMuted)} />

            {currentExample && ExampleComponent ? (
              <div className="relative rounded-3xl bg-[rgba(var(--mui-palette-background-paperChannel),0.94)] p-3 shadow-[0_16px_70px_rgba(0,0,0,0.28)]">
                <AnimatePresence initial={false} mode="wait">
                  <m.div
                    key={currentExample.id}
                    initial={{ opacity: 0, x: 48 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -32 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ExampleComponent
                      metadata={currentExample.metadata}
                      index={currentExample.index}
                      exampleId={currentExample.id}
                    />
                  </m.div>
                </AnimatePresence>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppContent() {
  return (
    <MotionConfig transition={defaultSpring}>
      <AppContentInner />
    </MotionConfig>
  );
}
