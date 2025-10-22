import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountNotificationsView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account notifications settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountNotificationsView />;
}
