"use client";
import type { Dispatch, RefObject, SetStateAction } from "react";

import { useCallback, useRef, useState } from "react";

/**
 * Custom hook to manage the state of a popover that opens on hover.
 *
 * @param {RefObject<T | null>} [inputRef] - An optional ref object to use for the popover element.
 *
 * @returns {UsePopoverHoverReturn<T>} - An object containing:
 * - `open`: A boolean indicating whether the popover is open.
 * - `onOpen`: A function to open the popover.
 * - `anchorEl`: The current element that the popover is anchored to.
 * - `onClose`: A function to close the popover.
 * - `elementRef`: A ref object for the popover element.
 * - `setOpen`: A function to manually set the open state of the popover.
 *
 * @example
 * const { open, onOpen, onClose, elementRef } = usePopoverHover<HTMLButtonElement>();
 *
 * return (
 *   <>
 *      <button ref={elementRef} onMouseEnter={onOpen} onMouseLeave={onClose}>
 *        Hover me
 *      </button>
 *
 *      <Popover open={open} anchorEl={anchorEl}>
 *        Popover content
 *      </Popover>
 *   </>
 * );
 */

type UsePopoverHoverReturn<T extends HTMLElement = HTMLElement> = {
  readonly open: boolean;
  readonly anchorEl: T | null;
  readonly onOpen: () => void;
  readonly onClose: () => void;
  readonly elementRef: RefObject<T>;
  readonly setOpen: Dispatch<SetStateAction<boolean>>;
};

export function usePopoverHover<T extends HTMLElement = HTMLElement>(
  inputRef?: RefObject<T | null> | undefined
): UsePopoverHoverReturn<T> {
  const localRef = useRef<T>(null);
  const elementRef = (inputRef || localRef) as RefObject<T>;

  const [open, setOpen] = useState<boolean>(false);

  const onOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    elementRef,
    anchorEl: elementRef.current,
    open,
    onOpen,
    onClose,
    setOpen,
  };
}
