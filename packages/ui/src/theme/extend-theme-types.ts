import type { DeepPartial } from "@beep/types";
import type { AvatarExtendColor, AvatarGroupExtendVariant } from "@beep/ui-core/theme/core/components/avatar";
import type { BadgeExtendVariant } from "@beep/ui-core/theme/core/components/badge";
import type {
  ButtonExtendColor,
  ButtonExtendSize,
  ButtonExtendVariant,
} from "@beep/ui-core/theme/core/components/button";
import type { FabExtendColor, FabExtendVariant } from "@beep/ui-core/theme/core/components/button-fab";
import type {
  ButtonGroupExtendColor,
  ButtonGroupExtendVariant,
} from "@beep/ui-core/theme/core/components/button-group";
import type { IconButtonExtendColor } from "@beep/ui-core/theme/core/components/button-icon";
import type { ChipExtendColor, ChipExtendVariant } from "@beep/ui-core/theme/core/components/chip";
import type { PaginationExtendColor, PaginationExtendVariant } from "@beep/ui-core/theme/core/components/pagination";
import type { RatingExtendSize } from "@beep/ui-core/theme/core/components/rating";
import type { SliderExtendColor } from "@beep/ui-core/theme/core/components/slider";
import type { TabsExtendIndicatorColor } from "@beep/ui-core/theme/core/components/tabs";
import type { CustomShadows } from "@beep/ui-core/theme/core/custom-shadows";
import type { MixinsExtend } from "@beep/ui-core/theme/core/mixins";
import type { OpacityExtend } from "@beep/ui-core/theme/core/opacity";
import type {
  CommonColorsExtend,
  GreyExtend,
  PaletteColorExtend,
  PaletteExtend,
  TypeBackgroundExtend,
  TypeTextExtend,
} from "@beep/ui-core/theme/core/palette";
import type { TypographyVariantsExtend } from "@beep/ui-core/theme/core/typography";
import type {} from "@mui/lab/themeAugmentation";
import type {} from "@mui/material/themeCssVarsAugmentation";
import type {} from "@mui/x-data-grid/themeAugmentation";
import type {} from "@mui/x-date-pickers/themeAugmentation";
import type {} from "@mui/x-tree-view/themeAugmentation";

/* **********************************************************************
 * 🧬 Extend: Core (palette, typography, shadows, mixins...)
 * **********************************************************************/
declare module "@mui/material/styles" {
  /**
   * ➤➤ Palette (https://mui.com/customization/palette/)
   * @from {@link file://./core/palette.ts}
   */
  // primary, secondary, info, success, warning, error
  interface PaletteColor extends PaletteColorExtend {}

  interface SimplePaletteColorOptions extends Partial<PaletteColorExtend> {}

  // text, background, common, grey
  interface Color extends GreyExtend {}

  interface TypeText extends TypeTextExtend {}

  interface CommonColors extends CommonColorsExtend {}

  interface TypeBackground extends TypeBackgroundExtend {}

  interface PaletteColor {
    lighter: string;
    darker: string;
  }

  // extend palette
  interface Palette extends PaletteExtend {
    neutral: PaletteColor;
  }

  interface PaletteOptions extends DeepPartial<PaletteExtend> {}

  /**
   * ➤➤ Typography (https://mui.com/customization/typography/)
   * @from {@link file://./core/typography.ts}
   */
  interface TypographyVariants extends TypographyVariantsExtend {}

  interface TypographyVariantsOptions extends Partial<TypographyVariantsExtend> {}

  /**
   * ➤➤ Mixins
   * @from {@link file://./core/mixins.ts}
   */
  interface Mixins extends MixinsExtend {}

  interface MixinsOptions extends Partial<MixinsExtend> {}

  /**
   * ➤➤ Opacity
   * @from {@link file://./core/opacity.ts}
   */
  interface Opacity extends OpacityExtend {}

  /**
   * Register the new variant in the `Theme` interface.
   *
   * ➤➤ Custom shadows
   * @from {@link file://./core/custom-shadows.ts}
   *
   */
  interface Theme {
    customShadows: CustomShadows;
  }

  interface ThemeOptions {
    customShadows?: Partial<CustomShadows>;
  }

  interface ThemeVars {
    customShadows: CustomShadows;
  }
}

/* **********************************************************************
 * 🧬 Extend: Components
 * **********************************************************************/

/**
 * ➤➤ Avatar, AvatarGroup (https://mui.com/components/avatars/)
 * @from {@link file://./core/components/avatar.tsx}
 */
declare module "@mui/material/Avatar" {
  interface AvatarOwnProps extends AvatarExtendColor {}
}
declare module "@mui/material/AvatarGroup" {
  interface AvatarGroupPropsVariantOverrides extends AvatarGroupExtendVariant {}
}

/**
 * ➤➤ Badge (https://mui.com/components/badges/)
 * @from {@link file://./core/components/badge.tsx}
 */
declare module "@mui/material/Badge" {
  interface BadgePropsVariantOverrides extends BadgeExtendVariant {}
}

/**
 * ➤➤ Button (https://mui.com/components/buttons/)
 * @from {@link file://./core/components/button.tsx}
 */
declare module "@mui/material/Button" {
  interface ButtonPropsVariantOverrides extends ButtonExtendVariant {}

  interface ButtonPropsColorOverrides extends ButtonExtendColor {}

  interface ButtonPropsSizeOverrides extends ButtonExtendSize {}
}

/**
 * ➤➤ IconButton (https://mui.com/components/buttons/#icon-button)
 * @from {@link file://./core/components/button-icon.tsx}
 */
declare module "@mui/material/IconButton" {
  interface IconButtonPropsColorOverrides extends IconButtonExtendColor {}
}

/**
 * ➤➤ ButtonGroup (https://mui.com/components/button-group/)
 * @from {@link file://./core/components/button-group.tsx}
 */
declare module "@mui/material/ButtonGroup" {
  interface ButtonGroupPropsVariantOverrides extends ButtonGroupExtendVariant {}

  interface ButtonGroupPropsColorOverrides extends ButtonGroupExtendColor {}
}

/**
 * ➤➤ Fab (https://mui.com/components/floating-action-button/)
 * @from {@link file://./core/components/button-fab.tsx}
 */
declare module "@mui/material/Fab" {
  interface FabPropsVariantOverrides extends FabExtendVariant {}

  interface FabPropsColorOverrides extends FabExtendColor {}
}

/**
 * ➤➤ Chip (https://mui.com/components/chips/)
 * @from {@link file://./core/components/chip.tsx}
 */
declare module "@mui/material/Chip" {
  interface ChipPropsVariantOverrides extends ChipExtendVariant {}

  interface ChipPropsColorOverrides extends ChipExtendColor {}

  interface ChipPropsSizeOverrides {
    xsmall: true;
  }
}

/**
 * ➤➤ Pagination (https://mui.com/components/pagination/)
 * @from {@link file://./core/components/pagination.tsx}
 */
declare module "@mui/material/Pagination" {
  interface PaginationPropsVariantOverrides extends PaginationExtendVariant {}

  interface PaginationPropsColorOverrides extends PaginationExtendColor {}
}
declare module "@mui/material/PaginationItem" {
  interface PaginationItemPropsVariantOverrides extends PaginationExtendVariant {}

  interface PaginationItemPropsColorOverrides extends PaginationExtendColor {}
}

/**
 * ➤➤ Slider (https://mui.com/components/slider/)
 * @from {@link file://./core/components/slider.tsx}
 */
declare module "@mui/material/Slider" {
  interface SliderPropsColorOverrides extends SliderExtendColor {}
}

/**
 * ➤➤ Rating (https://mui.com/components/rating/)
 * @from {@link file://./core/components/rating.tsx}
 */
declare module "@mui/material/Rating" {
  interface RatingPropsSizeOverrides extends RatingExtendSize {}
}

/**
 * ➤➤ Tabs (https://mui.com/components/tabs/)
 * @from {@link file://./core/components/tabs.tsx}
 */
declare module "@mui/material/Tabs" {
  interface TabsPropsIndicatorColorOverrides extends TabsExtendIndicatorColor {}
}
