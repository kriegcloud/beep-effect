"use client";

import { SettingsIcon } from "@beep/ui/icons";
import { Button, buttonClasses, useTheme } from "@mui/material";
import { useSettingsPanelContext } from "../SettingsPanelProvider";

const SettingPanelToggler = () => {
  const { setSettingsPanelConfig } = useSettingsPanelContext();

  const theme = useTheme();
  return (
    <Button
      size="medium"
      color="neutral"
      variant="soft"
      sx={[
        {
          position: "fixed",
          zIndex: theme.zIndex.drawer + 1,
          top: "50%",
          right: -47,
          border: 1,
          fontSize: 13,
          borderColor: "divider",
          borderRadius: "8px 8px 0 0",
          borderBottomColor: "transparent",
          transform: "rotate(-90deg)  translateX(50%)",
          textTransform: "uppercase",
          px: 1.25,
          py: 0.5,
          [`& .${buttonClasses.icon}`]: {
            marginRight: 0.5,
          },
        },
        theme.direction === "rtl" && {
          transform: "rotate(90deg)  translateX(50%)",
        },
      ]}
      startIcon={
        <SettingsIcon
          sx={{
            color: "primary.main",
            animation: `spin 5s linear infinite`,
          }}
        />
      }
      onClick={() =>
        setSettingsPanelConfig({
          openSettingPanel: true,
        })
      }
    >
      Customize
    </Button>
  );
};

export default SettingPanelToggler;
