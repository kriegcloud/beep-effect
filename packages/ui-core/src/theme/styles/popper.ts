import type { Theme } from "@mui/material";

const popper = ({ vars }: Theme) => ({
  ".base-Popper-root": {
    '&[data-popper-placement*="bottom"] .arrow': {
      top: 0,
      left: 0,
      marginTop: "-0.9em",
      width: "3em",
      height: "1em",
      "&::before": {
        borderWidth: "0 1em 1em 1em",
        borderColor: `transparent transparent ${vars.palette.background.paper} transparent`,
      },
    },
    '&[data-popper-placement*="top"] .arrow': {
      bottom: 0,
      left: 0,
      marginBottom: "-0.9em",
      width: "3em",
      height: "1em",
      "&::before": {
        borderWidth: "1em 1em 0 1em",
        borderColor: `${vars.palette.background.paper} transparent transparent transparent`,
      },
    },
    '&[data-popper-placement*="right"] .arrow': {
      left: 0,
      marginLeft: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 1em 1em 0",
        borderColor: `transparent ${vars.palette.background.paper} transparent transparent`,
      },
    },
    '&[data-popper-placement*="left"] .arrow': {
      right: 0,
      marginRight: "-0.9em",
      height: "3em",
      width: "1em",
      "&::before": {
        borderWidth: "1em 0 1em 1em",
        borderColor: `transparent transparent transparent ${vars.palette.background.paper}`,
      },
    },
    ".arrow": {
      position: "absolute",
      fontSize: 10,
      width: "3em",
      height: "3em",
      "&::before": {
        content: '""',
        margin: "auto",
        display: "block",
        width: 0,
        height: 0,
        borderStyle: "solid",
      },
    },
  },
});
export default popper;
