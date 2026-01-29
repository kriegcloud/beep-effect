"use client";

import { $TodoxId } from "@beep/identity/packages";
import { makeRunClientPromise, useRuntime } from "@beep/runtime-client";
import { cn } from "@beep/todox/lib/utils";
import { thunk } from "@beep/utils";
import * as Permissions from "@effect/platform-browser/Permissions";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as Eq from "effect/Equal";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { Check, ChevronsUpDown, Mic, MicOff } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { LiveWaveform } from "./live-waveform";

const $I = $TodoxId.create("components/ui/mic-selector");

export class MediaDeviceEnumerationError extends S.TaggedError<MediaDeviceEnumerationError>(
  $I`MediaDeviceEnumerationError`
)(
  "MediaDeviceEnumerationError",
  {
    cause: S.Defect,
  },
  $I.annotations("MediaDeviceEnumerationError", {
    description: "An error which occured while attempting to enumerate the clients media devices",
  })
) {
  static readonly new = (cause: unknown) => new MediaDeviceEnumerationError({ cause });
}

export class MediaDevicePermissionError extends S.TaggedError<MediaDevicePermissionError>(
  $I`MediaDevicePermissionError`
)(
  "MediaDevicePermissionError",
  {
    cause: S.Defect,
  },
  $I.annotations("MediaDevicePermissionError", {
    description: "An error which occurred while requesting microphone permission",
  })
) {
  static readonly new = (cause: unknown) => new MediaDevicePermissionError({ cause });
}

export interface AudioDevice {
  readonly deviceId: string;
  readonly label: string;
  readonly groupId: string;
}

export interface MicSelectorProps {
  readonly value?: undefined | string;
  readonly onValueChange?: undefined | ((deviceId: string) => void);
  readonly muted?: undefined | boolean;
  readonly onMutedChange?: undefined | ((muted: boolean) => void);
  readonly disabled?: undefined | boolean;
  readonly className?: undefined | string;
}

export function MicSelector({ value, onValueChange, muted, onMutedChange, disabled, className }: MicSelectorProps) {
  const { devices, loading, error, hasPermission, loadDevices } = useAudioDevices();
  const [selectedDevice, setSelectedDevice] = useState<string>(value || Str.empty);
  const [internalMuted, setInternalMuted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Use controlled muted if provided, otherwise use internal state
  const isMuted = muted !== undefined ? muted : internalMuted;

  // Update internal state when controlled value changes
  useEffect(() => {
    if (P.isNotUndefined(value)) {
      setSelectedDevice(value);
    }
  }, [value]);

  // Select first device by default
  const defaultDeviceId = O.getOrElse(A.get(devices, 0), thunk({ deviceId: Str.empty })).deviceId;
  useEffect(() => {
    if (!selectedDevice && defaultDeviceId) {
      const newDevice = defaultDeviceId;
      setSelectedDevice(newDevice);
      onValueChange?.(newDevice);
    }
  }, [defaultDeviceId, selectedDevice, onValueChange]);

  const currentDevice = O.getOrElse(
    O.orElse(A.findFirst(devices, Eq.equals(selectedDevice)), thunk(A.get(devices, 0))),
    thunk({
      label: loading ? "Loading..." : "No microphone",
      deviceId: Str.empty,
      groupId: Str.empty,
    })
  );

  const handleDeviceSelect = (deviceId: string, e?: React.MouseEvent) => {
    e?.preventDefault();
    setSelectedDevice(deviceId);
    onValueChange?.(deviceId);
  };

  const handleDropdownOpenChange = async (open: boolean) => {
    setIsDropdownOpen(open);
    if (open && !hasPermission && !loading) {
      await loadDevices();
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    if (P.isUndefined(muted)) {
      setInternalMuted(newMuted);
    }
    onMutedChange?.(newMuted);
  };

  const isPreviewActive = isDropdownOpen && !isMuted;

  return (
    <DropdownMenu onOpenChange={handleDropdownOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn("hover:bg-accent flex w-48 cursor-pointer items-center gap-1.5", className)}
            disabled={loading || disabled}
          />
        }
      >
        {isMuted ? <MicOff className="h-4 w-4 flex-shrink-0" /> : <Mic className="h-4 w-4 flex-shrink-0" />}
        <span className="flex-1 truncate text-left">{currentDevice.label}</span>
        <ChevronsUpDown className="h-3 w-3 flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" side="top" className="w-72">
        {loading ? (
          <DropdownMenuItem disabled>Loading devices...</DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem disabled>Error: {error}</DropdownMenuItem>
        ) : (
          A.map(devices, (device) => (
            <DropdownMenuItem
              key={device.deviceId}
              onClick={(e) => handleDeviceSelect(device.deviceId, e)}
              onSelect={(e) => e.preventDefault()}
              className="flex items-center justify-between"
            >
              <span className="truncate">{device.label}</span>
              {selectedDevice === device.deviceId && <Check className="h-4 w-4 flex-shrink-0" />}
            </DropdownMenuItem>
          ))
        )}
        {A.isNonEmptyArray(devices) && (
          <>
            <DropdownMenuSeparator />
            <div className="flex items-center gap-2 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMute();
                }}
                className="h-8 gap-2"
              >
                {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                <span className="text-sm">{isMuted ? "Unmute" : "Mute"}</span>
              </Button>
              <div className="bg-accent ml-auto w-16 overflow-hidden rounded-md p-1.5">
                <LiveWaveform
                  active={isPreviewActive}
                  deviceId={selectedDevice || defaultDeviceId}
                  mode="static"
                  height={15}
                  barWidth={3}
                  barGap={1}
                />
              </div>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useAudioDevices() {
  const runtime = useRuntime();
  const runPromise = makeRunClientPromise(runtime);
  const [devices, setDevices] = useState<AudioDevice[]>(A.empty());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const loadDevicesWithoutPermissionEffect = F.pipe(
    Effect.sync(() => {
      setLoading(true);
      setError(null);
    }),
    Effect.andThen(
      Effect.tryPromise({
        catch: MediaDeviceEnumerationError.new,
        try: () => navigator.mediaDevices.enumerateDevices(),
      })
    ),
    Effect.map(
      A.filterMap((device) => {
        if (device.kind !== "audioinput") {
          return O.none();
        }
        const fallbackLabel = `Microphone ${Str.takeLeft(device.deviceId, 8)}`;
        const baseLabel = device.label || fallbackLabel;
        const cleanLabel = F.pipe(baseLabel, Str.replace(/\s*\([^)]*\)/g, Str.empty), Str.trim);

        return O.some({
          deviceId: device.deviceId,
          label: cleanLabel,
          groupId: device.groupId,
        });
      })
    ),
    Effect.tap((audioInputs) => Effect.sync(() => setDevices(audioInputs))),
    Effect.tapError((e) => Effect.sync(() => setError(e.message)).pipe(Effect.tap(() => Effect.logWarning(e.message)))),
    Effect.ensuring(Effect.sync(() => setLoading(false)))
  );

  const loadDevicesWithPermissionEffect = Effect.gen(function* () {
    const permissions = yield* Permissions.Permissions;

    yield* Effect.sync(() => {
      setLoading(true);
      setError(null);
    });

    const permissionStatus = yield* permissions.query("microphone");

    // Only request getUserMedia if permission not already granted
    if (permissionStatus.state !== "granted") {
      const tempStream = yield* Effect.tryPromise({
        catch: MediaDevicePermissionError.new,
        try: () => navigator.mediaDevices.getUserMedia({ audio: true }),
      });
      A.forEach(tempStream.getTracks(), (track) => track.stop());
    }

    const deviceList = yield* Effect.tryPromise({
      catch: MediaDeviceEnumerationError.new,
      try: () => navigator.mediaDevices.enumerateDevices(),
    });

    const audioInputs = A.filterMap(deviceList, (device) => {
      if (device.kind !== "audioinput") {
        return O.none();
      }
      const fallbackLabel = `Microphone ${Str.takeLeft(device.deviceId, 8)}`;
      const baseLabel = device.label || fallbackLabel;
      const cleanLabel = F.pipe(baseLabel, Str.replace(/\s*\([^)]*\)/g, Str.empty), Str.trim);

      return O.some({
        deviceId: device.deviceId,
        label: cleanLabel,
        groupId: device.groupId,
      });
    });

    yield* Effect.sync(() => {
      setDevices(audioInputs);
      setHasPermission(true);
    });

    return audioInputs;
  }).pipe(
    Effect.tapError((e) => Effect.sync(() => setError(e.message)).pipe(Effect.tap(() => Effect.logWarning(e.message)))),
    Effect.ensuring(Effect.sync(() => setLoading(false)))
  );

  const loadDevicesWithoutPermission = useCallback(
    async () => runPromise(loadDevicesWithoutPermissionEffect),
    [runPromise]
  );

  const loadDevicesWithPermission = useCallback(async () => {
    if (loading) return;
    await runPromise(loadDevicesWithPermissionEffect);
  }, [loading, runPromise]);

  useEffect(() => {
    void loadDevicesWithoutPermission();
  }, [loadDevicesWithoutPermission]);

  useEffect(() => {
    const handleDeviceChange = () => {
      if (hasPermission) {
        void loadDevicesWithPermission();
      } else {
        void loadDevicesWithoutPermission();
      }
    };

    navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
    };
  }, [hasPermission, loadDevicesWithPermission, loadDevicesWithoutPermission]);

  return {
    devices,
    loading,
    error,
    hasPermission,
    loadDevices: loadDevicesWithPermission,
  };
}
