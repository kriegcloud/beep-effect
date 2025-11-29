import { isURL } from "validator";

import { formatUrl } from "./formatUrl";
import { hasSpecialProtocol } from "./hasSpecialProtocol";
import { tlds } from "./tlds";

export const isUrl = (url: string) => {
  url = formatUrl(url);

  if (!isURL(url)) return false;
  if (hasSpecialProtocol(url)) {
    return true;
  }

  try {
    const parsedUrl = new URL(url);

    const lastDotIndex = parsedUrl.hostname.lastIndexOf(".");

    if (lastDotIndex !== -1 && lastDotIndex < parsedUrl.hostname.length - 1) {
      const firstLetter = parsedUrl.hostname[lastDotIndex + 1] as keyof typeof tlds;

      if (firstLetter && tlds[firstLetter]) {
        return tlds[firstLetter].some((tld: string) => parsedUrl.hostname.endsWith(tld));
      }
    }

    return false;
  } catch {
    return false;
  }
};
