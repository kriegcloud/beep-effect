import { serverEnv } from "@beep/core-env/server";

import type { Metadata } from "next";
import { ViewTemp } from "./_view-temp";

export const metadata: Metadata = { title: `Dashboard - ${serverEnv.app.name}` };
export default function Page() {
  return <ViewTemp />;
}
