export const getTitleUrlId = (url: string): string => {
  return url.slice(Math.max(0, url.length - 15));
};
