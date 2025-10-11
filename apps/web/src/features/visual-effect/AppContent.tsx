"use client";

import { ArrowClockwiseIcon, HashStraightIcon, HeartIcon, PlayIcon, SkullIcon, StopIcon } from "@phosphor-icons/react";
import { MotionConfig } from "motion/react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { EffectLogo } from "@/features/visual-effect/components/feedback";
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
import type { AppItem, ExampleItem, ExampleMeta } from "@/features/visual-effect/lib/example-types";
import { defaultSpring } from "@/features/visual-effect/motionConfig";
import { appItems, createExampleId } from "@/features/visual-effect/shared/appItems";
import { taskSounds } from "@/features/visual-effect/sounds/TaskSounds";
import { InfoCallout } from "./components/InfoCallout";

type ExampleComponent = React.ComponentType<{
  index: number;
  metadata: ExampleMeta;
  exampleId: string;
}>;

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

// Helper function to get item section
function getItemSection(item: AppItem): string {
  return item.type === "example" ? item.metadata.section : item.section;
}

function AppContentInner() {
  const [isMuted, setIsMuted] = useState(false);

  // Update sound system when mute changes
  useEffect(() => {
    taskSounds.setMuted(isMuted);
  }, [isMuted]);

  const [currentExampleId, setCurrentExampleId] = useState<string | undefined>();

  // Handle example selection from sidebar
  const handleExampleSelect = useCallback((id: string) => {
    setCurrentExampleId(id);
    // Scroll to the element
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  // Prepare data for the Command-K quick-open modal
  const quickOpenItems = useMemo(
    () =>
      appItems
        .filter((item): item is ExampleItem => item.type === "example")
        .map((item) => ({
          id: createExampleId(item.metadata.name, item.metadata.variant),
          name: item.metadata.name,
          ...(item.metadata.variant ? { variant: item.metadata.variant } : {}),
          section: item.metadata.section,
        })),
    []
  );

  // Memoize the examples for NavigationSidebar to prevent re-renders
  const navigationExamples = useMemo(
    () =>
      appItems
        .filter((item): item is ExampleItem => item.type === "example")
        .map((item) => ({
          id: createExampleId(item.metadata.name, item.metadata.variant),
          name: item.metadata.name,
          ...(item.metadata.variant ? { variant: item.metadata.variant } : {}),
          section: item.metadata.section,
        })),
    []
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-mono relative overflow-hidden">
      {/* Command-K quick-open modal */}
      <QuickOpen items={quickOpenItems} onSelect={handleExampleSelect} />

      <div className="relative mx-auto flex w-full max-w-screen-2xl flex-col gap-12 px-4 pb-16 pt-12 sm:px-6 lg:px-8 xl:flex-row xl:items-start xl:gap-16">
        {/* Navigation Sidebar */}
        <NavigationSidebar
          className="order-last w-full flex-none rounded-2xl border border-neutral-800/60 bg-neutral-900/40 backdrop-blur xl:order-first xl:sticky xl:top-12 xl:mb-0 xl:h-[calc(100vh-6rem)] xl:w-64 xl:overflow-hidden xl:rounded-none xl:border-none xl:bg-transparent"
          examples={navigationExamples}
          currentExample={currentExampleId || undefined}
          onExampleSelect={handleExampleSelect}
        />

        <div className="flex-1">
          <div className="relative z-10 mx-auto flex w-full max-w-screen-lg flex-col items-center gap-10">
            <PageHeader isMuted={isMuted} onMuteToggle={() => setIsMuted(!isMuted)} />

            {/* Introduction section */}
            <div className="relative w-full max-w-screen-md overflow-hidden rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 p-8 text-lg text-neutral-300 shadow-2xl backdrop-blur-sm">
              <div className="relative z-10">
                <p className="text-left text-xl font-light leading-relaxed">
                  Here are some interactive examples of TypeScript's beautiful{" "}
                  <EffectLogo className="relative inline-block h-4 top-[-1px] pr-3 opacity-90" />
                  <a
                    href="https://effect.website"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block cursor-pointer font-extrabold tracking-wider transition-all duration-300 hover:text-white"
                  >
                    Effect
                  </a>{" "}
                  library. Tap the following effects to <PlayIcon size={16} className="mr-2 inline" weight="bold" />
                  <span className="font-bold">run</span>, <StopIcon size={16} className="mr-2 inline" weight="bold" />
                  <span className="font-bold">interrupt</span>, or{" "}
                  <ArrowClockwiseIcon size={16} className="mr-2 inline" weight="bold" />
                  <span className="font-bold">reset</span> them.
                </p>
              </div>
            </div>

            {/* Multiple effect examples and callouts */}
            <div className="flex w-full max-w-screen-md flex-col items-center gap-y-8 sm:gap-y-12">
              {appItems.map((item, index) => {
                const prevItem: AppItem | undefined = index > 0 ? appItems[index - 1] : undefined;
                const showSectionHeader =
                  index === 0 || (prevItem !== undefined && getItemSection(prevItem) !== getItemSection(item));

                return (
                  <Fragment key={index}>
                    {showSectionHeader && (
                      <div className="w-full pt-6">
                        <h2 className="mb-2 flex items-center gap-3 text-lg font-bold tracking-wider text-neutral-300 sm:text-2xl">
                          <span className="rounded-lg border border-neutral-700/50 bg-gradient-to-br from-neutral-800 to-neutral-900 p-2">
                            <HashStraightIcon weight="bold" size={20} className="text-neutral-400" />
                          </span>
                          <span className="text-neutral-400">{getItemSection(item).toUpperCase()}</span>
                        </h2>
                      </div>
                    )}
                    <div className="relative w-full">
                      {item.type === "example" ? (
                        <div id={createExampleId(item.metadata.name, item.metadata.variant)}>
                          {(() => {
                            const Component = exampleComponentById[item.metadata.id];
                            if (!Component) return null;
                            return (
                              <Component
                                metadata={item.metadata}
                                index={index}
                                exampleId={createExampleId(item.metadata.name, item.metadata.variant)}
                              />
                            );
                          })()}
                        </div>
                      ) : (
                        <InfoCallout>{item.content}</InfoCallout>
                      )}
                    </div>
                  </Fragment>
                );
              })}
            </div>

            {/* Footer */}
            <footer className="mt-24 mb-12 flex w-full max-w-screen-md items-center justify-between text-xs sm:text-base">
              {/* Left side */}
              <div className="flex items-center gap-1.5 font-bold tracking-wide text-neutral-400 sm:gap-2">
                EFFECT OR
                <SkullIcon size={16} weight="fill" className="text-neutral-400 sm:hidden" />
                <SkullIcon size={19} weight="fill" className="ml-[3px] hidden text-neutral-400 sm:block" />
              </div>

              {/* Right side */}
              <a
                href="https://twitter.com/kitlangton"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-1.5 font-bold tracking-wide text-neutral-400 transition-all duration-300 hover:text-neutral-200 sm:gap-2"
              >
                <HeartIcon
                  size={14}
                  weight="fill"
                  className="text-red-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400 sm:hidden"
                />
                <HeartIcon
                  size={18}
                  weight="fill"
                  className="hidden text-red-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-red-400 sm:block"
                />
                KIT
              </a>
            </footer>
          </div>
        </div>
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
