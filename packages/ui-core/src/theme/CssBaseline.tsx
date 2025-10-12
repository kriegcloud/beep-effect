import colorPicker from "@beep/ui-core/theme/styles/colorPicker";
import echart from "@beep/ui-core/theme/styles/echart";
import emojiMart from "@beep/ui-core/theme/styles/emojiMart";
import keyFrames from "@beep/ui-core/theme/styles/keyFrames";
import notistack from "@beep/ui-core/theme/styles/notistack";
import popper from "@beep/ui-core/theme/styles/popper";
import prism from "@beep/ui-core/theme/styles/prism";
import projectTimelineChart from "@beep/ui-core/theme/styles/projectTimelineChart";
import reactFc from "@beep/ui-core/theme/styles/react-fc";
import reactDatepicker from "@beep/ui-core/theme/styles/reactDatepicker";
import simplebar from "@beep/ui-core/theme/styles/simplebar";
import svelteGanttChart from "@beep/ui-core/theme/styles/svelteGanttChart";
import taskTrackChart from "@beep/ui-core/theme/styles/taskTrackChart";
import yarl from "@beep/ui-core/theme/styles/yarl";
import type { Theme } from "@mui/material";
import type { Components } from "@mui/material/styles";
import vibrantNav from "./styles/vibrantNav";

const CssBaseline: Components<Omit<Theme, "components">>["MuiCssBaseline"] = {
  defaultProps: {},
  styleOverrides: (theme) => ({
    "*": {
      scrollbarWidth: "thin",
    },
    "input:-webkit-autofill": {
      WebkitBoxShadow: `0 0 0px 40rem ${theme.vars.palette.background.elevation2} inset !important`,
      transition: "background-color 5000s ease-in-out 0s",
    },
    "input:-webkit-autofill:hover": {
      WebkitBoxShadow: `0 0 0px 40rem ${theme.vars.palette.background.elevation3} inset !important`,
    },
    body: {
      scrollbarColor: `${theme.vars.palette.background.elevation4} transparent`,
      [`h1, h2, h3, h4, h5, h6, p` as const]: {
        margin: 0,
      },
      fontVariantLigatures: "none",
      [`[id]` as const]: {
        scrollMarginTop: 82,
      },
    },
    ...simplebar(theme),
    ...notistack(theme),
    ...keyFrames(),
    ...prism(),
    ...echart(),
    ...popper(theme),
    ...colorPicker(theme),
    ...reactDatepicker(theme),
    ...vibrantNav(theme),
    ...svelteGanttChart(theme),
    ...projectTimelineChart(theme),
    ...taskTrackChart(theme),
    ...reactFc(theme),
    ...emojiMart(theme),
    ...yarl(theme),
  }),
};

export default CssBaseline;
