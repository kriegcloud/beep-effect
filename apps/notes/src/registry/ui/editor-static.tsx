import { cn } from "@beep/notes/lib/utils";

import type { VariantProps } from "class-variance-authority";

import { cva } from "class-variance-authority";
import { PlateStatic, type PlateStaticProps } from "platejs/static";

export const editorVariants = cva(
  cn(
    "group/editor",
    "relative w-full overflow-x-hidden break-words whitespace-pre-wrap",
    "rounded-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-hidden",
    "**:data-slate-placeholder:text-muted-foreground/80 **:data-slate-placeholder:opacity-100!",
    "**:data-slate-placeholder:top-[auto_!important]",
    "[&_strong]:font-bold"
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
      focused: {
        true: "ring-2 ring-ring ring-offset-2",
      },
      variant: {
        ai: "px-0 text-base md:text-sm",
        aiChat: "max-h-[min(70vh,320px)] max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm",
        comment: cn("rounded-none border-none bg-transparent text-sm"),
        default: "min-h-full px-16 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]",
        demo: "h-full px-16 pt-4 pb-72 text-base sm:px-[max(64px,calc(50%-350px))]",
        fullWidth: "min-h-full px-16 pb-72 text-base sm:px-24",
        mention: "rounded-none border-none bg-transparent text-sm",
        select: "px-3 py-2 text-base data-readonly:w-fit",
        update: "px-0 text-sm",
        versionHistory: "px-0 pb-[30vh] text-base",
      },
    },
  }
);

export function EditorStatic({
  children,
  className,
  variant,
  ...props
}: PlateStaticProps & VariantProps<typeof editorVariants>) {
  return <PlateStatic className={cn(editorVariants({ variant }), className)} {...props} />;
}
