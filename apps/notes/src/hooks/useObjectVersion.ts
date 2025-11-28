import { useRef } from "react";

export const useObjectVersion = (obj: unknown): number => {
  const versionRef = useRef(0);
  const prevObjRef = useRef(obj);

  if (prevObjRef.current !== obj) {
    versionRef.current++;
    prevObjRef.current = obj;
  }

  return versionRef.current;
};
