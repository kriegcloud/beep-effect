import { env } from "@beep/notes/env";

import { type FormatUrlOptions, formatUrl } from "./formatUrl";

export const getSiteUrl = (options?: FormatUrlOptions) => {
  return formatUrl(env.NEXT_PUBLIC_SITE_URL!, options);
};
