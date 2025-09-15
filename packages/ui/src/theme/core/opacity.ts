import type { Opacity } from "@mui/material/styles";

export type OpacityExtend = {
  filled: {
    commonHoverBg: number;
  };
  outlined: {
    border: number;
  };
  soft: {
    bg: number;
    hoverBg: number;
    commonBg: number;
    commonHoverBg: number;
    border: number;
  };
};

export const opacity: Partial<Opacity> & OpacityExtend = {
  // system
  switchTrack: 1,
  switchTrackDisabled: 0.48,
  inputPlaceholder: 1,
  inputUnderline: 0.32,
  // shape
  filled: {
    commonHoverBg: 0.72,
  },
  outlined: {
    border: 0.48,
  },
  soft: {
    bg: 0.16,
    hoverBg: 0.32,
    commonBg: 0.08,
    commonHoverBg: 0.16,
    border: 0.24,
  },
};
