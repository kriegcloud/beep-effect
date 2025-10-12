const echart = () => ({
  ".echarts-for-react": {
    overflow: "hidden",
    "&:not(&.echart-map)": {
      "> div": {
        "&:first-of-type": {
          height: "100% !important",
        },
      },
    },
  },
});
export default echart;
