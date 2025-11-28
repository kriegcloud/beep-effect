import * as React from "react";

/**
 * Uses a lock mechanism on the body element to prevent scrolling. This effect
 * modifies the CSS `overflow` property on the body element to 'hidden', and
 * restores it to its original value when the component unmounts.
 */
export const useLockBody = () => {
  React.useLayoutEffect((): (() => void) => {
    const originalStyle: string = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => (document.body.style.overflow = originalStyle);
  }, []);
};
