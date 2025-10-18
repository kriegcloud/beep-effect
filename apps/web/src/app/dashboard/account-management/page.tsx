import { serverEnv } from "@beep/core-env/server";
import { PrivacyProtectionTabPanel } from "@beep/iam-ui/account-management/components/privacy-protection/PrivacyProtectionTabPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Account Management - ${serverEnv.app.name}` };
export default function AccountManagementPage() {
  return <PrivacyProtectionTabPanel />;
}
