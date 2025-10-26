import { serverEnv } from "@beep/core-env/server";
import { PasskeysView } from "@beep/iam-ui";
import type { Metadata } from "next";
import { TmpView } from "./_tmp";

export const metadata: Metadata = {
  title: `Account general settings | Dashboard - ${serverEnv.app.name}`,
};

export default function Page() {
  return (
    <>
      <PasskeysView />
      <TmpView />
    </>
  );
}
