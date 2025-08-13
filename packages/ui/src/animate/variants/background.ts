import type { TargetAndTransition, Transition, Variants } from "framer-motion";

// ----------------------------------------------------------------------

type Direction = "top" | "bottom" | "left" | "right";

export const varBgColor = (
  colors: string[],
  options?: TargetAndTransition,
): Variants => ({
  animate: {
    background: colors,
    ...options,
    transition: {
      duration: 5,
      ease: "linear",
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ...options?.transition,
    },
  },
});

// ----------------------------------------------------------------------

export const varBgKenburns = (
  direction: Direction,
  options?: TargetAndTransition,
): Variants => {
  const transition: Transition = {
    duration: 5,
    ease: "easeOut",
    ...options?.transition,
  };

  const variants: Record<Direction, Variants> = {
    top: {
      animate: {
        scale: [1, 1.25],
        y: [0, -15],
        transformOrigin: ["50% 16%", "50% top"],
        ...options,
        transition,
      },
    },
    bottom: {
      animate: {
        scale: [1, 1.25],
        y: [0, 15],
        transformOrigin: ["50% 84%", "50% bottom"],
        ...options,
        transition,
      },
    },
    left: {
      animate: {
        scale: [1, 1.25],
        x: [0, 20],
        y: [0, 15],
        transformOrigin: ["16% 50%", "0% left"],
        ...options,
        transition,
      },
    },
    right: {
      animate: {
        scale: [1, 1.25],
        x: [0, -20],
        y: [0, -15],
        transformOrigin: ["84% 50%", "0% right"],
        ...options,
        transition,
      },
    },
  };

  return variants[direction];
};

// ----------------------------------------------------------------------

export const varBgPan = (
  direction: Direction,
  colors: string[],
  options?: TargetAndTransition,
): Variants => {
  const gradient = (deg: number) =>
    `linear-gradient(${deg}deg, ${colors.join(", ")})`;

  const transition: Transition = {
    duration: 5,
    ease: "linear",
    repeat: Number.POSITIVE_INFINITY,
    repeatType: "reverse",
    ...options?.transition,
  };

  const variants: Record<Direction, Variants> = {
    top: {
      animate: {
        backgroundImage: [gradient(0), gradient(0)],
        backgroundPosition: ["center 99%", "center 1%"],
        backgroundSize: ["100% 600%", "100% 600%"],
        ...options,
        transition,
      },
    },
    right: {
      animate: {
        backgroundImage: [gradient(270), gradient(270)],
        backgroundPosition: ["1% center", "99% center"],
        backgroundSize: ["600% 100%", "600% 100%"],
        ...options,
        transition,
      },
    },
    bottom: {
      animate: {
        backgroundImage: [gradient(0), gradient(0)],
        backgroundPosition: ["center 1%", "center 99%"],
        backgroundSize: ["100% 600%", "100% 600%"],
        ...options,
        transition,
      },
    },
    left: {
      animate: {
        backgroundPosition: ["99% center", "1% center"],
        backgroundImage: [gradient(270), gradient(270)],
        backgroundSize: ["600% 100%", "600% 100%"],
        ...options,
        transition,
      },
    },
  };

  return variants[direction];
};
