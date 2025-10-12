import type { UnsafeTypes } from "@beep/types";

export default {
  lineClamp: {
    style: (props: Record<string, UnsafeTypes.UnsafeAny>) => {
      const lineClamp = props.lineClamp ?? 1;
      return {
        display: "-webkit-box",
        WebkitLineClamp: String(lineClamp),
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      };
    },
  },
};
