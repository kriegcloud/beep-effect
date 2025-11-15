import { Iconify } from "@beep/ui/atoms";
import { mergeClasses, rgbaFromChannel } from "@beep/ui-core/utils";
import ButtonBase from "@mui/material/ButtonBase";
import type { SxProps, Theme } from "@mui/material/styles";
import { alpha as hexAlpha, styled } from "@mui/material/styles";
import type * as A from "effect/Array";
import type React from "react";
import { useCallback } from "react";
import { colorPickerClasses } from "./classes";

export type ColorPickerSlotProps = {
  readonly item?: React.ComponentProps<typeof ItemRoot> | undefined;
  readonly itemContainer?: React.ComponentProps<typeof ItemContainer> | undefined;
  readonly icon?: React.ComponentProps<typeof ItemIcon> | undefined;
};

export type ColorPickerProps = Omit<React.ComponentProps<"ul">, "onChange"> & {
  readonly sx?: SxProps<Theme> | undefined;
  readonly size?: number | undefined;
  readonly options: A.NonEmptyReadonlyArray<string>;
  readonly limit?: "auto" | number | undefined;
  readonly value: string | string[];
  readonly variant?: "circular" | "rounded" | "square" | undefined;
  readonly onChange: (value: string | string[]) => void;
  readonly slotProps?: ColorPickerSlotProps | undefined;
};

export function ColorPicker({
  sx,
  value,
  onChange,
  slotProps,
  className,
  size = 36,
  options,
  limit = "auto",
  variant = "circular",
  ...other
}: ColorPickerProps) {
  const isSingleSelect = typeof value === "string";

  const handleSelect = useCallback(
    (color: string) => {
      if (isSingleSelect) {
        if (color !== value) {
          onChange?.(color);
        }
      } else {
        const selected = value as string[];

        const newSelected = selected.includes(color)
          ? selected.filter((currentColor) => currentColor !== color)
          : [...selected, color];

        onChange?.(newSelected);
      }
    },
    [onChange, value, isSingleSelect]
  );

  return (
    <ColorPickerRoot
      limit={limit}
      className={mergeClasses([colorPickerClasses.root, className])}
      sx={[
        {
          "--item-size": `${size}px`,
          "--item-radius":
            (variant === "circular" && "50%") || (variant === "rounded" && "calc(var(--item-size) / 6)") || "0px",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((color) => {
        const hasSelected = isSingleSelect ? value === color : (value as string[]).includes(color);

        return (
          <li key={color}>
            <ItemRoot
              aria-label={color}
              onClick={() => handleSelect(color)}
              className={colorPickerClasses.item.root}
              {...slotProps?.item}
            >
              <ItemContainer
                color={color}
                hasSelected={hasSelected}
                className={colorPickerClasses.item.container}
                {...slotProps?.itemContainer}
              >
                <ItemIcon
                  color={color}
                  hasSelected={hasSelected}
                  icon="eva:checkmark-fill"
                  className={colorPickerClasses.item.icon}
                  {...slotProps?.icon}
                />
              </ItemContainer>
            </ItemRoot>
          </li>
        );
      })}
    </ColorPickerRoot>
  );
}

const ColorPickerRoot = styled("ul", {
  shouldForwardProp: (prop: string) => !["limit", "sx"].includes(prop),
})<Pick<ColorPickerProps, "limit">>(({ limit }) => ({
  flexWrap: "wrap",
  flexDirection: "row",
  display: "inline-flex",
  "& > li": { display: "inline-flex" },
  ...(typeof limit === "number" && {
    justifyContent: "flex-end",
    width: `calc(var(--item-size) * ${limit})`,
  }),
}));

const ItemRoot = styled(ButtonBase)(() => ({
  width: "var(--item-size)",
  height: "var(--item-size)",
  borderRadius: "var(--item-radius)",
}));

const ItemContainer = styled("span", {
  shouldForwardProp: (prop: string) => !["color", "hasSelected", "sx"].includes(prop),
})<{ color: string; hasSelected: boolean }>(({ color, theme }) => ({
  alignItems: "center",
  display: "inline-flex",
  borderRadius: "inherit",
  justifyContent: "center",
  backgroundColor: color,
  width: "calc(var(--item-size) - 16px)",
  height: "calc(var(--item-size) - 16px)",
  border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.16)}`,
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: { hasSelected: true },
      style: {
        width: "calc(var(--item-size) - 8px)",
        height: "calc(var(--item-size) - 8px)",
        outline: `solid 2px ${hexAlpha(color, 0.08)}`,
        boxShadow: `4px 4px 8px 0 ${hexAlpha(color, 0.48)}`,
      },
    },
  ],
}));

const ItemIcon = styled(Iconify, {
  shouldForwardProp: (prop: string) => !["color", "hasSelected", "sx"].includes(prop),
})<{ color: string; hasSelected: boolean }>(({ color, theme }) => ({
  width: 0,
  height: 0,
  color: theme.palette.getContrastText(color),
  transition: theme.transitions.create(["all"], {
    duration: theme.transitions.duration.shortest,
  }),
  variants: [
    {
      props: { hasSelected: true },
      style: {
        width: "calc(var(--item-size) / 2.4)",
        height: "calc(var(--item-size) / 2.4)",
      },
    },
  ],
}));
