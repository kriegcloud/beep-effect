import { env } from "@beep/notes/env";

import { notFound, redirect } from "next/navigation";
import type * as React from "react";

import { auth, isNotAuth } from "./auth";

export const authRedirect = async ({
  pathname,
  searchParams,
}: {
  readonly pathname?: undefined | string;
  readonly searchParams?: undefined | Record<string, string>;
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
  readonly children: React.ReactNode;
  readonly pathname?: undefined | string;
  readonly searchParams?: Record<string, string>;
}) {
  const redirectParams: { pathname?: string; searchParams?: Record<string, string> } = {};
  if (pathname !== undefined) redirectParams.pathname = pathname;
  if (searchParams !== undefined) redirectParams.searchParams = searchParams;
  await authRedirect(redirectParams);

  return <>{children}</>;
}

export async function AdminGuard({
  children,
  pathname,
  searchParams,
}: {
  readonly children: React.ReactNode;
  readonly pathname?: string;
  readonly searchParams?: Record<string, string>;
}) {
  const redirectParams: { pathname?: string; searchParams?: Record<string, string> } = {};
  if (pathname !== undefined) redirectParams.pathname = pathname;
  if (searchParams !== undefined) redirectParams.searchParams = searchParams;
  await authRedirect(redirectParams);

  const { user } = await auth();

  if (env.NODE_ENV === "production" && !user?.isSuperAdmin) {
    return notFound();
  }

  return <>{children}</>;
}
