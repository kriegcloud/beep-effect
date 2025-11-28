"use client";

import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  suspense?: boolean;
};

export const ClientOnly = ({ children, fallback = null }: Props) => {
  const mounted = useMounted();

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
