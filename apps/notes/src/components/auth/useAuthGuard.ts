import { useAuthUser } from "@beep/notes/components/auth/useAuthUser";
import { pushModal } from "@beep/notes/components/modals";
import { useIsIframe } from "@beep/notes/lib/navigation/useQueryState";
import { useCallback } from "react";

export const useAuthGuard = () => {
  const user = useAuthUser();

  const isIframe = useIsIframe();

  return useCallback(
    (callback?: () => Promise<void> | void) => {
      if (!user?.id) {
        if (isIframe) {
          window.open("https://app.todox.com/login", "_blank");

          return true;
        }
        pushModal("Login");

        return true;
      }

      return callback ? void callback() : false;
    },
    [isIframe, user?.id]
  );
};
