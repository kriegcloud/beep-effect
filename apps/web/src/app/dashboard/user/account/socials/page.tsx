import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountSocialsView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account socials settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountSocialsView />;
}
