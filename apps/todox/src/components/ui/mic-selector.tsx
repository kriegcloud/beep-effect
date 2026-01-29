"use client";

import { cn } from "@beep/todox/lib/utils";
import { thunk } from "@beep/utils";
import { CaretUpDownIcon, CheckIcon, MicrophoneIcon, MicrophoneSlashIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
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
        {isMuted ? (
          <MicrophoneSlashIcon className="h-4 w-4 flex-shrink-0" />
        ) : (
          <MicrophoneIcon className="h-4 w-4 flex-shrink-0" />
        )}
        <span className="flex-1 truncate text-left">{currentDevice.label}</span>
        <CaretUpDownIcon className="h-3 w-3 flex-shrink-0" />
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
              {selectedDevice === device.deviceId && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
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
                {isMuted ? <MicrophoneSlashIcon className="h-4 w-4" /> : <MicrophoneIcon className="h-4 w-4" />}
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
  const [devices, setDevices] = useState<AudioDevice[]>(A.empty());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState(false);

  const loadDevicesWithoutPermission = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = A.filterMap(deviceList, (device) => {
        if (device.kind !== "audioinput") {
          return O.none();
        }
        const fallbackLabel = `Microphone ${device.deviceId.slice(0, 8)}`;
        const baseLabel = device.label || fallbackLabel;
        const cleanLabel = baseLabel.replace(/\s*\([^)]*\)/g, Str.empty).trim();

        return O.some({
          deviceId: device.deviceId,
          label: cleanLabel,
          groupId: device.groupId,
        });
      });

      setDevices(audioInputs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get audio devices");
      console.error("Error getting audio devices:", err);
    } finally {
      setLoading(false);
    }
  }, A.empty());

  const loadDevicesWithPermission = useCallback(async () => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      A.forEach(tempStream.getTracks(), (track) => track.stop());

      const deviceList = await navigator.mediaDevices.enumerateDevices();

      const audioInputs = A.filterMap(deviceList, (device) => {
        if (device.kind !== "audioinput") {
          return O.none();
        }
        const fallbackLabel = `Microphone ${device.deviceId.slice(0, 8)}`;
        const baseLabel = device.label || fallbackLabel;
        const cleanLabel = baseLabel.replace(/\s*\([^)]*\)/g, Str.empty).trim();

        return O.some({
          deviceId: device.deviceId,
          label: cleanLabel,
          groupId: device.groupId,
        });
      });

      setDevices(audioInputs);
      setHasPermission(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get audio devices");
      console.error("Error getting audio devices:", err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    loadDevicesWithoutPermission();
  }, [loadDevicesWithoutPermission]);

  useEffect(() => {
    const handleDeviceChange = () => {
      if (hasPermission) {
        loadDevicesWithPermission();
      } else {
        loadDevicesWithoutPermission();
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
