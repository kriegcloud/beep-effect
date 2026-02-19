"use client";
/**
 * @fileoverview
 * React Hook Form integration for sign-in flows with automatic validation.
 *
 * Provides pre-configured form instances for email and username sign-in with
 * schema-based validation and atom integration for submission handling.
 *
 * @module @beep/iam-client/sign-in/form
 * @category SignIn
 * @since 0.1.0
 */

import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Atoms from "./atoms";
import { Email } from "./email";
import { Username } from "./username";

/**
 * React hook providing form handlers for email and username sign-in with schema validation.
 *
 * @example
 * ```tsx
 * import { SignIn } from "@beep/iam-client"
 *
 * function SignInForm() {
 *   const { emailForm, usernameForm } = SignIn.Form.use()
 *
 *   return (
 *     <form onSubmit={emailForm.handleSubmit}>
 *       <input {...emailForm.register("email")} />
 *       <input {...emailForm.register("password")} type="password" />
 *       <button type="submit">Sign In</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @category SignIn/Hooks
 * @since 0.1.0
 */
export const use = () => {
  const { username, email } = Atoms.use();

  return {
    emailForm: useAppForm(
      formOptionsWithDefaults({
        schema: Email.Payload,
        onSubmit: email,
      })
    ),
    usernameForm: useAppForm(
      formOptionsWithDefaults({
        schema: Username.Payload,
        onSubmit: username,
      })
    ),
  };
};
