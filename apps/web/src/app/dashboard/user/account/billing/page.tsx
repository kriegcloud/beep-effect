import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountBillingView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account billing settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountBillingView />;
}
