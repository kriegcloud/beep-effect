import { setFont } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { SliderProps } from "@mui/material/Slider";
import Slider, { sliderClasses } from "@mui/material/Slider";
import type { SettingsState } from "../types";

import { OptionButton } from "./styles";

export type FontFamilyOptionsProps = BoxProps & {
  options: string[];
  icon: React.ReactNode;
  value: SettingsState["fontFamily"];
  onChangeOption: (newOption: string) => void;
};

export function FontFamilyOptions({ sx, icon, value, options, onChangeOption, ...other }: FontFamilyOptionsProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option;

        return (
          <OptionButton
            key={option}
            selected={selected}
            onClick={() => onChangeOption(option)}
            sx={(theme) => ({
              py: 2,
              gap: 0.75,
              flexDirection: "column",
              fontFamily: setFont(option),
              fontSize: theme.typography.pxToRem(12),
            })}
          >
            {icon}
            {option.endsWith("Variable") ? option.replace(" Variable", "") : option}
          </OptionButton>
        );
      })}
    </Box>
  );
}

export type FontSizeOptionsProps = SliderProps & {
  options: [number, number];
  value: SettingsState["fontSize"];
  onChangeOption: (newOption: number) => void;
};

export function FontSizeOptions({ sx, value, options, onChangeOption, ...other }: FontSizeOptionsProps) {
  return (
    <Slider
      marks
      step={1}
      size="small"
      valueLabelDisplay="on"
      aria-label="Change font size"
      valueLabelFormat={(val) => `${val}px`}
      value={value}
      min={options[0]}
      max={options[1]}
      onChange={(event: Event, newOption: number | number[]) => onChangeOption(newOption as number)}
      sx={[
        (theme) => ({
          [`& .${sliderClasses.rail}`]: {
            height: 12,
          },
          [`& .${sliderClasses.track}`]: {
            height: 12,
            background: `linear-gradient(135deg, ${theme.vars.palette.primary.light}, ${theme.vars.palette.primary.dark})`,
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}
