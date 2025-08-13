import type { TargetAndTransition, Variants } from "framer-motion";

// ----------------------------------------------------------------------

export const varPath = (props?: TargetAndTransition): Variants => ({
  animate: {
    fillOpacity: [0, 0, 1],
    pathLength: [1, 0.4, 0],
    ...props,
    transition: {
      duration: 2,
      ease: [0.43, 0.13, 0.23, 0.96],
      ...props?.transition,
    },
  },
});
