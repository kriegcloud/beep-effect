"use client";

import { cn } from "@beep/todox/lib/utils";
import { Button } from "@beep/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/ui/components/dropdown-menu";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useState } from "react";

import { INSERT_LAYOUT_COMMAND } from "./LayoutPlugin";

const LAYOUTS = [
  { label: "2 columns (equal width)", value: "1fr 1fr" },
  { label: "2 columns (25% - 75%)", value: "1fr 3fr" },
  { label: "3 columns (equal width)", value: "1fr 1fr 1fr" },
  { label: "3 columns (25% - 50% - 25%)", value: "1fr 2fr 1fr" },
  { label: "4 columns (equal width)", value: "1fr 1fr 1fr 1fr" },
];

export default function InsertLayoutDialog({
  activeEditor,
  onClose,
}: {
  readonly activeEditor: LexicalEditor;
  readonly onClose: () => void;
}): JSX.Element {
  const [layout, setLayout] = useState(LAYOUTS[0]!.value);
  const buttonLabel = LAYOUTS.find((item) => item.value === layout)?.label ?? "Select Layout";

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={cn("gap-1", "toolbar-item dialog-dropdown")}>
            <span className="text dropdown-button-text">{buttonLabel}</span>
            <CaretDownIcon className="size-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" sideOffset={4} className="min-w-40 !bg-white !text-black">
          {LAYOUTS.map(({ label, value }) => (
            <DropdownMenuItem key={value} className={cn("cursor-pointer", "item")} onClick={() => setLayout(value)}>
              <span className="text">{label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" onClick={onClick}>
        Insert
      </Button>
    </>
  );
}
