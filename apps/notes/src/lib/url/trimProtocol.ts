export const trimProtocol = (url: string) => {
  url = url.replace(/^https?:\/\//, "");

  return url.startsWith("www.") ? url.slice(4) : url;
};
