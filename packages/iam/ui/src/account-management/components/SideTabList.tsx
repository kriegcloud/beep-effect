"use client";
import { Iconify } from "@beep/ui/atoms";
import { useBreakpoints } from "@beep/ui/providers/break-points.provider";
import { StyledTextField } from "@beep/ui/styled";
import { TabList } from "@mui/lab";
import type { SxProps } from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import type { PaperProps } from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { tabsClasses } from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import * as A from "effect/Array";
import React from "react";
import { accountTabs } from "../account-tab";
import { AccountTab } from "./common";

interface SideTabListProps extends PaperProps {
  readonly setShowTabList: React.Dispatch<React.SetStateAction<boolean>>;
  readonly handleChange: (event: React.SyntheticEvent, newValue: string) => void;
  readonly sx?: SxProps;
}

export const SideTabList: React.FC<SideTabListProps> = ({ setShowTabList, handleChange, sx, ...other }) => {
  const { down, currentBreakpoint } = useBreakpoints();

  const downMd = down("md");

  React.useEffect(() => {
    if (!downMd) {
      setShowTabList(false);
    }
  }, [downMd]);

  return (
    <Stack direction="column" spacing={3} sx={{ p: { xs: 3, md: 5 }, ...sx }}>
      <Typography
        variant="h4"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: {
            xs: "h4.fontSize",
            md: "h6.fontSize",
            lg: "h4.fontSize",
          },
        }}
      >
        <Iconify icon="material-symbols:settings-outline" sx={{ fontSize: { xs: 20, lg: 24 } }} />
        Account Settings
      </Typography>
      <Stack direction="column" spacing={2} sx={{ width: 1 }}>
        <StyledTextField
          id="settings-search-box"
          type="search"
          placeholder="Find a setting"
          fullWidth
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="material-symbols:search-rounded" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: { xs: 1, sm: 0.5, md: 1 } }}
        />

        <TabList
          orientation="vertical"
          variant="scrollable"
          scrollButtons={false}
          onChange={handleChange}
          sx={{
            [`& .${tabsClasses.indicator}`]: {
              display: "none",
            },
            [`& .${tabsClasses.list}`]: {
              gap: 1,
              display: currentBreakpoint === "sm" ? "grid" : "flex",
              gridTemplateColumns: "repeat(2, 1fr)",
            },
          }}
        >
          {A.map(accountTabs, (tab, index) => (
            <AccountTab
              key={`${tab.value}-${index}`}
              value={tab.value}
              icon={<Iconify icon={tab.icon} sx={{ fontSize: 24, color: "primary.dark", flexShrink: 0 }} />}
              label={
                <Typography
                  noWrap
                  fontWeight={700}
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    flexGrow: 1,
                    textAlign: "left",
                  }}
                >
                  {tab.label}
                </Typography>
              }
              onClick={() => {
                if (downMd) {
                  setShowTabList(false);
                }
                window.scrollTo(0, 0);
              }}
              sx={{
                maxWidth: "none",
                "&:hover": { bgcolor: "background.elevation3" },
              }}
            />
          ))}
        </TabList>
      </Stack>
    </Stack>
  );
};
