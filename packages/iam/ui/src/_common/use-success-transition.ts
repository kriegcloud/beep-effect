"use client";
import { client } from "@beep/iam-client/adapters/better-auth/client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function useOnSuccessTransition({ redirectTo: redirectToProp }: { redirectTo: string }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);

  const { refetch: refetchSession } = client.useSession();

  useEffect(() => {
    if (!success || isPending) return;

    startTransition(() => {
      router.push(redirectToProp);
    });
  }, [success, isPending, router.push]);

  const onSuccess = useCallback(async () => {
    await refetchSession?.();
    setSuccess(true);
  }, [refetchSession]);

  return { onSuccess, isPending };
}
