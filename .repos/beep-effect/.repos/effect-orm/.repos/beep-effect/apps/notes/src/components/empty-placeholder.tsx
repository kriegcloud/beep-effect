import { cn } from "@beep/notes/lib/utils";
import type * as React from "react";

import type { IconFC } from "./ui/icon";

interface EmptyPlaceholderIconProps extends Partial<React.SVGProps<SVGSVGElement>> {
  Icon: IconFC;
}

export function EmptyPlaceholder({ children, className, ...props }: EmptyPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex animate-in flex-col items-center justify-center rounded-md border border-dashed px-8 py-16 text-center fade-in-50",
        className
      )}
      {...props}
    >
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

type EmptyPlaceholderProps = React.HTMLAttributes<HTMLDivElement>;

EmptyPlaceholder.Icon = function EmptyPlaceHolderIcon({ className, Icon, ref, ...props }: EmptyPlaceholderIconProps) {
  return (
    <div className="flex size-20 items-center justify-center rounded-full bg-muted">
      <Icon className={cn("size-10", className)} {...props} />
    </div>
  );
};

type EmptyPlacholderTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

EmptyPlaceholder.Title = function EmptyPlaceholderTitle({ className, ...props }: EmptyPlacholderTitleProps) {
  return <h2 className={cn("text-xl font-semibold", className)} {...props} />;
};

type EmptyPlacholderDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

EmptyPlaceholder.Description = function EmptyPlaceholderDescription({
  className,
  ...props
}: EmptyPlacholderDescriptionProps) {
  return (
    <p className={cn("mt-2 mb-8 text-center leading-6 font-normal text-muted-foreground", className)} {...props} />
  );
};
