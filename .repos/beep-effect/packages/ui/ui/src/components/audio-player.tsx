"use client";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { $UiId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { BS } from "@beep/schema";
import { cn } from "@beep/ui-core/utils";
import { CheckIcon, GearIcon, PauseIcon, PlayIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import type * as React from "react";
import type { HTMLProps, ReactNode, RefObject } from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

const $I = $UiId.create("components/audio-player");

class PlayPromiseRefError extends S.TaggedError<PlayPromiseRefError>($I`PlayPromiseRefError`)(
  "PlayPromiseRefError",
  {
    cause: S.Defect,
  },
  $I.annotations("PlayPromiseRefError", {
    description: "An error which occured while attempting to play an audio file ref",
  })
) {
  static readonly new = (cause: unknown) => new PlayPromiseRefError({ cause });
}

export class ReadyState extends BS.MappedLiteralKit(
  ["HAVE_NOTHING", 0],
  ["HAVE_METADATA", 1],
  ["HAVE_CURRENT_DATA", 2],
  ["HAVE_FUTURE_DATA", 3],
  ["HAVE_ENOUGH_DATA", 4]
) {}

export class NetworkState extends BS.MappedLiteralKit(
  ["NETWORK_EMPTY", 0],
  ["NETWORK_IDLE", 1],
  ["NETWORK_LOADING", 2],
  ["NETWORK_NO_SOURCE", 3]
) {}

export declare namespace ReadyState {
  export type Type = typeof ReadyState.Type;
}

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins < 10 ? `0${mins}` : mins;
  const formattedSecs = secs < 10 ? `0${secs}` : secs;

  return hrs > 0 ? `${hrs}:${formattedMins}:${formattedSecs}` : `${mins}:${formattedSecs}`;
}

interface AudioPlayerItem<TData = unknown> {
  readonly id: string | number;
  readonly src: string;
  readonly data?: undefined | TData;
}

interface AudioPlayerApi<TData = unknown> {
  readonly ref: RefObject<HTMLAudioElement | null>;
  readonly activeItem: AudioPlayerItem<TData> | null;
  readonly duration: number | undefined;
  readonly error: MediaError | null;
  readonly isPlaying: boolean;
  readonly isBuffering: boolean;
  readonly playbackRate: number;
  readonly isItemActive: (id: string | number | null) => boolean;
  readonly setActiveItem: (item: AudioPlayerItem<TData> | null) => Promise<void>;
  readonly play: (item?: undefined | AudioPlayerItem<TData> | null) => Promise<void>;
  readonly pause: () => void;
  readonly seek: (time: number) => void;
  readonly setPlaybackRate: (rate: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerApi | null>(null);

export function useAudioPlayer<TData = unknown>(): AudioPlayerApi<TData> {
  const api = useContext(AudioPlayerContext) as AudioPlayerApi<TData> | null;
  if (!api) {
    throw new Error("useAudioPlayer cannot be called outside of AudioPlayerProvider");
  }
  return api;
}

const AudioPlayerTimeContext = createContext<number | null>(null);

export const useAudioPlayerTime = () => {
  const time = useContext(AudioPlayerTimeContext);
  if (P.isNull(time)) {
    throw new Error("useAudioPlayerTime cannot be called outside of AudioPlayerProvider");
  }
  return time;
};

export function AudioPlayerProvider<TData = unknown>({ children }: { readonly children: ReactNode }) {
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);
  const audioRef = useRef<HTMLAudioElement>(null);
  const itemRef = useRef<AudioPlayerItem<TData> | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);
  const [readyState, setReadyState] = useState<number>(0);
  const [networkState, setNetworkState] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [error, setError] = useState<MediaError | null>(null);
  const [activeItem, _setActiveItem] = useState<AudioPlayerItem<TData> | null>(null);
  const [paused, setPaused] = useState(true);
  const [playbackRate, setPlaybackRateState] = useState<number>(1);

  const setActiveItem = useCallback(async (item: AudioPlayerItem<TData> | null) => {
    if (P.isNullable(audioRef.current)) return;

    if (item?.id === itemRef.current?.id) {
      return;
    }
    itemRef.current = item;
    const currentRate = audioRef.current.playbackRate;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    if (P.isNull(item)) {
      audioRef.current.removeAttribute("src");
    } else {
      audioRef.current.src = item.src;
    }
    audioRef.current.load();
    audioRef.current.playbackRate = currentRate;
  }, A.empty());

  const playEffect = Effect.fnUntraced(function* (item?: undefined | AudioPlayerItem<TData> | null) {
    if (P.isNullable(audioRef.current)) return;
    if (P.isNotNullable(playPromiseRef.current)) {
      yield* F.pipe(
        Effect.tryPromise({
          try: async () => {
            await playPromiseRef.current;
          },
          catch: PlayPromiseRefError.new,
        }),
        Effect.tapError((e) => Effect.logError(`Play promise error: ${e}`))
      );
    }

    if (P.isUndefined(item)) {
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      return playPromise;
    }
    if (item?.id === activeItem?.id) {
      const playPromise = audioRef.current.play();
      playPromiseRef.current = playPromise;
      return playPromise;
    }

    itemRef.current = item;
    const currentRate = audioRef.current.playbackRate;
    if (!audioRef.current.paused) {
      audioRef.current.pause();
    }
    audioRef.current.currentTime = 0;
    if (P.isNull(item)) {
      audioRef.current.removeAttribute("src");
    } else {
      audioRef.current.src = item.src;
    }
    audioRef.current.load();
    audioRef.current.playbackRate = currentRate;
    const playPromise = audioRef.current.play();
    playPromiseRef.current = playPromise;
    return playPromise;
  });

  const play = useCallback(
    async (item?: undefined | AudioPlayerItem<TData> | null) => runPromise(playEffect(item)),
    [activeItem, playEffect]
  );

  const pause = useCallback(async () => {
    if (P.isNullable(audioRef.current)) return;

    if (P.isNotNullable(playPromiseRef.current)) {
      try {
        await playPromiseRef.current;
      } catch (e) {
        console.error(e);
      }
    }

    audioRef.current.pause();
    playPromiseRef.current = null;
  }, A.empty());

  const seek = useCallback((time: number) => {
    if (P.isNullable(audioRef.current)) return;
    audioRef.current.currentTime = time;
  }, A.empty());

  const setPlaybackRate = useCallback((rate: number) => {
    if (P.isNullable(audioRef.current)) return;
    audioRef.current.playbackRate = rate;
    setPlaybackRateState(rate);
  }, A.empty());

  const isItemActive = useCallback(
    (id: string | number | null) => {
      return activeItem?.id === id;
    },
    [activeItem]
  );

  useAnimationFrame(() => {
    if (audioRef.current) {
      _setActiveItem(itemRef.current);
      setReadyState(audioRef.current.readyState);
      setNetworkState(audioRef.current.networkState);
      setTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
      setPaused(audioRef.current.paused);
      setError(audioRef.current.error);
      setPlaybackRateState(audioRef.current.playbackRate);
    }
  });

  const isPlaying = !paused;
  const isBuffering =
    readyState < ReadyState.DecodedEnum.HAVE_FUTURE_DATA && networkState === NetworkState.DecodedEnum.NETWORK_LOADING;

  const api = useMemo<AudioPlayerApi<TData>>(
    () => ({
      ref: audioRef,
      duration,
      error,
      isPlaying,
      isBuffering,
      activeItem,
      playbackRate,
      isItemActive,
      setActiveItem,
      play,
      pause,
      seek,
      setPlaybackRate,
    }),
    [
      audioRef,
      duration,
      error,
      isPlaying,
      isBuffering,
      activeItem,
      playbackRate,
      isItemActive,
      setActiveItem,
      play,
      pause,
      seek,
      setPlaybackRate,
    ]
  );

  return (
    <AudioPlayerContext.Provider value={api as AudioPlayerApi}>
      <AudioPlayerTimeContext.Provider value={time}>
        {/* */}
        <audio ref={audioRef} className="hidden" crossOrigin="anonymous">
          <track kind="captions" />
        </audio>
        {children}
      </AudioPlayerTimeContext.Provider>
    </AudioPlayerContext.Provider>
  );
}

export const AudioPlayerProgress = ({
  className,
  ref,
  ...otherProps
}: Omit<SliderPrimitive.Root.Props, "min" | "max" | "value">) => {
  const player = useAudioPlayer();
  const time = useAudioPlayerTime();
  const wasPlayingRef = useRef(false);

  return (
    <SliderPrimitive.Root
      {...otherProps}
      {...(ref ? { ref } : {})}
      value={[time]}
      onValueChange={(value, eventDetails) => {
        const values = Match.value(value).pipe(
          Match.when(
            (u: unknown): u is ReadonlyArray<number> => Array.isArray(u),
            (v) => v
          ),
          Match.when(
            (u: unknown): u is number => P.isNumber(u),
            (v) => [v] as const
          ),
          Match.orElse(A.empty<number>)
        );
        const valueOption = A.head(values);
        if (O.isSome(valueOption)) {
          player.seek(valueOption.value);
        }
        otherProps.onValueChange?.(value, eventDetails);
      }}
      min={0}
      max={player.duration ?? 0}
      step={otherProps.step || 0.25}
      disabled={player.duration === undefined || !Number.isFinite(player.duration) || Number.isNaN(player.duration)}
    >
      <SliderPrimitive.Control
        className={cn(
          "group/player relative flex h-4 touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-44 data-vertical:w-auto data-vertical:flex-col",
          className
        )}
        onPointerDown={(_) => {
          wasPlayingRef.current = player.isPlaying;
          player.pause();
        }}
        onPointerUp={(_) => {
          if (wasPlayingRef.current) {
            void player.play();
          }
        }}
        onKeyDown={(e) => {
          if (e.key === " ") {
            e.preventDefault();
            if (!player.isPlaying) {
              void player.play();
            } else {
              player.pause();
            }
          }
        }}
      >
        <SliderPrimitive.Track className="bg-muted relative h-[4px] w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Indicator className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          className="relative flex h-0 w-0 items-center justify-center opacity-0 group-hover/player:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          data-slot="slider-thumb"
        >
          <div className="bg-foreground absolute size-3 rounded-full" />
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
};

export const AudioPlayerTime = ({ className, ...otherProps }: HTMLProps<HTMLSpanElement>) => {
  const time = useAudioPlayerTime();
  return (
    <span {...otherProps} className={cn("text-muted-foreground text-sm tabular-nums", className)}>
      {formatTime(time)}
    </span>
  );
};

export const AudioPlayerDuration = ({ className, ...otherProps }: HTMLProps<HTMLSpanElement>) => {
  const player = useAudioPlayer();
  return (
    <span {...otherProps} className={cn("text-muted-foreground text-sm tabular-nums", className)}>
      {player.duration !== null && player.duration !== undefined && !Number.isNaN(player.duration)
        ? formatTime(player.duration)
        : "--:--"}
    </span>
  );
};

interface SpinnerProps {
  className?: string;
}

function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn("border-muted border-t-foreground size-3.5 animate-spin rounded-full border-2", className)}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

type PlayButtonProps = React.ComponentProps<typeof Button> & {
  readonly playing: boolean;
  readonly onPlayingChange: (playing: boolean) => void;
  readonly loading?: undefined | boolean;
};

const PlayButton = ({ playing, onPlayingChange, className, onClick, loading, ...otherProps }: PlayButtonProps) => {
  return (
    <Button
      {...otherProps}
      onClick={(e) => {
        onPlayingChange(!playing);
        onClick?.(e);
      }}
      className={cn("relative", className)}
      aria-label={playing ? "Pause" : "Play"}
    >
      {playing ? (
        <PauseIcon className={cn("size-4", loading && "opacity-0")} aria-hidden="true" />
      ) : (
        <PlayIcon className={cn("size-4", loading && "opacity-0")} aria-hidden="true" />
      )}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[inherit] backdrop-blur-xs">
          <Spinner />
        </div>
      )}
    </Button>
  );
};

export type AudioPlayerButtonProps<TData = unknown> = React.ComponentProps<typeof Button> & {
  readonly item?: undefined | AudioPlayerItem<TData>;
};

export function AudioPlayerButton<TData = unknown>({ item, ...otherProps }: AudioPlayerButtonProps<TData>) {
  const player = useAudioPlayer<TData>();

  if (!item) {
    return (
      <PlayButton
        {...otherProps}
        playing={player.isPlaying}
        onPlayingChange={(shouldPlay) => {
          if (shouldPlay) {
            void player.play();
          } else {
            player.pause();
          }
        }}
        loading={player.isBuffering && player.isPlaying}
      />
    );
  }

  return (
    <PlayButton
      {...otherProps}
      playing={player.isItemActive(item.id) && player.isPlaying}
      onPlayingChange={(shouldPlay) => {
        if (shouldPlay) {
          void player.play(item);
        } else {
          player.pause();
        }
      }}
      loading={player.isItemActive(item.id) && player.isBuffering && player.isPlaying}
    />
  );
}

type Callback = (delta: number) => void;

function useAnimationFrame(callback: Callback) {
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef<Callback>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const delta = time - previousTimeRef.current;
        callbackRef.current(delta);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    };
  }, []);
}

const PLAYBACK_SPEEDS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

export type AudioPlayerSpeedProps = React.ComponentProps<typeof Button> & {
  readonly speeds?: undefined | readonly number[];
};

export function AudioPlayerSpeed({
  speeds = PLAYBACK_SPEEDS,
  className,
  variant = "ghost",
  size = "icon",
  ...props
}: AudioPlayerSpeedProps) {
  const player = useAudioPlayer();
  const currentSpeed = player.playbackRate;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant={variant} size={size} className={cn(className)} aria-label="Playback speed" {...props} />
        }
      >
        <GearIcon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {A.map(speeds, (speed) => (
          <DropdownMenuItem
            key={speed}
            onClick={() => player.setPlaybackRate(speed)}
            className="flex items-center justify-between"
          >
            <span className={speed === 1 ? Str.empty : "font-mono"}>{speed === 1 ? "Normal" : `${speed}x`}</span>
            {currentSpeed === speed && <CheckIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export interface AudioPlayerSpeedButtonGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  readonly speeds?: undefined | readonly number[];
}

export function AudioPlayerSpeedButtonGroup({
  speeds = [0.5, 1, 1.5, 2],
  className,
  ...props
}: AudioPlayerSpeedButtonGroupProps) {
  const player = useAudioPlayer();
  const currentSpeed = player.playbackRate;

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label="Playback speed controls"
      {...props}
    >
      {A.map(speeds, (speed) => (
        <Button
          key={speed}
          variant={currentSpeed === speed ? "default" : "outline"}
          size="sm"
          onClick={() => player.setPlaybackRate(speed)}
          className="min-w-[50px] font-mono text-xs"
        >
          {speed}x
        </Button>
      ))}
    </div>
  );
}

export const exampleTracks = [
  {
    id: "0",
    name: "II - 00",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/00.mp3",
  },
  {
    id: "1",
    name: "II - 01",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/01.mp3",
  },
  {
    id: "2",
    name: "II - 02",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/02.mp3",
  },
  {
    id: "3",
    name: "II - 03",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/03.mp3",
  },
  {
    id: "4",
    name: "II - 04",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/04.mp3",
  },
  {
    id: "5",
    name: "II - 05",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/05.mp3",
  },
  {
    id: "6",
    name: "II - 06",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/06.mp3",
  },
  {
    id: "7",
    name: "II - 07",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/07.mp3",
  },
  {
    id: "8",
    name: "II - 08",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/08.mp3",
  },
  {
    id: "9",
    name: "II - 09",
    url: "https://storage.googleapis.com/eleven-public-cdn/audio/ui-elevenlabs-io/09.mp3",
  },
];
