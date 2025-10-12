import "simplebar-react/dist/simplebar.min.css";
import type { Theme } from "@mui/material";

const simplebar = ({ vars }: Theme) => ({
  "& .simplebar-track": {
    "&.simplebar-vertical, &.simplebar-horizontal": {
      "& .simplebar-scrollbar": {
        "&:before": {
          backgroundColor: vars.palette.background.elevation4,
        },
        "&.simplebar-visible": {
          "&:before": {
            opacity: 1,
          },
        },
      },
    },
  },
});
export default simplebar;
