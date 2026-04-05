import type { SxProps, Theme } from "@mui/material/styles";
import type React from "react";

interface OverridableComponentMeta<Props, DefaultComponent extends React.ElementType> {
  readonly $$defaultComponent?: DefaultComponent;
  readonly $$ownProps?: Props;
}

type InferProps<C extends React.ElementType> =
  C extends OverridableComponentMeta<infer P, infer D extends React.ElementType>
    ? (P & {}) & React.ComponentPropsWithoutRef<D>
    : React.ComponentPropsWithoutRef<C>;

export type OverridableComponent<
  Props extends { component?: React.ElementType },
  DefaultComponent extends React.ElementType = "button",
> = (<C extends React.ElementType = DefaultComponent>(
  props: Omit<Props, "component"> &
    Omit<InferProps<C>, keyof Props> & {
      component?: C;
    } & React.RefAttributes<React.ComponentRef<C>>
) => React.JSX.Element) &
  OverridableComponentMeta<Props, DefaultComponent>;

export type ForwardStyledProps<P extends object = Record<never, never>> = P & {
  sx?: SxProps<Theme>;
};
