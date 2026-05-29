import { cn } from "../lib/index.ts";

/**
 * Aspect ratio component.
 *
 * @example
 * ```tsx
 * import { AspectRatio } from "@beep/ui/components/aspect-ratio"
 *
 * console.log(AspectRatio)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
function AspectRatio({ ratio, className, ...props }: React.ComponentProps<"div"> & { readonly ratio: number }) {
  return (
    <div
      data-slot="aspect-ratio"
      style={
        {
          "--ratio": ratio,
        } as React.CSSProperties
      }
      className={cn("relative aspect-(--ratio)", className)}
      {...props}
    />
  );
}

/**
 * @category components
 * @since 0.0.0
 */
export { AspectRatio };
