import { serverEnv } from "@beep/core-env/server";
import { DashboardContent } from "@beep/ui/layouts/dashboard/content";
import type { Metadata } from "next";

export const metadata: Metadata = { title: `Dashboard - ${serverEnv.app.name}` };
export default function Page() {
  return <DashboardContent sx={{ overflowY: "scroll" }}>beep</DashboardContent>;
}
