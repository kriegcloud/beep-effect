import {
  buttonClasses,
  dividerClasses,
  drawerClasses,
  iconButtonClasses,
  listItemButtonClasses,
  listItemIconClasses,
  listItemTextClasses,
  listSubheaderClasses,
  paperClasses,
  type Theme,
  toolbarClasses,
} from "@mui/material";
import type { SystemStyleObject } from "@mui/system";

const vibrantNav = (_theme: Theme) => ({
  "& .nav-vibrant": {
    display: "flex",
    zIndex: 1,
    position: "relative",
  },
});

export const sidenavVibrantStyle: SystemStyleObject<Theme> = {
  [`& .${drawerClasses.paper}`]: {
    bgcolor: "transparent",
    border: 0,
    [`& .${listSubheaderClasses.root}`]: {
      color: "vibrant.text.disabled",
    },
    [`& .${listItemButtonClasses.root}`]: {
      color: "vibrant.text.secondary",
      [`& .${listItemIconClasses.root}`]: {
        color: "vibrant.text.secondary",
      },
      "& .expand-icon": {
        color: "vibrant.text.secondary",
      },
      "&:hover": {
        bgcolor: "vibrant.listItemHover",
      },
      [`&.${listItemButtonClasses.selected}`]: {
        bgcolor: "vibrant.listItemHover",
        color: "primary.main",
        [`& .${listItemTextClasses.primary}`]: {
          color: "primary.dark",
        },
        [`& .${listItemIconClasses.root}`]: {
          color: "primary.main",
        },
        "& .expand-icon": {
          color: "primary.main",
        },
      },
    },
    [`& .${iconButtonClasses.root}`]: {
      color: "text.secondary",
      "&:hover": {
        bgcolor: "vibrant.listItemHover",
      },
      "&.active": {
        color: "primary.main",
        bgcolor: "vibrant.listItemHover",
      },
    },
  },
  "&.slim-sidenav": {
    [`& .${dividerClasses.root}`]: {
      borderColor: "transparent",
    },
  },
  "&.stacked-sidenav": {
    [`& .${listItemButtonClasses.root}`]: {
      color: "text.primary",
    },
  },
};

export const topnavVibrantStyle: SystemStyleObject<Theme> = {
  borderColor: "transparent",
  [`&.${paperClasses.root}`]: {
    bgcolor: "transparent",
    [`& .${toolbarClasses.root}`]: {
      bgcolor: "transparent",
      "& .search-box-button, & .search-box-input": {
        bgcolor: ({ palette }) => `${palette.vibrant.listItemHover} !important`,
        "&:hover": {
          bgcolor: ({ palette }) => `${palette.vibrant.buttonHover} !important`,
        },
      },
    },
    "& .appbar-drawer-button": {
      bgcolor: "transparent",
      "&:hover": {
        bgcolor: "vibrant.buttonHover",
      },
    },
    [`& .${buttonClasses.root}`]: {
      bgcolor: "transparent",
      color: "text.primary",
      "&.active, &:hover": {
        bgcolor: "vibrant.buttonHover",
      },
    },
    "& .nav-items": {
      [`& .${buttonClasses.root}`]: {
        "&.active, &:hover": {
          bgcolor: "vibrant.listItemHover",
        },
      },
    },
    "& .action-items": {
      [`& .${buttonClasses.root}`]: {
        "&.active, &:hover": {
          bgcolor: "vibrant.buttonHover",
        },
      },
    },
  },
};

export default vibrantNav;
