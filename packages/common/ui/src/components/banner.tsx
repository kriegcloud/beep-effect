import { CheckCircleIcon, InfoIcon, SpinnerGapIcon, WarningCircleIcon, XIcon } from "@phosphor-icons/react";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "../lib/index.ts";

const bannerVariants = cva("relative flex items-center gap-3 rounded-lg border px-4 py-3 text-sm", {
  variants: {
    variant: {
      default: "border-border bg-muted text-foreground",
      info: "border-primary/30 bg-primary/10 text-foreground [&>svg]:text-primary",
      success: "border-success/30 bg-success/10 text-success-text [&>svg]:text-success-text",
      warning: "border-warning/30 bg-warning/10 text-warning-text [&>svg]:text-warning-text",
      destructive: "border-destructive/30 bg-destructive/10 text-destructive-text [&>svg]:text-destructive-text",
      loading: "border-border bg-muted text-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type BannerVariant = NonNullable<VariantProps<typeof bannerVariants>["variant"]>;

const variantIcons: Record<BannerVariant, React.ReactNode> = {
  default: <InfoIcon className="size-4 shrink-0" />,
  info: <InfoIcon className="size-4 shrink-0" />,
  success: <CheckCircleIcon className="size-4 shrink-0" />,
  warning: <WarningCircleIcon className="size-4 shrink-0" />,
  destructive: <WarningCircleIcon className="size-4 shrink-0" />,
  loading: <SpinnerGapIcon className="size-4 shrink-0 animate-spin" />,
};

type BannerRootProps = React.ComponentProps<"div"> &
  VariantProps<typeof bannerVariants> & {
    icon?: React.ReactNode;
  };

function Banner({ className, variant = "default", icon, children, ...props }: BannerRootProps) {
  const defaultIcon = variant ? variantIcons[variant] : variantIcons.default;

  return (
    <div data-slot="banner" role="alert" className={cn(bannerVariants({ variant }), className)} {...props}>
      {icon ?? defaultIcon}
      {children}
    </div>
  );
}

const BannerContent = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div data-slot="banner-content" className={cn("flex-1", className)} {...props} />
);

const BannerTitle = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p data-slot="banner-title" className={cn("font-medium leading-none", className)} {...props} />
);

const BannerDescription = ({ className, ...props }: React.ComponentProps<"p">) => (
  <p data-slot="banner-description" className={cn("text-sm opacity-90", className)} {...props} />
);

type BannerDismissProps = React.ComponentProps<"button"> & {
  onDismiss?: undefined | (() => void);
};

const BannerDismiss = ({ className, onDismiss, onClick, ...props }: BannerDismissProps) => (
  <button
    type="button"
    data-slot="banner-dismiss"
    className={cn(
      "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md opacity-70 transition-all hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-95",
      className
    )}
    onClick={(e) => {
      onDismiss?.();
      onClick?.(e);
    }}
    {...props}
  >
    <XIcon className="size-4" />
    <span className="sr-only">Dismiss</span>
  </button>
);

Banner.Content = BannerContent;
Banner.Title = BannerTitle;
Banner.Description = BannerDescription;
Banner.Dismiss = BannerDismiss;

export { bannerVariants };
