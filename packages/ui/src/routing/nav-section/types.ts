import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { CSSObject, SxProps, Theme } from "@mui/material/styles";
import type React from "react";

/**
 * Item
 */
export type NavItemRenderProps = {
  readonly navIcon?: Record<string, React.ReactNode>;
  readonly navInfo?: (val: string) => Record<string, React.ReactElement>;
};

export type NavItemStateProps = {
  readonly open?: boolean;
  readonly active?: boolean;
  readonly disabled?: boolean;
};

export type NavItemSlotProps = {
  readonly sx?: SxProps<Theme>;
  readonly icon?: SxProps<Theme>;
  readonly texts?: SxProps<Theme>;
  readonly title?: SxProps<Theme>;
  readonly caption?: SxProps<Theme>;
  readonly info?: SxProps<Theme>;
  readonly arrow?: SxProps<Theme>;
};

export type NavSlotProps = {
  readonly rootItem?: NavItemSlotProps;
  readonly subItem?: NavItemSlotProps;
  readonly subheader?: SxProps<Theme>;
  readonly dropdown?: {
    readonly paper?: SxProps<Theme>;
  };
};

export type NavItemOptionsProps = {
  readonly depth?: number;
  readonly hasChild?: boolean;
  readonly externalLink?: boolean;
  readonly enabledRootRedirect?: boolean;
  readonly render?: NavItemRenderProps;
  readonly slotProps?: NavItemSlotProps;
};

export type NavItemDataProps = Pick<NavItemStateProps, "disabled"> & {
  readonly path: string;
  readonly title: string;
  readonly icon?: string | React.ReactNode;
  readonly info?: string[] | React.ReactNode;
  readonly caption?: string;
  readonly deepMatch?: boolean;
  readonly allowedRoles?: string[];
  readonly children?: NavItemDataProps[];
};

export type NavItemProps = ButtonBaseProps & NavItemDataProps & NavItemStateProps & NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = Pick<NavItemProps, "render" | "depth" | "enabledRootRedirect"> & {
  readonly cssVars?: CSSObject;
  readonly data: NavItemDataProps;
  readonly slotProps?: NavSlotProps;
  readonly checkPermissions?: (allowedRoles?: NavItemProps["allowedRoles"]) => boolean;
};

export type NavSubListProps = Omit<NavListProps, "data"> & {
  readonly data: NavItemDataProps[];
};

export type NavGroupProps = Omit<NavListProps, "data" | "depth"> & {
  readonly subheader?: string;
  readonly items: NavItemDataProps[];
};

/**
 * Main
 */
export type NavSectionProps = React.ComponentProps<"nav"> &
  Omit<NavListProps, "data" | "depth"> & {
    readonly sx?: SxProps<Theme>;
    readonly data: {
      readonly subheader?: string;
      readonly items: NavItemDataProps[];
    }[];
  };
