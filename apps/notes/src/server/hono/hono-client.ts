import { env } from "@beep/notes/env";
import { hc } from "hono/client";

import type { AppType } from "./types";

export const honoApi = hc<AppType>(env.NEXT_PUBLIC_SITE_URL).api;
