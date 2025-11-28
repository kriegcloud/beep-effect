"use client";

import { KEYS } from "platejs";
import { useEditorRef, useSelectionFragmentProp } from "platejs/react";
import type * as React from "react";
import { useCallback, useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function FontColorToolbarButton(props: React.ComponentProps<typeof DropdownMenu>) {
  const editor = useEditorRef();

  const color = useSelectionFragmentProp({
    key: KEYS.color,
    defaultValue: "inherit",
    mode: "text",
  });
  const background = useSelectionFragmentProp({
    key: KEYS.backgroundColor,
    defaultValue: "transparent",
    mode: "text",
  });

  const [lastUsed, setLastUsed] = useState<Record<"key" | "label" | "value", string> | null>(null);

  const onColorChange = useCallback((color: string) => {
    editor.tf.addMarks({ [KEYS.color]: color });
    editor.tf.focus();

    const label = textColorItems.find((item) => item.value === color)!.label;

    localStorage.setItem("lastUsed", JSON.stringify({ key: KEYS.color, label, value: color }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBackgroundChange = useCallback((background: string) => {
    editor.tf.addMarks({ [KEYS.backgroundColor]: background });
    editor.tf.focus();

    const label = backgroundColorItems.find((item) => item.value === background)!.label;

    localStorage.setItem(
      "lastUsed",
      JSON.stringify({
        key: KEYS.backgroundColor,
        label,
        value: background,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) return;

    const local = localStorage.getItem("lastUsed");

    if (local) {
      return setLastUsed(JSON.parse(local));
    }

    setLastUsed(null);
  }, []);

  const onLastUsed = useCallback(() => {
    if (!lastUsed) return;
    if (lastUsed.key === KEYS.color) {
      onColorChange(lastUsed.value);
    } else {
      onBackgroundChange(lastUsed.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUsed]);

  return (
    <DropdownMenu modal={false} {...props} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={false} tooltip="Color" isDropdown>
          <div
            className="size-4 rounded-full"
            style={{
              background:
                background === "transparent" && color === "inherit"
                  ? "linear-gradient(120deg, #6EB6F2 20%, #a855f7, #ea580c, #eab308 80%)"
                  : color === "inherit"
                    ? background
                    : color,
            }}
          />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          className="ignore-click-outside/toolbar h-96 overflow-y-auto"
          data-plate-prevent-overlay
          align="start"
        >
          {/* TODO:shortcut */}
          {lastUsed && (
            <DropdownMenuGroup>
              <DropdownMenuLabel>Last used</DropdownMenuLabel>
              <DropdownMenuRadioGroup className="flex flex-col gap-0.5">
                <DropdownMenuRadioItem className="min-w-[200px] gap-1.5" value={lastUsed.value} onClick={onLastUsed}>
                  <ColorIcon
                    value={lastUsed.value}
                    group={lastUsed.key === KEYS.backgroundColor ? "background" : "color"}
                  />
                  {lastUsed.label}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          )}

          <DropdownMenuGroup>
            <DropdownMenuLabel>Text color</DropdownMenuLabel>
            <DropdownMenuRadioGroup className="flex flex-col" value={color} onValueChange={onColorChange}>
              {textColorItems.map(({ label, value: itemValue }) => (
                <DropdownMenuRadioItem key={itemValue} className="min-w-[200px] gap-1.5" value={itemValue}>
                  <ColorIcon value={itemValue} group="color" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          <DropdownMenuGroup>
            <DropdownMenuLabel>Background color</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              className="flex flex-col gap-0.5"
              value={background}
              onValueChange={onBackgroundChange}
            >
              {backgroundColorItems.map(({ label, value: itemValue }) => (
                <DropdownMenuRadioItem key={itemValue} className="min-w-[200px] gap-1.5" value={itemValue}>
                  <ColorIcon value={itemValue} group="background" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

export function ColorIcon({ group, value }: { group: string; value: string }) {
  return (
    <div
      className="flex size-5 items-center justify-center rounded-sm border text-sm"
      style={{
        background: group === "background" ? value : undefined,
        color: group === "color" ? value : undefined,
      }}
    >
      A
    </div>
  );
}

export const textColorItems: { label: string; value: string }[] = [
  { label: "Default", value: "inherit" },
  { label: "Gray", value: "rgb(123, 122, 116)" },
  { label: "Brown", value: "rgb(162, 110, 83)" },
  { label: "Orange", value: "rgb(215, 110, 30)" },
  { label: "Yellow", value: "rgb(205, 147, 47)" },
  { label: "Green", value: "rgb(39, 124, 112)" },
  { label: "Blue", value: "rgb(59, 109, 178)" },
  { label: "Purple", value: "rgb(122, 68, 178)" },
  { label: "Pink", value: "rgb(168, 62, 111)" },
  { label: "Red", value: "rgb(190, 55, 55)" },
];

export const backgroundColorItems: { label: string; value: string }[] = [
  { label: "Default background", value: "transparent" },
  { label: "Gray background", value: "rgb(241, 241, 239)" },
  { label: "Brown background", value: "rgb(235, 229, 220)" },
  { label: "Orange background", value: "rgb(254, 235, 200)" },
  { label: "Yellow background", value: "rgb(254, 249, 195)" },
  { label: "Green background", value: "rgb(204, 251, 241)" },
  { label: "Blue background", value: "rgb(219, 234, 254)" },
  { label: "Purple background", value: "rgb(243, 232, 255)" },
  { label: "Pink background", value: "rgb(252, 231, 243)" },
  { label: "Red background", value: "rgb(254, 226, 226)" },
];
