"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { useTRPC } from "@beep/notes/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUser = () => {
  const session = useSession();
  const { data, ...rest } = useQuery({
    ...useTRPC().layout.app.queryOptions(),
    enabled: !!session,
  });

  return { ...data?.currentUser, ...rest };
};
