"use client";

import { Button } from "@beep/todox/components/ui/button";
import { Label } from "@beep/todox/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/todox/components/ui/select";
import type { LexicalEditor } from "lexical";
import type { JSX } from "react";
import { useId, useState } from "react";

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
  const layoutId = useId();

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_LAYOUT_COMMAND, layout);
    onClose();
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor={layoutId}>Column layout</Label>
        <Select value={layout} onValueChange={(value) => value != null && setLayout(value)}>
          <SelectTrigger id={layoutId}>
            <SelectValue placeholder="Select a layout" />
          </SelectTrigger>
          <SelectContent>
            {LAYOUTS.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end pt-2">
        <Button variant="outline" onClick={onClick}>
          Confirm
        </Button>
      </div>
    </div>
  );
}
