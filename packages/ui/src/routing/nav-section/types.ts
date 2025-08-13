import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import React from "react";

/**
 * Item
 */
export type NavItemRenderProps = {
  navIcon?: Record<string, React.ReactNode> | undefined;
  navInfo?: ((val: string) => Record<string, React.ReactElement>) | undefined;
};

export type NavItemStateProps = {
  open?: boolean | undefined;
  active?: boolean | undefined;
  disabled?: boolean | undefined;
};

export type NavItemSlotProps = {
  sx?: SxProps<Theme> | undefined;
  icon?: SxProps<Theme> | undefined;
  texts?: SxProps<Theme> | undefined;
  title?: SxProps<Theme> | undefined;
  caption?: SxProps<Theme> | undefined;
  info?: SxProps<Theme> | undefined;
  arrow?: SxProps<Theme> | undefined;
};

export type NavSlotProps = {
  rootItem?: NavItemSlotProps | undefined;
  subItem?: NavItemSlotProps | undefined;
  subheader?: SxProps<Theme> | undefined;
  dropdown?:
    | {
        paper?: SxProps<Theme> | undefined;
      }
    | undefined;
};

export type NavItemOptionsProps = {
  depth?: number | undefined;
  hasChild?: boolean | undefined;
  externalLink?: boolean | undefined;
  enabledRootRedirect?: boolean | undefined;
  render?: NavItemRenderProps | undefined;
  slotProps?: NavItemSlotProps | undefined;
};

export type NavItemDataProps = Pick<NavItemStateProps, "disabled"> & {
  path: string;
  title: string;
  icon?: string | undefined | React.ReactNode;
  info?: string[] | undefined | React.ReactNode;
  caption?: string | undefined;
  allowedRoles?: string | undefined | string[];
  children?: NavItemDataProps[] | undefined;
};

export type NavItemProps = ButtonBaseProps &
  NavItemDataProps &
  NavItemStateProps &
  NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = Pick<
  NavItemProps,
  "render" | "depth" | "enabledRootRedirect"
> & {
  cssVars?: CSSObject | undefined;
  data: NavItemDataProps;
  slotProps?: NavSlotProps | undefined;
  checkPermissions?:
    | ((allowedRoles?: NavItemProps["allowedRoles"] | undefined) => boolean)
    | undefined;
};

export type NavSubListProps = Omit<NavListProps, "data"> & {
  data: NavItemDataProps[];
};

export type NavGroupProps = Omit<NavListProps, "data" | "depth"> & {
  subheader?: string;
  items: NavItemDataProps[];
};

/**
 * Main
 */
export type NavSectionProps = React.ComponentProps<"nav"> &
  Omit<NavListProps, "data" | "depth"> & {
    sx?: SxProps<Theme> | undefined;
    data: {
      subheader: string | undefined;
      items: NavItemDataProps[];
    }[];
  };
