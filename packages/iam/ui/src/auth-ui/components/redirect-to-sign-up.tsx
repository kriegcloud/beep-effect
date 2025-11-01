"use client";

import type { ReactNode } from "react";
import { useAuthenticate } from "../hooks/use-authenticate";

/**
 * Redirects the user to the sign-up page
 *
 * Renders nothing and automatically redirects the current user to the authentication
 * sign-up page. Useful for directing new users to create an account or
 * for redirecting from marketing pages to the registration flow.
 */
export function RedirectToSignUp(): ReactNode {
  useAuthenticate({ authView: "SIGN_UP" });
  return null;
}
