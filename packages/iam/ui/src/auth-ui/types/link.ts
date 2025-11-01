import type { ComponentType, ReactNode } from "react";

export type Link = ComponentType<{
  readonly href: string;
  readonly className?: undefined | string;
  readonly children: ReactNode;
}>;
