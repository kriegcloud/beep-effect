import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";

import { AccountChangePasswordView } from "@/features/account/view";

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Account change password settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <AccountChangePasswordView />;
}
