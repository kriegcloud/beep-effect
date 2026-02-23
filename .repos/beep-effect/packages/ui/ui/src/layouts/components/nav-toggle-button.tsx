import { rgbaFromChannel } from "@beep/ui-core/utils";
import Box from "@mui/material/Box";
import type { IconButtonProps } from "@mui/material/IconButton";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";

export type NavToggleButtonProps = IconButtonProps & {
  readonly isNavMini: boolean;
};

export function NavToggleButton({ isNavMini, sx, ...other }: NavToggleButtonProps) {
  return (
    <IconButton
      size="small"
      sx={[
        (theme: Theme) => ({
          p: 0.5,
          position: "absolute",
          color: "action.active",
          bgcolor: "background.default",
          transform: "translate(-50%, -50%)",
          zIndex: "var(--layout-nav-zIndex)",
          top: "calc(var(--layout-header-desktop-height) / 2)",
          left: isNavMini ? "var(--layout-nav-mini-width)" : "var(--layout-nav-vertical-width)",
          border: `1px solid ${rgbaFromChannel(theme.vars.palette.grey["500Channel"], 0.12)}`,
          transition: theme.transitions.create(["left"], {
            easing: "var(--layout-transition-easing)",
            duration: "var(--layout-transition-duration)",
          }),
          "&:hover": {
            color: "text.primary",
            bgcolor: "background.neutral",
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Box
        component="span"
        sx={(theme: Theme) => ({
          display: "inline-flex",
          ...(theme.direction === "rtl" && { transform: "scaleX(-1)" }),
        })}
      >
        {isNavMini ? <CaretRightIcon size={16} weight="fill" /> : <CaretLeftIcon size={16} weight="fill" />}
      </Box>
    </IconButton>
  );
}
