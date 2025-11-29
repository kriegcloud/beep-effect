"use client";

import { cn } from "@beep/notes/lib/utils";

import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Separator } from "./separator";
import { withTooltip } from "./tooltip";

const toolbarVariants = cva("relative flex items-center select-none", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "gap-1 bg-background",
      media: "absolute z-2 h-[26px] max-w-[calc(100%-16px)] overflow-hidden rounded-sm bg-black/60 transition-opacity",
    },
  },
});

export function Toolbar({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.Root> & VariantProps<typeof toolbarVariants>) {
  return <ToolbarPrimitive.Root className={cn(toolbarVariants({ variant }), className)} {...props} />;
}

export function ToolbarToggleGroup({
  className,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToolbarToggleGroup>) {
  return <ToolbarPrimitive.ToolbarToggleGroup className={cn("flex items-center", className)} {...props} />;
}

export function ToolbarLink({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return <ToolbarPrimitive.Link className={cn("font-medium underline underline-offset-4", className)} {...props} />;
}

export function ToolbarSeparator({ className, ...props }: React.ComponentProps<typeof ToolbarPrimitive.Separator>) {
  return <ToolbarPrimitive.Separator className={cn("mx-2 my-1 w-px shrink-0 bg-border", className)} {...props} />;
}

export const toolbarButtonVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-md text-sm font-medium whitespace-nowrap text-foreground/80 ring-offset-background transition-bg-ease focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&_svg:not([data-icon])]:size-4",
  {
    defaultVariants: {
      size: "sm",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-10 px-3",
        lg: "h-11 px-5",
        none: "",
        sm: "h-[28px] px-1.5",
      },
      variant: {
        default: "bg-transparent hover:bg-black/5 aria-checked:bg-accent aria-checked:text-accent-foreground",
        media:
          "m-0 h-auto rounded-none bg-black/20 px-1.5 py-1 text-white no-focus-ring not-last:border-r not-last:border-r-white/20 hover:bg-white/5 focus:bg-white/5 [&_svg]:size-[14px] [&_svg]:text-white",
        outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
      },
    },
  }
);

export const ToolbarButton = withTooltip(function ToolbarButton({
  children,
  className,
  isDropdown,
  pressed,
  size,
  variant,
  ...props
}: Omit<React.ComponentProps<typeof ToolbarToggleItem>, "asChild" | "value"> & {
  isDropdown?: undefined | boolean;
  pressed?: undefined | boolean;
} & VariantProps<typeof toolbarButtonVariants>) {
  return typeof pressed === "boolean" ? (
    <ToolbarToggleGroup
      {...(props.disabled !== undefined ? { disabled: props.disabled } : {})}
      value="single"
      type="single"
    >
      <ToolbarToggleItem
        className={cn(
          toolbarButtonVariants({
            size,
            variant,
          }),
          isDropdown && "justify-between gap-0.5 pr-1",
          className
        )}
        value={pressed ? "single" : ""}
        {...props}
      >
        {isDropdown ? (
          <>
            <div className="flex flex-1 items-center gap-1 whitespace-nowrap">{children}</div>
            <div>
              <ChevronDownIcon className="size-3.5 text-muted-foreground/70" data-icon />
            </div>
          </>
        ) : (
          children
        )}
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
  ) : (
    <ToolbarPrimitive.Button
      className={cn(
        toolbarButtonVariants({
          size,
          variant,
        }),
        isDropdown && "pr-1",
        className
      )}
      {...props}
    >
      {children}
    </ToolbarPrimitive.Button>
  );
});

export function ToolbarToggleItem({
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<typeof ToolbarPrimitive.ToggleItem> & VariantProps<typeof toolbarButtonVariants>) {
  return <ToolbarPrimitive.ToggleItem className={cn(toolbarButtonVariants({ size, variant }), className)} {...props} />;
}

export function ToolbarGroup({ children, className }: React.ComponentProps<"div">) {
  const childArr = React.Children.map(children, (c) => c);

  if (!childArr || childArr.length === 0) return null;

  return (
    <div className={cn("group/toolbar-group relative flex shrink-0", className)}>
      <div className="flex items-center gap-0.5">{children}</div>

      <div className="mx-1.5 hidden py-0.5 group-last/toolbar-group:hidden! group-has-[button]/toolbar-group:block">
        <Separator orientation="vertical" />
      </div>
    </div>
  );
}
