import type { ComponentType } from "react";

export type Image = ComponentType<{
  readonly src: string;
  readonly alt: string;
  readonly className?: undefined | string;
}>;
