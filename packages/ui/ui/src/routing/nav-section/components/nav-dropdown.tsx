import Popover, { popoverClasses } from "@mui/material/Popover";
import type { CSSObject } from "@mui/material/styles";
import { styled } from "@mui/material/styles";

export const NavDropdownPaper = styled("div")(({ theme }) => ({
  minWidth: 180,
  ...theme.mixins.paperStyles(theme, { dropdown: true }),
}));

export const NavDropdown = styled(Popover)(({ open, theme }) => ({
  pointerEvents: "none",
  [`& .${popoverClasses.paper}`]: {
    boxShadow: "none",
    overflow: "unset",
    backdropFilter: "none",
    background: "transparent",
    padding: theme.spacing(0, 0.75),
    ...(open && { pointerEvents: "auto" }),
  } as CSSObject,
}));
