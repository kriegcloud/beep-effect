import { serverEnv } from "@beep/core-env/server";
import { AccountManagementView } from "@beep/iam-ui/account-management";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Account Management - ${serverEnv.app.name}` };
export default function AccountManagementPage() {
  return <AccountManagementView />;
}
