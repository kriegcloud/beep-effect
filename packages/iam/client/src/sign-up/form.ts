/**
 * @fileoverview Sign-up form hooks.
 *
 * Provides pre-configured form instances for email sign-up with schema-based
 * validation and atom integration for submission handling.
 *
 * @module @beep/iam-client/sign-up/form
 * @category SignUp
 * @since 0.1.0
 */

import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Atoms from "./atoms";
import { Email } from "./email";

/**
 * Returns configured React Hook Form instances for sign-up operations.
 *
 * @example
 * ```tsx
 * import { SignUp } from "@beep/iam-client"
 * import * as React from "react"
 *
 * const SignUpForm = () => {
 *   const { emailForm } = SignUp.Form.use()
 *
 *   return (
 *     <form onSubmit={emailForm.handleSubmit}>
 *       <input {...emailForm.register("email")} />
 *       <input type="password" {...emailForm.register("password")} />
 *       <button type="submit">Sign Up</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @category SignUp/Hooks
 * @since 0.1.0
 */
export const use = () => {
  const { email } = Atoms.use();

  return {
    emailForm: useAppForm(
      formOptionsWithDefaults({
        schema: Email.PayloadFrom,
        onSubmit: email,
      })
    ),
  };
};
