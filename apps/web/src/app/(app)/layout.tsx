import { auth } from "@beep/web/lib/auth/server";
import { RegistryProvider } from "@effect/atom-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type React from "react";
export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect("/sign-in");
  }
  return <RegistryProvider>{children}</RegistryProvider>;
}
