import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountSecurityView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account Security | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountSecurityView />;
}
