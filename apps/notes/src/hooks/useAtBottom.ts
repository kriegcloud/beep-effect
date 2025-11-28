import type { RefObject } from "react";
import * as React from "react";

export const useAtBottom = (targetRef: RefObject<HTMLElement | null>, offset = 150) => {
  const [isAtBottom, setIsAtBottom] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (targetRef.current) {
        const { clientHeight, scrollHeight, scrollTop } = targetRef.current;
        const isAtBottom = Math.ceil(scrollTop) + clientHeight >= scrollHeight - offset;
        setIsAtBottom(isAtBottom);
      }
    };

    const scrollableElement = targetRef.current;

    if (scrollableElement) {
      scrollableElement.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      // Perform an initial check in case the element is already scrolled to the bottom
      handleScroll();
    }

    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [offset, targetRef]);

  return isAtBottom;
};
