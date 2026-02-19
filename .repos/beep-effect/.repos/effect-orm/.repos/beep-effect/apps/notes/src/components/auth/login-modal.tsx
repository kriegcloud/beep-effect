"use client";

import { LoginForm } from "@beep/notes/components/auth/login-form";
import { useSession } from "@beep/notes/components/auth/useSession";
import { SrOnly } from "@beep/notes/components/ui/sr-only";
import { DialogContent, DialogTitle } from "@beep/notes/registry/ui/dialog";

export function LoginModal() {
  const session = useSession();

  if (session) return null;

  return (
    <DialogContent size="md">
      <DialogTitle>
        <SrOnly>Login</SrOnly>
      </DialogTitle>
      <LoginForm />
    </DialogContent>
  );
}
