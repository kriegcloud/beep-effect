import { useEffect } from "react";

export const useSyncValueEffect = (value: boolean, setter: (value: boolean) => void) => {
  useEffect(() => {
    setter(value);
  }, [value, setter]);
};
