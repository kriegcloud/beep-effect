export const cssVarRgba = (color: string, alpha: number) => {
  return `rgba(${color} / ${alpha})` as const;
};
