import { mergeClasses } from "@beep/ui-core/utils";
import type { ListSubheaderProps } from "@mui/material/ListSubheader";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import { Iconify, iconifyClasses } from "../../../atoms";
import { navSectionClasses } from "../styles";

export type NavSubheaderProps = ListSubheaderProps & { open?: boolean };

export const NavSubheader = styled(({ open, children, className, ...other }: NavSubheaderProps) => (
  <ListSubheader
    disableSticky
    component="div"
    {...other}
    className={mergeClasses([navSectionClasses.subheader, className])}
  >
    <Iconify width={16} icon={open ? "eva:arrow-ios-downward-fill" : "eva:arrow-ios-forward-fill"} />
    {children}
  </ListSubheader>
))(({ theme }) => ({
  ...theme.typography.overline,
  cursor: "pointer",
  alignItems: "center",
  position: "relative",
  gap: theme.spacing(1),
  display: "inline-flex",
  alignSelf: "flex-start",
  color: "var(--nav-subheader-color)",
  padding: theme.spacing(2, 1, 1, 1.5),
  fontSize: theme.typography.pxToRem(11),
  transition: theme.transitions.create(["color", "padding-left"], {
    duration: theme.transitions.duration.standard,
  }),
  [`& .${iconifyClasses.root}`]: {
    left: -4,
    opacity: 0,
    position: "absolute",
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.standard,
    }),
  },
  "&:hover": {
    paddingLeft: theme.spacing(2),
    color: "var(--nav-subheader-hover-color)",
    [`& .${iconifyClasses.root}`]: { opacity: 1 },
  },
}));
