"use client";

import { cn } from "@beep/todox/lib/utils";
import { Button } from "@beep/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@beep/ui/components/dropdown-menu";
import { CaretDownIcon } from "@phosphor-icons/react";

import ColorPicker from "./ColorPicker";

type Props = {
  readonly disabled?: undefined | boolean;
  readonly buttonAriaLabel?: undefined | string;
  readonly buttonClassName: string;
  readonly buttonIconClassName?: undefined | string;
  readonly buttonLabel?: undefined | string;
  readonly title?: undefined | string;
  readonly stopCloseOnClickSelf?: undefined | boolean;
  readonly color: string;
  readonly onChange?: undefined | ((color: string, skipHistoryStack: boolean, skipRefocus: boolean) => void);
};

export default function DropdownColorPicker({
  disabled = false,
  stopCloseOnClickSelf = true,
  color,
  onChange,
  buttonAriaLabel,
  buttonClassName,
  buttonIconClassName,
  buttonLabel,
}: Props) {
  return (
    <DropdownMenu modal={!stopCloseOnClickSelf}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          aria-label={buttonAriaLabel || buttonLabel}
          className={cn("gap-1", buttonClassName)}
        >
          {buttonIconClassName && <span className={buttonIconClassName} />}
          {buttonLabel && <span className="text dropdown-button-text">{buttonLabel}</span>}
          <CaretDownIcon className="size-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="max-h-none overflow-visible">
        <ColorPicker color={color} onChange={onChange} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
