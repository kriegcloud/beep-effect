import type { Theme } from "@mui/material";

const transitions = ({ transitions }: Theme) => ({
  layout: {
    transition: transitions.create(["width"], {
      duration: transitions.duration.standard,
    }),
  },
});
export default transitions;
