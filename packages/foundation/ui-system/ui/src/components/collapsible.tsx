"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { cn } from "../lib/index.ts";

/**
 * Collapsible component.
 *
 * @example
 * ```tsx
 * import { Collapsible } from "@beep/ui/components/collapsible"
 *
 * console.log(Collapsible)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function Collapsible({ className, ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" className={cn(className)} {...props} />;
}

/**
 * Collapsible trigger component.
 *
 * @example
 * ```tsx
 * import { CollapsibleTrigger } from "@beep/ui/components/collapsible"
 *
 * console.log(CollapsibleTrigger)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CollapsibleTrigger({ className, ...props }: CollapsiblePrimitive.Trigger.Props) {
  return <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" className={cn(className)} {...props} />;
}

/**
 * Collapsible content component.
 *
 * @example
 * ```tsx
 * import { CollapsibleContent } from "@beep/ui/components/collapsible"
 *
 * console.log(CollapsibleContent)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function CollapsibleContent({ className, ...props }: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn("overflow-hidden transition-all data-[ending-style]:h-0 data-[starting-style]:h-0", className)}
      {...props}
    />
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { Collapsible, CollapsibleContent, CollapsibleTrigger };
