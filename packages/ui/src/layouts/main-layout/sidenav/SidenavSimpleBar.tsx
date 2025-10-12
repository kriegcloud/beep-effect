import { useThemeMode } from "@beep/ui/hooks";
import { SimpleBar, type SimpleBarProps } from "@beep/ui/molecules/SimpleBar";
import { useSettingsContext } from "@beep/ui/settings-v2/SettingsProvider";
import { cssVarRgba } from "@beep/ui-core/utils";
import type { PropsWithChildren } from "react";

const SidenavSimpleBar = ({ children, sx, ...props }: PropsWithChildren<SimpleBarProps>) => {
  const {
    config: { navColor },
  } = useSettingsContext();
  const { isDark } = useThemeMode();

  return (
    <SimpleBar
      {...props}
      autoHide
      sx={{
        height: 1,
        "& .simplebar-track": {
          "&.simplebar-vertical": {
            "& .simplebar-scrollbar": {
              "&:before": {
                backgroundColor: (theme) =>
                  navColor === "vibrant"
                    ? isDark
                      ? cssVarRgba(theme.vars.palette.common.whiteChannel, 0.3)
                      : cssVarRgba(theme.vars.palette.common.whiteChannel, 0.7)
                    : "chGrey.300",
              },
            },
          },
        },
        ...sx,
      }}
    >
      {children}
    </SimpleBar>
  );
};

export default SidenavSimpleBar;
