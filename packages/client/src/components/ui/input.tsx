import { cn } from "@/lib/cn";
import { cva } from "class-variance-authority";
import * as React from "react";

const inputVariants = cva(
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
);

const Input: React.FC<React.ComponentProps<"input">> & {
  variants: typeof inputVariants;
} = ({ className, type, ...props }) => {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ className }), className)}
      {...props}
    />
  );
};
Input.variants = inputVariants;

export { Input };
