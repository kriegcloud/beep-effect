"use client";

import { cn } from "@beep/notes/lib/utils";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cva, type VariantProps } from "class-variance-authority";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import * as React from "react";

export const dropdownMenuItemVariants = cva(
  cn(
    "relative flex cursor-pointer items-center gap-2 rounded-md align-middle text-sm no-focus-ring transition-bg-ease select-none data-disabled:pointer-events-none data-disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-subtle-foreground",
    "text-accent-foreground hover:bg-accent focus:bg-accent focus:text-accent-foreground"
  ),
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "mx-1 h-[28px] w-[calc(100%-8px)] px-2.5",
        none: "",
      },
      variant: {
        default: "focus:bg-accent focus:text-accent-foreground",
        none: "",
      },
    },
  }
);

const dropdownMenuLabelVariants = cva(
  cn("mt-1.5 mb-2 cursor-default px-[14px] text-xs font-medium text-muted-foreground select-none"),
  {
    variants: {
      inset: {
        true: "pl-8",
      },
    },
  }
);

export function DropdownMenu(props: DropdownMenuPrimitive.DropdownMenuProps) {
  return <DropdownMenuPrimitive.Root {...props} />;
}

export function DropdownMenuTrigger(props: DropdownMenuPrimitive.DropdownMenuTriggerProps) {
  return <DropdownMenuPrimitive.Trigger {...props} />;
}

export function DropdownMenuGroup(props: DropdownMenuPrimitive.DropdownMenuGroupProps) {
  return <DropdownMenuPrimitive.Group className="py-1.5" {...props} />;
}

export function DropdownMenuPortal(props: DropdownMenuPrimitive.DropdownMenuPortalProps) {
  return <DropdownMenuPrimitive.Portal {...props} />;
}

export function DropdownMenuSub(props: DropdownMenuPrimitive.DropdownMenuSubProps) {
  return <DropdownMenuPrimitive.Sub {...props} />;
}

export function DropdownMenuRadioGroup(props: DropdownMenuPrimitive.DropdownMenuRadioGroupProps) {
  return <DropdownMenuPrimitive.RadioGroup {...props} />;
}

export function DropdownMenuSubTrigger({
  children,
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & {
  inset?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      className={cn(
        "mx-1 flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent data-[state=open]:bg-accent",
        "no-focus-ring",
        "data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        inset && "pl-8",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

export function DropdownMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "z-50 min-w-32 overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-floating data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
      {...props}
    />
  );
}

export function DropdownMenuContent({
  className,
  portal,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  portal?: boolean;
}) {
  const content = (
    <DropdownMenuPrimitive.Content
      className={cn(
        "z-50 max-w-[100vw] min-w-32 overflow-hidden rounded-lg bg-popover p-0 text-sm text-popover-foreground shadow-floating no-focus-ring",
        "data-[side=bottom]:origin-top data-[side=left]:origin-right data-[side=right]:origin-left data-[side=top]:origin-bottom data-[state=closed]:hidden data-[state=open]:animate-zoom",
        className
      )}
      sideOffset={4}
      {...props}
    />
  );

  if (portal) {
    return <DropdownMenuPrimitive.Portal>{content}</DropdownMenuPrimitive.Portal>;
  }

  return content;
}

export function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Item> & VariantProps<typeof dropdownMenuItemVariants>) {
  return <DropdownMenuPrimitive.Item className={cn(dropdownMenuItemVariants(), className)} {...props} />;
}

export function DropdownMenuCheckboxItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      className={cn(
        "relative flex items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 no-focus-ring transition-bg-ease select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:size-4",
        "mx-1 h-[28px] cursor-pointer px-2.5 data-[state=highlighted]:bg-accent data-[state=highlighted]:text-accent-foreground",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

export function DropdownMenuRadioItem({
  children,
  className,
  hideIcon,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem> & {
  hideIcon?: boolean;
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      className={cn(
        "relative flex items-center rounded-sm pr-2 pl-8 no-focus-ring transition-bg-ease select-none focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        "mx-1 h-[28px] cursor-pointer gap-2 px-2.5 data-[state=highlighted]:bg-accent data-[state=highlighted]:text-accent-foreground [&_svg]:size-4",
        className
      )}
      {...props}
    >
      {!hideIcon && (
        <span className="absolute right-2 flex size-3.5 items-center justify-center">
          <DropdownMenuPrimitive.ItemIndicator>
            <CheckIcon />
          </DropdownMenuPrimitive.ItemIndicator>
        </span>
      )}
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

export function DropdownMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & {
  inset?: boolean;
}) {
  return <DropdownMenuPrimitive.Label className={cn(dropdownMenuLabelVariants({ inset }), className)} {...props} />;
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />;
}

export function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props} />;
}

export function useOpenState() {
  const [open, setOpen] = React.useState(false);

  const onOpenChange = React.useCallback(
    (_value = !open) => {
      setOpen(_value);
    },
    [open]
  );

  return {
    open,
    onOpenChange,
  };
}
