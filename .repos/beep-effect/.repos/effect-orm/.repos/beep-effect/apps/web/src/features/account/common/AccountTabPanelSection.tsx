import type { IconifyProps } from "@beep/ui/atoms/iconify";
import { Iconify } from "@beep/ui/atoms/iconify";
import type { SxProps } from "@mui/material";
import { Box, Stack, Typography } from "@mui/material";
import type { PropsWithChildren, ReactElement } from "react";

interface AccountTabPanelSectionProps {
  readonly title: string;
  readonly subtitle?: string | undefined;
  readonly subtitleEl?: ReactElement | undefined;
  readonly icon: IconifyProps["icon"];
  readonly sx?: SxProps | undefined;
  readonly actionComponent?: ReactElement | undefined;
}

export const AccountTabPanelSection = ({
  title,
  subtitle,
  subtitleEl,
  icon,
  children,
  sx,
  actionComponent,
}: PropsWithChildren<AccountTabPanelSectionProps>) => {
  return (
    <Box sx={{ ...(Array.isArray(sx) ? sx : [sx]) }}>
      <Stack sx={[{ mb: 1, justifyContent: "space-between" }, !subtitle && { mb: 3 }]}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Iconify icon={icon} sx={{ fontSize: 24, mb: 0.25 }} />
          {title}
        </Typography>
        {actionComponent}
      </Stack>
      {subtitle && (
        <Typography variant="body2" sx={{ mb: subtitle && 3, color: "text.secondary", textWrap: "pretty" }}>
          {subtitle}
        </Typography>
      )}
      {subtitleEl}
      {children}
    </Box>
  );
};
