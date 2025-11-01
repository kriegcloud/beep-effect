"use client";

import { type ReactNode, useContext } from "react";
import { AuthUIContext } from "../lib/auth-ui-provider";

/**
 * Conditionally renders content during authentication loading state
 *
 * Renders its children only when the authentication state is being determined
 * (during the loading/pending phase). Once the authentication state is resolved,
 * nothing is rendered. Useful for displaying loading indicators or temporary
 * content while waiting for the authentication check to complete.
 */
export function AuthLoading({ children }: { children: ReactNode }) {
  const {
    hooks: { useSession },
  } = useContext(AuthUIContext);
  const { isPending } = useSession();

  return isPending ? children : null;
}
