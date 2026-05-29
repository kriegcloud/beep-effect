"use client";

import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import { cn } from "../lib/index.ts";

/**
 * Scroll area component.
 *
 * @example
 * ```tsx
 * import { ScrollArea } from "@beep/ui/components/scroll-area"
 *
 * console.log(ScrollArea)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function ScrollArea({ className, children, ...props }: ScrollAreaPrimitive.Root.Props) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * Scroll bar component.
 *
 * @example
 * ```tsx
 * import { ScrollBar } from "@beep/ui/components/scroll-area"
 *
 * console.log(ScrollBar)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function ScrollBar({ className, orientation = "vertical", ...props }: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent flex touch-none p-px transition-colors select-none",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb data-slot="scroll-area-thumb" className="rounded-full bg-border relative flex-1" />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { ScrollArea, ScrollBar };
