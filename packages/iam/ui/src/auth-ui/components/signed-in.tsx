"use client";

import { type ReactNode, useContext } from "react";
import { AuthUIContext } from "../lib/auth-ui-provider";

/**
 * Conditionally renders content for authenticated users only
 *
 * Renders its children only when a user is authenticated with a valid session.
 * If no session exists, nothing is rendered. Useful for displaying protected
 * content or UI elements that should only be visible to signed-in users.
 */
export function SignedIn({ children }: { children: ReactNode }) {
  const {
    hooks: { useSession },
  } = useContext(AuthUIContext);
  const { data } = useSession();

  return data ? children : null;
}
