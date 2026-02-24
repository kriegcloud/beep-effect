"use client";

import { Button } from "@beep/ui/components/button";
import { Separator } from "@beep/ui/components/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@beep/ui/components/tooltip";
import { cn } from "@beep/ui-core/utils";
import type { IconProps } from "@phosphor-icons/react";
import { BookmarkIcon } from "@phosphor-icons/react";
import type { ComponentProps, HTMLAttributes } from "react";

export type CheckpointProps = HTMLAttributes<HTMLDivElement>;

export const Checkpoint = ({ className, children, ...props }: CheckpointProps) => (
  <div className={cn("flex items-center gap-0.5 overflow-hidden text-muted-foreground", className)} {...props}>
    {children}
    <Separator />
  </div>
);

export type CheckpointIconProps = IconProps;

export const CheckpointIcon = ({ className, children, ...props }: CheckpointIconProps) =>
  children ?? <BookmarkIcon className={cn("size-4 shrink-0", className)} {...props} />;

export type CheckpointTriggerProps = ComponentProps<typeof Button> & {
  readonly tooltip?: undefined | string;
};

export const CheckpointTrigger = ({
  children,
  variant = "ghost",
  size = "sm",
  tooltip,
  ...props
}: CheckpointTriggerProps) =>
  tooltip ? (
    <Tooltip>
      <TooltipTrigger render={<Button size={size} type="button" variant={variant} {...props} />}>
        {children}
      </TooltipTrigger>
      <TooltipContent align="start" side="bottom">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  ) : (
    <Button size={size} type="button" variant={variant} {...props}>
      {children}
    </Button>
  );
