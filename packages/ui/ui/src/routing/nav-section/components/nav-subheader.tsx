import { mergeClasses } from "@beep/ui-core/utils";
import type { ListSubheaderProps } from "@mui/material/ListSubheader";
import ListSubheader from "@mui/material/ListSubheader";
import { styled } from "@mui/material/styles";
import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { navSectionClasses } from "../styles";

const subheaderIconClass = "nav-subheader__icon";

export type NavSubheaderProps = ListSubheaderProps & { open?: boolean | undefined };

export const NavSubheader = styled(({ open, children, className, ...other }: NavSubheaderProps) => (
  <ListSubheader
    disableSticky
    component="div"
    {...other}
    className={mergeClasses([navSectionClasses.subheader, className])}
  >
    <span className={subheaderIconClass}>
      {open ? <CaretDownIcon size={16} weight="fill" /> : <CaretRightIcon size={16} weight="fill" />}
    </span>
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
  [`& .${subheaderIconClass}`]: {
    left: -4,
    opacity: 0,
    position: "absolute",
    display: "inline-flex",
    transition: theme.transitions.create(["opacity"], {
      duration: theme.transitions.duration.standard,
    }),
  },
  "&:hover": {
    paddingLeft: theme.spacing(2),
    color: "var(--nav-subheader-hover-color)",
    [`& .${subheaderIconClass}`]: { opacity: 1 },
  },
}));
