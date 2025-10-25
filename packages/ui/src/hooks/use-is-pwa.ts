"use client";
import * as F from "effect/Function";
import * as O from "effect/Option";

export const useIsPWA = () => {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    F.pipe(
      (window.navigator as { standalone?: boolean | undefined }).standalone,
      O.fromNullable,
      O.getOrElse(() => false)
    ) ||
    window.matchMedia("(display-mode: standalone)").matches ||
    false
  );
};
