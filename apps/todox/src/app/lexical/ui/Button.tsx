"use client";

import { Button as ShadcnButton } from "@beep/todox/components/ui/button";
import { cn } from "@beep/todox/lib/utils";
import type { JSX, ReactNode } from "react";

export default function Button({
  "data-test-id": dataTestId,
  children,
  className,
  onClick,
  disabled,
  small,
  title,
}: {
  readonly "data-test-id"?: undefined | string;
  readonly children: ReactNode;
  readonly className?: undefined | string;
  readonly disabled?: undefined | boolean;
  readonly onClick: () => void;
  readonly small?: undefined | boolean;
  readonly title?: undefined | string;
}): JSX.Element {
  return (
    <ShadcnButton
      variant="outline"
      size={small ? "sm" : "default"}
      disabled={disabled}
      className={cn(className)}
      onClick={onClick}
      title={title}
      aria-label={title}
      {...(dataTestId && { "data-test-id": dataTestId })}
    >
      {children}
    </ShadcnButton>
  );
}
