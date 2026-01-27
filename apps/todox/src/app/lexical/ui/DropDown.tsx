"use client";

import { Button } from "@beep/todox/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@beep/todox/components/ui/dropdown-menu";
import { cn } from "@beep/todox/lib/utils";
import { CaretDownIcon } from "@phosphor-icons/react";
import type { JSX, ReactNode } from "react";
import * as React from "react";

type DropDownContextType = {
  readonly registerItem: (ref: React.RefObject<null | HTMLButtonElement>) => void;
};

const DropDownContext = React.createContext<DropDownContextType | null>(null);

export function DropDownItem({
  children,
  className,
  onClick,
  title,
}: {
  readonly children: React.ReactNode;
  readonly className: string;
  readonly onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  readonly title?: undefined | string;
}) {
  const ref = React.useRef<null | HTMLButtonElement>(null);

  const dropDownContext = React.useContext(DropDownContext);

  React.useEffect(() => {
    if (dropDownContext && ref?.current) {
      dropDownContext.registerItem(ref);
    }
  }, [ref, dropDownContext]);

  return (
    <DropdownMenuItem
      className={cn("cursor-pointer", className)}
      onClick={(e) => onClick(e as unknown as React.MouseEvent<HTMLButtonElement>)}
      title={title}
    >
      {children}
    </DropdownMenuItem>
  );
}

export default function DropDown({
  disabled = false,
  buttonLabel,
  buttonAriaLabel,
  buttonClassName,
  buttonIconClassName,
  children,
  stopCloseOnClickSelf,
  hideChevron,
  contentClassName,
}: {
  readonly disabled?: undefined | boolean;
  readonly buttonAriaLabel?: undefined | string;
  readonly buttonClassName: string;
  readonly buttonIconClassName?: undefined | string;
  readonly buttonLabel?: undefined | string;
  readonly children: ReactNode;
  readonly stopCloseOnClickSelf?: undefined | boolean;
  readonly hideChevron?: undefined | boolean;
  readonly contentClassName?: undefined | string;
}): JSX.Element {
  const registerItem = React.useCallback((_itemRef: React.RefObject<null | HTMLButtonElement>) => {
    // No-op: item registration handled by shadcn DropdownMenu
  }, []);

  const contextValue = React.useMemo(
    () => ({
      registerItem,
    }),
    [registerItem]
  );

  return (
    <DropDownContext.Provider value={contextValue}>
      <DropdownMenu modal={!stopCloseOnClickSelf}>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              aria-label={buttonAriaLabel || buttonLabel}
              className={cn("gap-1", buttonClassName)}
            />
          }
        >
          {buttonIconClassName && <span className={buttonIconClassName} />}
          {buttonLabel && <span className="text dropdown-button-text">{buttonLabel}</span>}
          {!hideChevron && <CaretDownIcon className="size-3 opacity-50" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          sideOffset={4}
          className={cn("min-w-40 !bg-white !text-black", contentClassName)}
        >
          {children}
        </DropdownMenuContent>
      </DropdownMenu>
    </DropDownContext.Provider>
  );
}
