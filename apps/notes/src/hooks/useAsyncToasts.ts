import { useRef } from "react";

import { type ExternalToast, toast } from "sonner";

export type UseNetworkToastOptions = {
  data?: ExternalToast;
  error?: React.ReactNode;
  errorData?: ExternalToast;
  loading?: React.ReactNode;
  loadingData?: ExternalToast;
  success?: React.ReactNode;
};

export const useAsyncToasts = ({
  data: dataHook,
  error = "Error",
  errorData,
  loading = "Loading...",
  loadingData,
  success = "Success!",
}: UseNetworkToastOptions = {}) => {
  const toastIdRef = useRef<number | string | null>(null);

  return {
    dismiss: () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
    },
    onError: ({ message }: { message?: string } = {}) => {
      const messageStr = message ? ` ${message}` : "";

      toast.error(`${error as any}.${messageStr}`.trim(), {
        id: toastIdRef.current!,
        duration: 2000,
        ...dataHook,
        ...errorData,
      });
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(loading as any, {
        id: toastIdRef.current!,
        duration: 10_000,
        ...dataHook,
        ...loadingData,
      });
    },
    onSuccess: (
      // successData?: {
      //   message?: React.ReactNode;
      // } & ExternalToast
      successData?: any
    ) => {
      toast.success(successData?.message ?? success, {
        id: toastIdRef.current!,
        duration: 3000,
        ...dataHook,
        ...successData,
      });
    },
  };
};
