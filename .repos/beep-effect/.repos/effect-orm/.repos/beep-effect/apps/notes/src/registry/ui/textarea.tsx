import { cn } from "@beep/notes/lib/utils";

import { TextareaAutosize as ReactTextareaAutosize } from "@platejs/caption/react";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

export const textareaVariants = cva(
  cn("resize-none text-sm disabled:cursor-not-allowed disabled:opacity-50", "placeholder:text-muted-foreground/80"),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        ai: "max-h-[240px] border-transparent bg-transparent py-2 focus:outline-none focus:ring-0",
        default:
          "rounded-md border-[1.5px] border-input bg-muted/80 px-1 pt-1 pb-0.5 read-only:ring-0 focus:border-brand/50 focus:ring-2 focus:ring-brand/30 read-only:focus:border-input",
        equation: "max-h-[50vh] min-h-[60px] font-mono text-sm",
        equationInline: "max-h-[50vh] font-mono text-sm",
      },
    },
  }
);

export type TextareaAutosizeProps = React.ComponentProps<typeof ReactTextareaAutosize> &
  VariantProps<typeof textareaVariants>;

export function Textarea({ className, variant, ...props }: TextareaProps) {
  return <textarea className={cn(textareaVariants({ variant }), className)} {...props} />;
}

export type TextareaProps = React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>;

export function TextareaAutosize({ children, className, variant, ...props }: TextareaAutosizeProps) {
  return (
    <ReactTextareaAutosize className={cn(textareaVariants({ variant }), className)} autoComplete="off" {...props} />
  );
}
