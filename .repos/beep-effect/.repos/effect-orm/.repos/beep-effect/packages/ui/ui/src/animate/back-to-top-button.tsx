import { Iconify } from "@beep/ui/atoms/iconify";
import { useBackToTop } from "@beep/ui/hooks";
import type { FabProps } from "@mui/material/Fab";
import Fab from "@mui/material/Fab";
import type React from "react";
import { cloneElement } from "react";

type BackToTopProps = FabProps & {
  isDebounce?: boolean;
  scrollThreshold?: string | number;
  renderButton?: (isVisible?: boolean) => React.ReactElement;
};

export function BackToTopButton({ sx, isDebounce, renderButton, scrollThreshold = "90%", ...other }: BackToTopProps) {
  const { onBackToTop, isVisible } = useBackToTop(scrollThreshold, isDebounce);

  if (renderButton) {
    return cloneElement(renderButton(isVisible) as React.ReactElement<{ onClick?: undefined | (() => void) }>, {
      onClick: onBackToTop,
    });
  }

  return (
    <Fab
      aria-label="Back to top"
      onClick={onBackToTop}
      sx={[
        (theme) => ({
          width: 48,
          height: 48,
          position: "fixed",
          transform: "scale(0)",
          right: { xs: 24, md: 32 },
          bottom: { xs: 24, md: 32 },
          zIndex: theme.zIndex.speedDial,
          transition: theme.transitions.create(["transform"]),
          ...(isVisible && { transform: "scale(1)" }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Iconify width={24} icon="solar:double-alt-arrow-up-bold-duotone" />
    </Fab>
  );
}
