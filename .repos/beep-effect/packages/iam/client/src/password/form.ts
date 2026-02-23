"use client";
/**
 * @fileoverview
 * React Hook Form integration for password flows.
 *
 * Provides pre-configured form instances with schema validation for
 * change password, request reset, and reset password operations.
 *
 * @module @beep/iam-client/password/form
 * @category Password
 * @since 0.1.0
 */

import { formOptionsWithDefaults, useAppForm } from "@beep/ui/form";
import * as Atoms from "./atoms";
import { Change } from "./change";
import { RequestReset } from "./request-reset";
import { Reset } from "./reset";

/**
 * React hook providing password forms with schema validation and atom submission.
 *
 * @example
 * ```tsx
 * import { Password } from "@beep/iam-client"
 *
 * function ChangePasswordForm() {
 *   const { changeForm } = Password.Form.use()
 *
 *   return (
 *     <form onSubmit={changeForm.handleSubmit}>
 *       <input {...changeForm.register("currentPassword")} type="password" />
 *       <input {...changeForm.register("newPassword")} type="password" />
 *       <button type="submit">Change Password</button>
 *     </form>
 *   )
 * }
 * ```
 *
 * @category Password/Forms
 * @since 0.1.0
 */
export const use = () => {
  const { change, requestReset, reset } = Atoms.use();

  return {
    changeForm: useAppForm(
      formOptionsWithDefaults({
        schema: Change.Payload,
        onSubmit: change,
      })
    ),
    requestResetForm: useAppForm(
      formOptionsWithDefaults({
        schema: RequestReset.Payload,
        onSubmit: requestReset,
      })
    ),
    resetForm: useAppForm(
      formOptionsWithDefaults({
        schema: Reset.Payload,
        onSubmit: reset,
      })
    ),
  };
};
