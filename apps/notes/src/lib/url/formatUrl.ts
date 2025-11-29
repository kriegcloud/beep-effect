import { hasSpecialProtocol } from "./hasSpecialProtocol";
import { trimProtocol } from "./trimProtocol";

export type FormatUrlOptions = {
  readonly noPath?: undefined | boolean;
  readonly noProtocol?: undefined | boolean;
};

// Formats a URL to include the protocol if it doesn't already
export const formatUrl = (url: string, { noPath, noProtocol }: FormatUrlOptions = {}) => {
  if (noPath) {
    const trimmedUrl = trimProtocol(url);
    url = trimmedUrl.split("/")[0] || trimmedUrl;
  }
  if (noProtocol) {
    url = trimProtocol(url);
  } else {
    if (!/https?:\/\//.test(url) && !hasSpecialProtocol(url)) {
      url = `https://${url}`;
    }
  }

  return url.trim();
};
