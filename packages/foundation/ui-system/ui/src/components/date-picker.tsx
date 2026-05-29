"use client";

import { Button } from "@beep/ui/components/button";
import { Calendar } from "@beep/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/ui/components/popover";
import { cn } from "@beep/ui/lib/utils";
import { CalendarBlankIcon } from "@phosphor-icons/react";
import * as React from "react";

const DATE_FORMAT = {
  year: "numeric",
  month: "long",
  day: "numeric",
} as const satisfies Intl.DateTimeFormatOptions;

interface DatePickerProps {
  readonly className?: string | undefined;
  readonly defaultValue?: Date | undefined;
  readonly disabled?: boolean | undefined;
  readonly onValueChange?: ((date: Date | undefined) => void) | undefined;
  readonly placeholder?: string | undefined;
  readonly value?: Date | undefined;
}

/**
 * A single-date picker composed from {@link Popover} and {@link Calendar}. Supports
 * both controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) usage.
 *
 * @category components
 * @since 0.0.0
 */
function DatePicker(props: DatePickerProps) {
  const { value, defaultValue, onValueChange, placeholder = "Pick a date", disabled = false, className } = props;
  const [internalValue, setInternalValue] = React.useState<Date | undefined>(defaultValue);
  const [open, setOpen] = React.useState(false);
  // Detect controlledness by prop presence so a parent that starts controlled
  // with `value={undefined}` (and any later reset to `undefined`) is honored.
  const isControlled = Object.hasOwn(props, "value");
  const selected = isControlled ? value : internalValue;

  const handleSelect = (date: Date | undefined) => {
    if (!isControlled) {
      setInternalValue(date);
    }
    onValueChange?.(date);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={selected === undefined}
            className={cn(
              "w-56 justify-start text-left font-normal data-[empty=true]:text-muted-foreground",
              className
            )}
          >
            <CalendarBlankIcon />
            {selected === undefined ? <span>{placeholder}</span> : selected.toLocaleDateString(undefined, DATE_FORMAT)}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selected} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { DatePicker };
