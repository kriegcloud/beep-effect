import { rgbaFromChannel } from "@beep/ui-core/utils";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import type { SettingsState } from "../types";

import { OptionButton } from "./styles";

export type NavLayoutOptionProps = BoxProps & {
  value: SettingsState["navLayout"];
  options: {
    value: SettingsState["navLayout"];
    icon: React.ReactNode;
  }[];
  onChangeOption: (newOption: SettingsState["navLayout"]) => void;
};

export function NavLayoutOptions({ sx, value, options, onChangeOption, ...other }: NavLayoutOptionProps) {
  return (
    <Box
      sx={[
        {
          gap: 1.5,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {options.map((option) => {
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            sx={[
              (theme) => ({
                height: 64,
                border: `solid 1px ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.08)}`,
              }),
            ]}
          >
            {option.icon}
          </OptionButton>
        );
      })}
    </Box>
  );
}

export type NavColorOptionProps = BoxProps & {
  value: SettingsState["navColor"];
  options: {
    label: string;
    value: SettingsState["navColor"];
    icon: React.ReactNode;
  }[];
  onChangeOption: (newOption: SettingsState["navColor"]) => void;
};

export function NavColorOptions({ sx, value, options, onChangeOption, ...other }: NavColorOptionProps) {
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
        const selected = value === option.value;

        return (
          <OptionButton
            key={option.value}
            selected={selected}
            onClick={() => onChangeOption(option.value)}
            sx={{ gap: 1.5, height: 56 }}
          >
            {option.icon}
            {option.label}
          </OptionButton>
        );
      })}
    </Box>
  );
}
