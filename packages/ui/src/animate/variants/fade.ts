import type { Transition, Variants } from "framer-motion";

import { transitionEnter, transitionExit } from "./transition";

type Direction = "in" | "inUp" | "inDown" | "inLeft" | "inRight" | "out" | "outUp" | "outDown" | "outLeft" | "outRight";

type Options = {
  distance?: number;
  transitionIn?: Transition;
  transitionOut?: Transition;
};

export const varFade = (direction: Direction, options?: Options): Variants => {
  const distance = options?.distance || 120;
  const transitionIn = options?.transitionIn;
  const transitionOut = options?.transitionOut;

  const variants: Record<Direction, Variants> = {
    /**** In ****/
    in: {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: transitionEnter() },
      exit: { opacity: 0, transition: transitionExit() },
    },
    inUp: {
      initial: { y: distance, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: transitionEnter(transitionIn) },
      exit: {
        y: distance,
        opacity: 0,
        transition: transitionExit(transitionOut),
      },
    },
    inDown: {
      initial: { y: -distance, opacity: 0 },
      animate: { y: 0, opacity: 1, transition: transitionEnter(transitionIn) },
      exit: {
        y: -distance,
        opacity: 0,
        transition: transitionExit(transitionOut),
      },
    },
    inLeft: {
      initial: { x: -distance, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: transitionEnter(transitionIn) },
      exit: {
        x: -distance,
        opacity: 0,
        transition: transitionExit(transitionOut),
      },
    },
    inRight: {
      initial: { x: distance, opacity: 0 },
      animate: { x: 0, opacity: 1, transition: transitionEnter(transitionIn) },
      exit: {
        x: distance,
        opacity: 0,
        transition: transitionExit(transitionOut),
      },
    },
    /**** Out ****/
    out: {
      initial: { opacity: 1 },
      animate: { opacity: 0, transition: transitionEnter(transitionIn) },
      exit: { opacity: 1, transition: transitionExit(transitionOut) },
    },
    outUp: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: -distance,
        opacity: 0,
        transition: transitionEnter(transitionIn),
      },
      exit: { y: 0, opacity: 1, transition: transitionExit(transitionOut) },
    },
    outDown: {
      initial: { y: 0, opacity: 1 },
      animate: {
        y: distance,
        opacity: 0,
        transition: transitionEnter(transitionIn),
      },
      exit: { y: 0, opacity: 1, transition: transitionExit(transitionOut) },
    },
    outLeft: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: -distance,
        opacity: 0,
        transition: transitionEnter(transitionIn),
      },
      exit: { x: 0, opacity: 1, transition: transitionExit(transitionOut) },
    },
    outRight: {
      initial: { x: 0, opacity: 1 },
      animate: {
        x: distance,
        opacity: 0,
        transition: transitionEnter(transitionIn),
      },
      exit: { x: 0, opacity: 1, transition: transitionExit(transitionOut) },
    },
  };

  return variants[direction];
};
