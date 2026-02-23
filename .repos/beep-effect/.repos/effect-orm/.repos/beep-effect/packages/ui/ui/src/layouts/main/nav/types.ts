import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Item
 */
export type NavItemStateProps = {
  readonly open?: boolean | undefined;
  readonly active?: boolean | undefined;
};

export type NavItemOptionsProps = {
  readonly subItem?: boolean | undefined;
  readonly hasChild?: boolean | undefined;
  readonly externalLink?: boolean | undefined;
};

export type NavItemDataProps = {
  readonly path: string;
  readonly title: string;
  readonly icon?: string | React.ReactNode | undefined;
  readonly deepMatch?: boolean | undefined;
  readonly children?:
    | {
        readonly subheader: string;
        readonly items: { readonly title: string; readonly path: string }[];
      }[]
    | undefined;
};

export type NavItemProps = ButtonBaseProps & NavItemDataProps & NavItemStateProps & NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = React.ComponentProps<"li"> & {
  readonly sx?: SxProps<Theme>;
  readonly data: NavItemDataProps;
};

export type NavSubListProps = React.ComponentProps<"li"> & {
  readonly sx?: SxProps<Theme>;
  readonly subheader: string;
  readonly data: NavItemDataProps[];
};

/**
 * Main
 */
export type NavMainProps = {
  readonly sx?: SxProps<Theme>;
  readonly data: NavItemDataProps[];
};
