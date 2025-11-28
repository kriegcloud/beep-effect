import { env } from "@beep/notes/env";

import { notFound, redirect } from "next/navigation";
import type * as React from "react";

import { auth, isNotAuth } from "./auth";

export const authRedirect = async ({
  pathname,
  searchParams,
}: {
  pathname?: string;
  searchParams?: Record<string, string>;
}) => {
  if (await isNotAuth()) {
    let callbackUrl = "/login";

    if (pathname) {
      if (searchParams) {
        const params = new URLSearchParams(searchParams);
        callbackUrl += `?callbackUrl=${encodeURIComponent(pathname + params.toString())}`;
      } else {
        callbackUrl += `?callbackUrl=${pathname}`;
      }
    }

    redirect(callbackUrl);
  }
};

export async function AuthRedirect({
  children,
  pathname,
  searchParams,
}: {
  children: React.ReactNode;
  pathname?: string;
  searchParams?: Record<string, string>;
}) {
  await authRedirect({ pathname, searchParams });

  return <>{children}</>;
}

export async function AdminGuard({
  children,
  pathname,
  searchParams,
}: {
  children: React.ReactNode;
  pathname?: string;
  searchParams?: Record<string, string>;
}) {
  await authRedirect({ pathname, searchParams });

  const { user } = await auth();

  if (env.NODE_ENV === "production" && !user?.isSuperAdmin) {
    return notFound();
  }

  return <>{children}</>;
}
