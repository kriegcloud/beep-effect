import { useAuthValue } from "@beep/notes/components/auth/auth-provider-client";

export const useAuthUser = () => {
  return useAuthValue("user");
};
