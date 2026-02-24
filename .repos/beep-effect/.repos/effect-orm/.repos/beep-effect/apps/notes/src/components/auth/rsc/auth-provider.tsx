import { AuthProviderClient } from "@beep/notes/components/auth/auth-provider-client";

import { auth } from "./auth";

export async function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const { session, user } = await auth();

  return (
    <AuthProviderClient session={session} user={user}>
      {children}
    </AuthProviderClient>
  );
}
