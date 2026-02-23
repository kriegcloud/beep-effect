import type { SettingsState } from "@beep/ui-core/settings/types";
import type { BoxProps } from "@mui/material/Box";
import Box from "@mui/material/Box";
import { alpha as hexAlpha } from "@mui/material/styles";

import { OptionButton } from "./styles";

export type PresetsOptionsProps = BoxProps & {
  readonly icon: React.ReactNode;
  readonly value: SettingsState["primaryColor"];
  readonly options: { readonly name: SettingsState["primaryColor"]; readonly value: string }[];
  readonly onChangeOption: (newOption: SettingsState["primaryColor"]) => void;
};

export function PresetsOptions({ sx, icon, value, options, onChangeOption, ...other }: PresetsOptionsProps) {
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
        const selected = value === option.name;

        return (
          <OptionButton
            key={option.name}
            onClick={() => onChangeOption(option.name)}
            sx={{
              height: 64,
              color: option.value,
              ...(selected && {
                bgcolor: hexAlpha(option.value, 0.08),
              }),
            }}
          >
            {icon}
          </OptionButton>
        );
      })}
    </Box>
  );
}
