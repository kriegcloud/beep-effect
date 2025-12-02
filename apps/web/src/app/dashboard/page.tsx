import { serverEnv } from "@beep/core-env/server";
import { PasskeysView } from "@beep/iam-ui";
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
