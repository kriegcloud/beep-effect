import type { Theme } from "@mui/material";

const taskTrackChart = (theme: Theme) => {
  const { vars } = theme;
  return {
    "& .sg-task.development": {
      backgroundColor: vars.palette.chBlue["100Channel"],
    },
    "& .sg-task.design": {
      backgroundColor: vars.palette.chGreen["100Channel"],
    },
    "& .sg-task.research": {
      backgroundColor: vars.palette.chOrange["100Channel"],
    },
    "& .sg-task.testing": {
      backgroundColor: vars.palette.chLightBlue["100Channel"],
    },
    "& .sg-task.support": {
      backgroundColor: vars.palette.chRed["100Channel"],
    },
  };
};

export default taskTrackChart;
