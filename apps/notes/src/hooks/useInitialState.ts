import { useState } from "react";

export const useInitialState = <T>(value: T) => {
  const [initialValue] = useState<T>(value);

  return initialValue;
};

export const useUpdatedState = <T>(value: T) => {
  const initial = useInitialState<T>(value);

  return initial !== value;
};
