import type { IconifyProps } from "@beep/ui/atoms";
import { Iconify } from "@beep/ui/atoms";
import { TabPanel } from "@mui/lab";
import { IconButton, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactElement } from "react";

interface AccountTabPanelProps {
  readonly label: string;
  readonly title: string;
  readonly value: string;
  readonly panelIcon: IconifyProps["icon"];
  readonly setShowTabList: (value: boolean) => void;
}

export const AccountTabPanel = ({
  title,
  value,
  panelIcon,
  setShowTabList,
  children,
}: PropsWithChildren<AccountTabPanelProps>): ReactElement => {
  return (
    <TabPanel value={value} sx={{ p: 0 }}>
      <Stack sx={{ gap: 1, alignItems: "center", mb: 5 }}>
        <IconButton onClick={() => setShowTabList(true)} sx={{ display: { md: "none" }, ml: -1.5 }}>
          <Iconify icon="material-symbols:chevron-left-rounded" sx={{ color: "neutral.main", fontSize: 20 }} />
        </IconButton>

        <Typography
          variant="h4"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: {
              xs: "h6.fontSize",
              lg: "h4.fontSize",
            },
          }}
        >
          <Iconify icon={panelIcon} sx={{ fontSize: 32, display: { xs: "none", md: "inline" } }} />
          {title}
        </Typography>
      </Stack>
      {children}
    </TabPanel>
  );
};
