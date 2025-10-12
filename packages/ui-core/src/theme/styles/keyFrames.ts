const keyFrames = () => ({
  "@keyframes linearLeftToRight": {
    "0%": {
      backgroundPosition: "left 100%",
    },
    "100%": {
      backgroundPosition: "right 100%",
    },
  },
  "@keyframes spin": {
    to: { transform: "rotate(360deg)" },
  },
  "@keyframes dash": {
    "0%, 100%": {
      strokeDasharray: "0 180",
    },
    "50%": {
      strokeDasharray: "80 120",
    },
  },
});

export default keyFrames;
