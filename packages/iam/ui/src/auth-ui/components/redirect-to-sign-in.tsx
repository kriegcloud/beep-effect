"use client";

import type { ReactNode } from "react";
import { useAuthenticate } from "../hooks/use-authenticate";

/**
 * Redirects the user to the sign-in page
 *
 * Renders nothing and automatically redirects the current user to the authentication
 * sign-in page. Useful for protecting routes that require authentication or
 * redirecting users to sign in from various parts of the application.
 */
export function RedirectToSignIn(): ReactNode {
  useAuthenticate({ authView: "SIGN_IN" });
  return null;
}
