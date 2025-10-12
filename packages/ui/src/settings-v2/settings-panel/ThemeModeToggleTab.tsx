import { Iconify } from "@beep/ui/atoms";
import { useThemeMode } from "@beep/ui/hooks";
import type { ThemeMode } from "@beep/ui-core/settings";
import { cssVarRgba } from "@beep/ui-core/utils";
import { Tab, Tabs, tabClasses, tabsClasses } from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import type { SyntheticEvent } from "react";

const ThemeModeToggleTab = () => {
  const { mode, setThemeMode } = useThemeMode();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (_event: SyntheticEvent, newValue: ThemeMode.Type) => {
    router.replace(pathname);
    setThemeMode(newValue);
  };

  return (
    <Tabs
      value={mode}
      onChange={handleChange}
      sx={({ vars, transitions }) => ({
        bgcolor: "primary.lighter",
        p: 0.5,
        borderRadius: 2,
        [`& .${tabsClasses.list}`]: {
          gap: 0,
        },
        [`& .${tabsClasses.indicator}`]: {
          height: 1,
          bgcolor: cssVarRgba(vars.palette.primary.mainChannel, 0.2),
          borderRadius: 1,
          transition: `${transitions.create("all", {
            duration: transitions.duration.short,
          })} !important`,
        },
        [`& .${tabClasses.root}`]: {
          color: "text.primary",
          fontWeight: 600,
          [`&.${tabClasses.selected}`]: {
            color: "primary.dark",
          },
        },
      })}
    >
      <Tab
        value="light"
        label="Light"
        icon={<Iconify icon="material-symbols:light-mode-outline-rounded" fontSize={18} />}
        iconPosition="start"
        disableRipple
        sx={{ px: 1.25 }}
      />
      <Tab
        value="dark"
        label="Dark"
        icon={<Iconify icon="material-symbols-light:dark-mode-outline-rounded" fontSize={20} />}
        iconPosition="start"
        disableRipple
        sx={{ px: 1.25 }}
      />
      <Tab
        value="system"
        label="System"
        icon={<Iconify icon="material-symbols:monitor-outline-rounded" fontSize={18} />}
        iconPosition="start"
        disableRipple
        sx={{ px: 1.25 }}
      />
    </Tabs>
  );
};

export default ThemeModeToggleTab;
