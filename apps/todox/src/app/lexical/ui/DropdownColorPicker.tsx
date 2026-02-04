"use client";

import { Button } from "@beep/ui/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/ui/components/popover";
import { cn } from "@beep/todox/lib/utils";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";

import ColorPicker from "./ColorPicker";

type Props = {
  readonly disabled?: undefined | boolean;
  readonly buttonAriaLabel?: undefined | string;
  readonly buttonClassName?: undefined | string;
  readonly icon?: undefined | ReactNode;
  readonly buttonLabel?: undefined | string;
  readonly title?: undefined | string;
  readonly color: string;
  readonly onChange?: undefined | ((color: string, skipHistoryStack: boolean, skipRefocus: boolean) => void);
};

export default function DropdownColorPicker({
  disabled = false,
  color,
  onChange,
  buttonAriaLabel,
  buttonClassName,
  icon,
  buttonLabel,
}: Props) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-label={buttonAriaLabel || buttonLabel}
            className={cn("gap-0.5 px-1.5", buttonClassName)}
          >
            <div className="relative flex items-center justify-center">
              {icon}
              {/* Color indicator bar below the icon */}
              <div className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-sm" style={{ backgroundColor: color }} />
            </div>
            <CaretDownIcon className="size-3 opacity-50" />
          </Button>
        }
      />
      <PopoverContent align="start" sideOffset={4} className="w-auto p-3">
        <ColorPicker color={color} onChange={onChange} />
      </PopoverContent>
    </Popover>
  );
}
