import { PasskeysView } from "@beep/iam-ui";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import { DashboardContent } from "@beep/ui/layouts/dashboard/content";
import type { Metadata } from "next";

export const generateMetadata = (): Metadata => ({ title: `Dashboard - ${serverEnv.app.name}` });
export default function Page() {
  return (
    <DashboardContent sx={{ overflowY: "scroll" }}>
      <PasskeysView />
    </DashboardContent>
  );
}
