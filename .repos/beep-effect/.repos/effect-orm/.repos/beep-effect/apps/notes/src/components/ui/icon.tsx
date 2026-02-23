import { cn } from "@beep/notes/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { LucideProps } from "lucide-react";
import type React from "react";

export const iconVariants = cva("", {
  defaultVariants: {
    size: "sm",
    variant: "default",
  },
  variants: {
    size: {
      10: "size-10",
      lg: "size-6",
      md: "size-5",
      sm: "size-4",
      xl: "size-8",
      xs: "size-3",
    },
    spin: {
      true: "inline-block animate-spin",
    },
    variant: {
      default: "text-subtle-foreground",
      menuItem: "mr-2 size-5",
      muted: "text-muted-foreground/70",
      placeholder: "text-muted-foreground/50",
      primary: "",
      toolbar: "size-5",
    },
  },
});

export type IconProps = {
  /**
   * All icons must be associated with an label, either next to the icon (using
   * sr-only) or on an interactive parent element (using aria-label). The latter
   * case is preferred (e.g. inside a button). If the icon does not add any new
   * information, it can be safely hidden.
   */
  label?: undefined | string;
} & LucideProps &
  VariantProps<typeof iconVariants>;

export type IconFC = React.FC<IconProps>;

export const createIcon = (
  Icon: React.FC<LucideProps>,
  { spin: defaultSpin, ...defaultProps }: Partial<IconProps> = {}
) => {
  return function IconComponent({ className, label, size, spin = defaultSpin, variant, ...props }: IconProps) {
    return (
      <>
        {!!label && <span className="sr-only">{label}</span>}

        <Icon
          className={cn(iconVariants({ size, spin, variant }), defaultProps?.className, className)}
          aria-hidden
          {...defaultProps}
          {...props}
        />
      </>
    );
  };
};
