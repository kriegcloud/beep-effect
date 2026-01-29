"use client";

import { Label } from "@beep/todox/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@beep/todox/components/ui/select";
import { Slider } from "@beep/todox/components/ui/slider";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";

interface QueryConfigFormProps {
  readonly topK: number;
  readonly maxHops: number;
  readonly onTopKChange: (value: number) => void;
  readonly onMaxHopsChange: (value: number) => void;
  readonly disabled?:  undefined | boolean;
}

const MAX_HOPS_OPTIONS = [
  { value: "0", label: "0 (seeds only)" },
  { value: "1", label: "1 (default)" },
  { value: "2", label: "2" },
  { value: "3", label: "3 (max)" },
] as const;

export function QueryConfigForm({
  topK,
  maxHops,
  onTopKChange,
  onMaxHopsChange,
  disabled = false,
}: QueryConfigFormProps) {
  return (
    <div className="flex items-end gap-6" data-disabled={disabled}>
      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">Top K: {topK}</Label>
        <Slider
          value={[topK]}
          onValueChange={(values) => {
            const arrayValues = Array.isArray(values) ? values : [values];
            pipe(A.head(arrayValues), O.map(onTopKChange));
          }}
          min={1}
          max={50}
          step={1}
          disabled={disabled}
          className="w-[200px]"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-sm text-muted-foreground">Hops: {maxHops}</Label>
        <Select
          value={String(maxHops)}
          onValueChange={(value) =>
            pipe(
              O.fromNullable(value),
              O.map((v) => onMaxHopsChange(Number.parseInt(v, 10)))
            )
          }
          disabled={disabled}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MAX_HOPS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export type { QueryConfigFormProps };
