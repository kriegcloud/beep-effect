"use client";

import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import type { ReactNode } from "react";

type Props = {
  readonly children: ReactNode;
  readonly fallback?: undefined | ReactNode;
  readonly suspense?: undefined | boolean;
};

export const ClientOnly = ({ children, fallback = null }: Props) => {
  const mounted = useMounted();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
