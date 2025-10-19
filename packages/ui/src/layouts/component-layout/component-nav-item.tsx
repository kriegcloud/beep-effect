import type { ListItemButtonProps } from "@mui/material/ListItemButton";
import ListItemButton, { listItemButtonClasses } from "@mui/material/ListItemButton";
import type { SxProps, Theme } from "@mui/material/styles";

// ----------------------------------------------------------------------

export type NavItemProps = ListItemButtonProps & {
  isActive: boolean;
  href?: string;
};

export function NavItem({ children, isActive, sx, ...other }: NavItemProps) {
  const markerStyles: SxProps<Theme> = (theme) => ({
    top: "50%",
    width: "0px",
    content: '""',
    height: "0px",
    opacity: 0.24,
    position: "absolute",
    borderStyle: "solid",
    transform: "translate(-50%, -50%)",
    left: "var(--arrow-offset-left, -8px)",
    borderWidth: "var(--arrow-size, 5px) 0 var(--arrow-size, 5px) var(--arrow-size, 5px)",
    borderColor: `transparent transparent transparent ${theme.vars.palette.text.primary}`,
    zIndex: 9,
    ...(theme.direction === "rtl" && {
      transform: "translate(-50%, -50%) scaleX(-1)",
    }),
  });

  return (
    <ListItemButton
      disableGutters
      disableRipple
      disableTouchRipple
      sx={[
        (theme) => ({
          ...theme.typography.body2,
          p: 0,
          position: "relative",
          color: "text.secondary",
          fontSize: theme.typography.pxToRem(13),
          "&:hover": {
            color: "text.primary",
            bgcolor: "transparent",
          },
          [`&.${listItemButtonClasses.focusVisible}`]: {
            bgcolor: "transparent",
          },
          ...(isActive && {
            color: "text.primary",
            fontWeight: "fontWeightSemiBold",
            "&::before": markerStyles(theme),
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </ListItemButton>
  );
}
