import type { ButtonBaseProps } from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";

/**
 * Item
 */
export type NavItemRenderProps = {
  readonly navIcon?: Record<string, React.ReactNode> | undefined;
  readonly navInfo?: ((val: string) => Record<string, React.ReactElement>) | undefined;
};

export type NavItemStateProps = {
  readonly open?: boolean | undefined;
  readonly active?: boolean | undefined;
  readonly disabled?: boolean | undefined;
};

export type NavItemSlotProps = {
  readonly sx?: SxProps<Theme> | undefined;
  readonly icon?: SxProps<Theme> | undefined;
  readonly texts?: SxProps<Theme> | undefined;
  readonly title?: SxProps<Theme> | undefined;
  readonly caption?: SxProps<Theme> | undefined;
  readonly info?: SxProps<Theme> | undefined;
  readonly arrow?: SxProps<Theme> | undefined;
};

export type NavSlotProps = {
  readonly rootItem?: NavItemSlotProps | undefined;
  readonly subItem?: NavItemSlotProps | undefined;
  readonly dropdown?:
    | {
        readonly paper?: SxProps<Theme> | undefined;
      }
    | undefined;
};

export type NavItemOptionsProps = {
  readonly depth?: number | undefined;
  readonly hasChild?: boolean | undefined;
  readonly externalLink?: boolean | undefined;
  readonly enabledRootRedirect?: boolean | undefined;
  readonly render?: NavItemRenderProps | undefined;
  readonly slotProps?: NavItemSlotProps | undefined;
};

export type NavItemDataProps = Pick<NavItemStateProps, "disabled"> & {
  readonly path: string;
  readonly title: string;
  readonly caption?: string | undefined;
  readonly children?: NavItemDataProps[] | undefined;
  readonly icon?: string | React.ReactNode | undefined;
  readonly info?: string[] | React.ReactNode | undefined;
  readonly deepMatch?: boolean | undefined;
};

export type NavItemProps = ButtonBaseProps & NavItemDataProps & NavItemStateProps & NavItemOptionsProps;

/**
 * List
 */
export type NavListProps = Pick<NavItemProps, "render" | "depth" | "enabledRootRedirect"> & {
  readonly cssVars?: SxProps<Theme> | undefined;
  readonly data: NavItemDataProps;
  readonly slotProps?: NavSlotProps | undefined;
};

export type NavSubListProps = Omit<NavListProps, "data"> & {
  readonly data: NavItemDataProps[];
};

/**
 * Main
 */
export type NavBasicProps = React.ComponentProps<"nav"> &
  Omit<NavListProps, "data" | "depth"> & {
    readonly sx?: SxProps<Theme> | undefined;
    readonly data: NavItemDataProps[];
  };
