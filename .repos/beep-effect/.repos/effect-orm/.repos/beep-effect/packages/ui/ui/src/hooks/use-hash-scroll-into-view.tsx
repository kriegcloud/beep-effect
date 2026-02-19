import React from "react";
import { useHash } from "./use-hash";

export const useHashScrollIntoView = (
  scrollOptions: ScrollIntoViewOptions = {
    block: "center",
    behavior: "smooth",
  },
  delay = 100
) => {
  const hash = useHash();

  React.useEffect(() => {
    setTimeout(() => {
      if (hash) {
        const id = hash.replace("#", "");
        const element = document.getElementById(id);

        if (element) {
          element.scrollIntoView(scrollOptions);
        }
      }
    }, delay);
  }, []);
};
