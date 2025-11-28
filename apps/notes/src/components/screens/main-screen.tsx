import { cn } from "@beep/notes/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const layoutVariants = cva("relative mx-auto mt-20 w-full", {
  defaultVariants: {
    noPadding: false,
    size: "md",
  },
  variants: {
    noPadding: {
      false: "pt-4",
      true: "",
    },
    size: {
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      false: "",
      full: "",
      lg: "max-w-lg",
      md: "max-w-md",
      sm: "max-w-sm",
      xl: "max-w-xl",
    },
  },
});

export type MainScreenProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof layoutVariants>;

export function MainScreen({ children, className, noPadding, size, ...props }: MainScreenProps) {
  return (
    <div className="px-[4%] md:px-[60px]">
      <div className={cn(layoutVariants({ noPadding, size }), className)} {...props}>
        {children}
      </div>
    </div>
  );
}
