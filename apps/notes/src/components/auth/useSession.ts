import { useAuthValue } from "@beep/notes/components/auth/auth-provider-client";

export function useSession() {
  return useAuthValue("session");
}
