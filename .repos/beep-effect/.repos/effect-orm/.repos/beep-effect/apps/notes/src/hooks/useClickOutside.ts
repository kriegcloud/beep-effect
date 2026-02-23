import type { RefObject } from "react";

import useEventListener from "./useEventListener";

type Handler = (event: MouseEvent) => void;

/**
 * Attaches an event listener to detect clicks that occur outside a given
 * element.
 *
 * @template T - The type of HTMLElement that the ref is referring to.
 * @param {RefObject<T>} ref - A React ref object that points to the element to
 *   listen for clicks outside of.
 * @param {Handler} handler - The callback function to be executed when a click
 *   occurs outside the element.
 * @param {string} [mouseEvent='mousedown'] - The type of mouse event to listen
 *   for (e.g., 'mousedown', 'mouseup'). Default is `'mousedown'`
 */
export const useOnClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
): void => {
  useEventListener(mouseEvent, (event) => {
    const el = ref?.current;

    // Do nothing if clicking ref's element or descendent elements
    if (!el || el.contains(event.target as Node)) {
      return;
    }

    handler(event);
  });
};
