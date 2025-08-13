import type { Transition, Variants } from "framer-motion";

import { transitionEnter, transitionExit } from "./transition";

// ----------------------------------------------------------------------

type Direction =
  | "in"
  | "inUp"
  | "inDown"
  | "inLeft"
  | "inRight"
  | "out"
  | "outUp"
  | "outDown"
  | "outLeft"
  | "outRight";

type Options = {
  distance?: number;
  transition?: Transition;
};

export const varBounce = (
  direction: Direction,
  options?: Options,
): Variants => {
  const distance = options?.distance || 720;

  const variants: Record<Direction, Variants> = {
    /**** In ****/
    in: {
      initial: {},
      animate: {
        scale: [0.3, 1.1, 0.9, 1.03, 0.97, 1],
        opacity: [0, 1, 1, 1, 1, 1],
        transition: transitionEnter(options?.transition),
      },
    },
    inUp: {
      initial: {},
      animate: {
        y: [distance, -24, 12, -4, 0],
        scaleY: [4, 0.9, 0.95, 0.985, 1],
        opacity: [0, 1, 1, 1, 1],
        transition: { ...transitionEnter(options?.transition) },
      },
    },
    inDown: {
      initial: {},
      animate: {
        y: [-distance, 24, -12, 4, 0],
        scaleY: [4, 0.9, 0.95, 0.985, 1],
        opacity: [0, 1, 1, 1, 1],
        transition: transitionEnter(options?.transition),
      },
    },
    inLeft: {
      initial: {},
      animate: {
        x: [-distance, 24, -12, 4, 0],
        scaleX: [3, 1, 0.98, 0.995, 1],
        opacity: [0, 1, 1, 1, 1],
        transition: transitionEnter(options?.transition),
      },
    },
    inRight: {
      initial: {},
      animate: {
        x: [distance, -24, 12, -4, 0],
        scaleX: [3, 1, 0.98, 0.995, 1],
        opacity: [0, 1, 1, 1, 1],
        transition: transitionEnter(options?.transition),
      },
    },
    /**** Out ****/
    out: {
      animate: {
        scale: [0.9, 1.1, 0.3],
        opacity: [1, 1, 0],
        transition: transitionExit(options?.transition),
      },
    },
    outUp: {
      animate: {
        y: [-12, 24, -distance],
        scaleY: [0.985, 0.9, 3],
        opacity: [1, 1, 0],
        transition: transitionExit(options?.transition),
      },
    },
    outDown: {
      animate: {
        y: [12, -24, distance],
        scaleY: [0.985, 0.9, 3],
        opacity: [1, 1, 0],
        transition: transitionExit(options?.transition),
      },
    },
    outLeft: {
      animate: {
        x: [0, 24, -distance],
        scaleX: [1, 0.9, 2],
        opacity: [1, 1, 0],
        transition: transitionExit(options?.transition),
      },
    },
    outRight: {
      animate: {
        x: [0, -24, distance],
        scaleX: [1, 0.9, 2],
        opacity: [1, 1, 0],
        transition: transitionExit(options?.transition),
      },
    },
  };

  return variants[direction];
};
