import { parseCssVar } from "@beep/ui-core/utils";
import type { AvatarGroupClassKey } from "@mui/material/AvatarGroup";
import Box from "@mui/material/Box";
import type { Components, ComponentsVariants, Theme } from "@mui/material/styles";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import type { PaletteColorKey } from "../palette";

import { colorKeys } from "../palette";

/**
 * TypeScript extension for MUI theme augmentation.
 * @to {@link file://./../../extend-theme-types.d.ts}
 */
export type AvatarGroupExtendVariant = { compact: true };
export type AvatarExtendColor = {
  readonly color?: PaletteColorKey | "default" | "inherit" | undefined;
};

type AvatarVariants = ComponentsVariants<Theme>["MuiAvatar"];
type AvatarGroupVariants = ComponentsVariants<Theme>["MuiAvatarGroup"];

const baseColors = ["default", "inherit"] as const;
const allColors = [...baseColors, ...colorKeys.palette] as const;

export function getAvatarColor(
  inputValue?: string | undefined,
  fallback: AvatarExtendColor["color"] = "default"
): string {
  if (!inputValue) {
    return fallback;
  }

  const trimmed = Str.trim(inputValue);
  if (Str.isEmpty(trimmed)) {
    return fallback;
  }

  const firstChar = F.pipe(
    trimmed,
    Str.split(""),
    A.head,
    O.map(Str.toLowerCase),
    O.getOrElse(() => "")
  );

  // Only handle alphabet characters a-z
  if (!/[a-z]/.test(firstChar)) {
    return fallback;
  }

  const alphabetIndex = firstChar.charCodeAt(0) - "a".charCodeAt(0); // 0 for 'a', 25 for 'z'
  const colorIndex = alphabetIndex % allColors.length;

  return F.pipe(
    allColors,
    A.get(colorIndex),
    O.getOrElse(() => fallback)
  );
}

const customRenderSurplus = (surplus: number) => (
  <Box
    component="span"
    sx={[
      (theme) => ({
        width: 1,
        height: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        color: theme.vars.palette.primary.dark,
        backgroundColor: theme.vars.palette.primary.lighter,
        fontSize: {
          "@": theme.typography.pxToRem(11),
          "@32": theme.typography.pxToRem(12),
          "@36": theme.typography.pxToRem(13),
          "@40": theme.typography.pxToRem(14),
          "@64": theme.typography.pxToRem(18),
        },
      }),
    ]}
  >
    +{surplus}
  </Box>
);

/* **********************************************************************
 * 🗳️ Variants
 * **********************************************************************/
const colorVariants = [
  {
    props: {},
    style: ({ theme }) => ({
      color: theme.vars.palette.action.active,
      [parseCssVar(theme.vars.palette.Avatar.defaultBg)]: theme.vars.palette.grey[300],
      ...theme.applyStyles("dark", {
        [parseCssVar(theme.vars.palette.Avatar.defaultBg)]: theme.vars.palette.grey[700],
      }),
    }),
  },
  {
    props: (props) => props.color === "inherit" || (!!props.alt && getAvatarColor(props.alt) === "inherit"),
    style: ({ theme }) => ({
      ...theme.mixins.filledStyles(theme, "inherit"),
    }),
  },
  ...F.pipe(
    colorKeys.palette,
    A.map((colorKey) => ({
      props: (props) => props.color === colorKey || (!!props.alt && getAvatarColor(props.alt) === colorKey),
      style: ({ theme }) => ({
        color: theme.vars.palette[colorKey].contrastText,
        backgroundColor: theme.vars.palette[colorKey].main,
      }),
    }))
  ) satisfies AvatarVariants,
] satisfies AvatarVariants;

const avatarGroupVariants = {
  root: [
    {
      props: (props) => props.variant === "compact",
      style: { width: 40, height: 40, position: "relative" },
    },
  ],
  avatar: [
    {
      props: (props) => props.variant === "compact",
      style: {
        margin: 0,
        width: 28,
        height: 28,
        position: "absolute",
        "&:first-of-type": { left: 0, bottom: 0, zIndex: 9 },
        "&:last-of-type": { top: 0, right: 0 },
      },
    },
  ],
} satisfies Record<AvatarGroupClassKey, AvatarGroupVariants>;

/* **********************************************************************
 * 🧩 Components
 * **********************************************************************/
const MuiAvatar: Components<Theme>["MuiAvatar"] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      containerType: "inline-size",
      fontSize: theme.typography.pxToRem(18),
      fontWeight: theme.typography.fontWeightMedium,
    }),
    colorDefault: {
      variants: [...colorVariants],
    },
    rounded: ({ theme }) => ({
      borderRadius: Number(theme.shape.borderRadius) * 1.5,
    }),
  },
};

const MuiAvatarGroup: Components<Theme>["MuiAvatarGroup"] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    max: 4,
    renderSurplus: (surplus: number) => customRenderSurplus(surplus),
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: {
      justifyContent: "flex-end",
      variants: [...avatarGroupVariants.root],
    },
    avatar: {
      variants: [...avatarGroupVariants.avatar],
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const avatar: Components<Theme> = {
  MuiAvatar,
  MuiAvatarGroup,
};
