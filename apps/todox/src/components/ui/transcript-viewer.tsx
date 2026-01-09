"use client";

import {
  type SegmentComposer,
  type TranscriptSegment,
  type TranscriptWord as TranscriptWordType,
  type UseTranscriptViewerResult,
  useTranscriptViewer,
} from "@beep/todox/hooks/use-transcript-viewer";
import {cn} from "@beep/todox/lib/utils";
import type {
  CharacterAlignmentResponseModel
} from "@elevenlabs/elevenlabs-js/api/types/CharacterAlignmentResponseModel";
import * as A from "effect/Array";
import {Pause, Play} from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  type ComponentPropsWithRef,
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useMemo,
} from "react";
import {Button} from "./button";
import {ScrubBarContainer, ScrubBarProgress, ScrubBarThumb, ScrubBarTimeLabel, ScrubBarTrack} from "./scrub-bar";

type TranscriptGap = Extract<TranscriptSegment, { kind: "gap" }>;

type TranscriptViewerContextValue = UseTranscriptViewerResult & {
  readonly audioProps: Omit<ComponentPropsWithRef<"audio">, "children" | "src">;
};

const TranscriptViewerContext = createContext<TranscriptViewerContextValue | null>(null);

function useTranscriptViewerContext() {
  const context = useContext(TranscriptViewerContext);
  if (!context) {
    throw new Error("useTranscriptViewerContext must be used within a TranscriptViewer");
  }
  return context;
}

type TranscriptViewerProviderProps = {
  readonly value: TranscriptViewerContextValue;
  readonly children: ReactNode;
};

function TranscriptViewerProvider({value, children}: TranscriptViewerProviderProps) {
  return <TranscriptViewerContext.Provider value={value}>{children}</TranscriptViewerContext.Provider>;
}

type AudioType = "audio/mpeg" | "audio/wav" | "audio/ogg" | "audio/mp3" | "audio/m4a" | "audio/aac" | "audio/webm";

type TranscriptViewerContainerProps = {
  readonly audioSrc: string;
  readonly audioType: AudioType;
  readonly alignment: CharacterAlignmentResponseModel;
  readonly segmentComposer?: undefined | SegmentComposer;
  readonly hideAudioTags?: undefined | boolean;
  readonly children?: undefined | ReactNode;
} & Omit<ComponentPropsWithoutRef<"div">, "children"> &
  Pick<
    Parameters<typeof useTranscriptViewer>[0],
    "onPlay" | "onPause" | "onTimeUpdate" | "onEnded" | "onDurationChange"
  >;

function TranscriptViewerContainer({
                                     audioSrc,
                                     audioType = "audio/mpeg",
                                     alignment,
                                     segmentComposer,
                                     hideAudioTags = true,
                                     children,
                                     className,
                                     onPlay,
                                     onPause,
                                     onTimeUpdate,
                                     onEnded,
                                     onDurationChange,
                                     ...props
                                   }: TranscriptViewerContainerProps) {
  const viewerState = useTranscriptViewer({
    alignment,
    hideAudioTags,
    segmentComposer,
    onPlay,
    onPause,
    onTimeUpdate,
    onEnded,
    onDurationChange,
  });

  const {audioRef} = viewerState;

  const audioProps = useMemo(
    () => ({
      ref: audioRef,
      controls: false,
      preload: "metadata" as const,
      src: audioSrc,
      children: <source src={audioSrc} type={audioType}/>,
    }),
    [audioRef, audioSrc]
  );

  const contextValue = useMemo(
    () => ({
      ...viewerState,
      audioProps,
    }),
    [viewerState, audioProps]
  );

  return (
    <TranscriptViewerProvider value={contextValue}>
      <div data-slot="transcript-viewer-root" className={cn("space-y-4 p-4", className)} {...props}>
        {children}
      </div>
    </TranscriptViewerProvider>
  );
}

type TranscriptViewerWordStatus = "spoken" | "unspoken" | "current";

interface TranscriptViewerWordProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  readonly word: TranscriptWordType;
  readonly status: TranscriptViewerWordStatus;
  readonly children?: undefined | ReactNode;
}

function TranscriptViewerWord({word, status, className, children, ...props}: TranscriptViewerWordProps) {
  return (
    <span
      data-slot="transcript-word"
      data-kind="word"
      data-status={status}
      className={cn(
        "rounded-sm px-0.5 transition-colors",
        status === "spoken" && "text-foreground",
        status === "unspoken" && "text-muted-foreground",
        status === "current" && "bg-primary text-primary-foreground",
        className
      )}
      {...props}
    >
      {children ?? word.text}
    </span>
  );
}

interface TranscriptViewerWordsProps extends HTMLAttributes<HTMLDivElement> {
  readonly renderWord?:
    | undefined
    | ((props: { readonly word: TranscriptWordType; readonly status: TranscriptViewerWordStatus }) => ReactNode);
  readonly renderGap?:
    | undefined
    | ((props: { readonly segment: TranscriptGap; readonly status: TranscriptViewerWordStatus }) => ReactNode);
  readonly wordClassNames?: undefined | string;
  readonly gapClassNames?: undefined | string;
}

function TranscriptViewerWords({
                                 className,
                                 renderWord,
                                 renderGap,
                                 wordClassNames,
                                 gapClassNames,
                                 ...props
                               }: TranscriptViewerWordsProps) {
  const {spokenSegments, unspokenSegments, currentWord, segments, duration, currentTime} =
    useTranscriptViewerContext();

  const nearEnd = useMemo(() => {
    if (!duration) return false;
    return currentTime >= duration - 0.01;
  }, [currentTime, duration]);

  const segmentsWithStatus = useMemo(() => {
    if (nearEnd) {
      return A.map(segments, (segment) => ({segment, status: "spoken" as const}));
    }

    const entries = A.empty<{
      readonly segment: TranscriptSegment;
      readonly status: TranscriptViewerWordStatus;
    }>();

    for (const segment of spokenSegments) {
      entries.push({segment, status: "spoken"});
    }

    if (currentWord) {
      entries.push({segment: currentWord, status: "current"});
    }

    for (const segment of unspokenSegments) {
      entries.push({segment, status: "unspoken"});
    }

    return entries;
  }, [spokenSegments, unspokenSegments, currentWord, nearEnd, segments]);

  return (
    <div data-slot="transcript-words" className={cn("text-xl leading-relaxed", className)} {...props}>
      {A.map(segmentsWithStatus, ({segment, status}) => {
        if (segment.kind === "gap") {
          const content = renderGap ? renderGap({segment, status}) : segment.text;
          return (
            <span
              key={`gap-${segment.segmentIndex}`}
              data-kind="gap"
              data-status={status}
              className={cn(gapClassNames)}
            >
              {content}
            </span>
          );
        }

        if (renderWord) {
          return (
            <span
              key={`word-${segment.segmentIndex}`}
              data-kind="word"
              data-status={status}
              className={cn(wordClassNames)}
            >
              {renderWord({word: segment, status})}
            </span>
          );
        }

        return (
          <TranscriptViewerWord
            key={`word-${segment.segmentIndex}`}
            word={segment}
            status={status}
            className={wordClassNames}
          />
        );
      })}
    </div>
  );
}

function TranscriptViewerAudio({...props}: ComponentPropsWithoutRef<"audio">) {
  const {audioProps} = useTranscriptViewerContext();
  return <audio data-slot="transcript-audio" {...audioProps} {...props} ref={audioProps.ref}/>;
}

type RenderChildren = (state: { readonly isPlaying: boolean }) => ReactNode;

type TranscriptViewerPlayPauseButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "children"> & {
  readonly children?: undefined | ReactNode | RenderChildren;
};

function TranscriptViewerPlayPauseButton({className, children, ...props}: TranscriptViewerPlayPauseButtonProps) {
  const {isPlaying, play, pause} = useTranscriptViewerContext();
  const Icon = isPlaying ? Pause : Play;

  const handleClick = () => {
    if (isPlaying) pause();
    else play();
  };

  const content = typeof children === "function" ? (children as RenderChildren)({isPlaying}) : children;

  return (
    <Button
      data-slot="transcript-play-pause-button"
      variant="outline"
      size="icon"
      aria-label={isPlaying ? "Pause audio" : "Play audio"}
      data-playing={isPlaying}
      className={cn("cursor-pointer", className)}
      onClick={handleClick}
      {...props}
    >
      {content ?? <Icon className="size-5"/>}
    </Button>
  );
}

type TranscriptViewerScrubBarProps = Omit<
  ComponentPropsWithoutRef<typeof ScrubBarContainer>,
  "duration" | "value" | "onScrub" | "onScrubStart" | "onScrubEnd"
> & {
  readonly showTimeLabels?: undefined | boolean;
  readonly labelsClassName?: undefined | string;
  readonly trackClassName?: undefined | string;
  readonly progressClassName?: undefined | string;
  readonly thumbClassName?: undefined | string;
};

/**
 * A context-aware implementation of the scrub bar specific to the transcript viewer.
 */
function TranscriptViewerScrubBar({
                                    className,
                                    showTimeLabels = true,
                                    labelsClassName,
                                    trackClassName,
                                    progressClassName,
                                    thumbClassName,
                                    ...props
                                  }: TranscriptViewerScrubBarProps) {
  const {duration, currentTime, seekToTime, startScrubbing, endScrubbing} = useTranscriptViewerContext();
  return (
    <ScrubBarContainer
      data-slot="transcript-scrub-bar"
      duration={duration}
      value={currentTime}
      onScrubStart={startScrubbing}
      onScrubEnd={endScrubbing}
      onScrub={seekToTime}
      className={className}
      {...props}
    >
      <div className="flex flex-1 flex-col gap-1">
        <ScrubBarTrack className={trackClassName}>
          <ScrubBarProgress className={progressClassName}/>
          <ScrubBarThumb className={thumbClassName}/>
        </ScrubBarTrack>
        {showTimeLabels && (
          <div className={cn("text-muted-foreground flex items-center justify-between text-xs", labelsClassName)}>
            <ScrubBarTimeLabel time={currentTime}/>
            <ScrubBarTimeLabel time={duration - currentTime}/>
          </div>
        )}
      </div>
    </ScrubBarContainer>
  );
}

export {
  TranscriptViewerContainer,
  TranscriptViewerWords,
  TranscriptViewerWord,
  TranscriptViewerAudio,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerProvider,
  useTranscriptViewerContext,
};
export type {CharacterAlignmentResponseModel};
