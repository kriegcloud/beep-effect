import { env } from "@beep/notes/env";

const pre = env.NEXT_PUBLIC_STORAGE_PREFIX;

export const images = {
  banner: `${pre}/banner.png`,
  logo: `${pre}/logo.png`,
  og: `${pre}/og.png`,
};
