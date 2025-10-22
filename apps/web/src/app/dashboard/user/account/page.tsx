import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountGeneralView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account general settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountGeneralView />;
}
