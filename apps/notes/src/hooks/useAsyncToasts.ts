import type { UnsafeTypes } from "@beep/types";
import { useRef } from "react";

import { type ExternalToast, toast } from "sonner";

export type UseNetworkToastOptions = {
  data?: undefined | ExternalToast;
  error?: undefined | React.ReactNode;
  errorData?: undefined | ExternalToast;
  loading?: undefined | React.ReactNode;
  loadingData?: undefined | ExternalToast;
  success?: undefined | React.ReactNode;
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
    onError: ({ message }: { message?: undefined | string } = {}) => {
      const messageStr = message ? ` ${message}` : "";

      toast.error(`${error as UnsafeTypes.UnsafeAny}.${messageStr}`.trim(), {
        id: toastIdRef.current!,
        duration: 2000,
        ...dataHook,
        ...errorData,
      });
    },
    onMutate: () => {
      toastIdRef.current = toast.loading(loading as UnsafeTypes.UnsafeAny, {
        id: toastIdRef.current!,
        duration: 10_000,
        ...dataHook,
        ...loadingData,
      });
    },
    onSuccess: (
      // successData?: undefined |  {
      //   message?: undefined |  React.ReactNode;
      // } & ExternalToast
      successData?: undefined | UnsafeTypes.UnsafeAny
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
