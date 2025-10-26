import { serverEnv } from "@beep/core-env/server";
import type { Metadata } from "next";
import { TmpView } from "@/app/dashboard/user/account/_tmp";

export const metadata: Metadata = {
  title: `Account general settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return <TmpView />;
}
