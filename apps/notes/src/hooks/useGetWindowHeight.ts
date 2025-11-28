import { useEffect, useState } from "react";

const getWindowHeight = () => {
  const { innerHeight: height } = window;

  return height;
};

/** Retrieves the height of the window. */
export const useGetWindowHeight = () => {
  const [windowDimensions, setWindowDimensions] = useState<number | undefined>();

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions(getWindowHeight());
    };

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
};
