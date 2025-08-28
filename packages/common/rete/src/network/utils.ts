import type { Var } from "./types";

export const hashIdAttrs = <T>(idAttrs: (string | number | Var.Type | symbol)[][]): number => {
  let hash = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let chr = 0;
  for (i = 0; i < idAttrs.length; i++) {
    for (j = 0; j < idAttrs[i]!.length; j++) {
      const s = idAttrs[i]![j]!.toString();
      for (k = 0; k < s.length; k++) {
        chr = s.charCodeAt(k);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
      }
    }
  }
  return hash;
};

export const hashIdAttr = <T>(idAttr: (string | number | Var.Type | symbol)[]): number => {
  let hash = 0;
  let i = 0;
  let j = 0;
  let chr = 0;

  for (i = 0; i < idAttr.length; i++) {
    const k = idAttr[i]!.toString();
    for (j = 0; j < k.length; j++) {
      chr = k.charCodeAt(j);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
  }

  return hash;
};
