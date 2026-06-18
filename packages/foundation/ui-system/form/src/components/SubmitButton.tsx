/**
 * Form submit button bound to the active form's submission state.
 *
 * Subscribes to `canSubmit` / `isSubmitting` via `form.Subscribe` (a narrowing
 * selector to minimize re-renders) and maps them onto a `@beep/ui` `Button`.
 * Registered as a form component on {@link useAppForm}.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Button } from "@beep/ui/components/button";
import { useFormContext } from "../core/contexts.ts";
import type React from "react";

/**
 * Props for {@link SubmitButton}: every `@beep/ui` `Button` prop.
 *
 * @category models
 * @since 0.0.0
 */
export interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  readonly children?: React.ReactNode | undefined;
}

/**
 * Submit button that disables itself while the form cannot submit or is
 * submitting.
 *
 * @example
 * ```tsx
 * import { SubmitButton } from "@beep/form/components/SubmitButton"
 *
 * console.log(SubmitButton)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const SubmitButton: React.FC<SubmitButtonProps> = ({ children, ...props }) => {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}>
      {({ canSubmit, isSubmitting }) => (
        <Button {...props} type="submit" disabled={!canSubmit || isSubmitting}>
          {children ?? "Submit"}
        </Button>
      )}
    </form.Subscribe>
  );
};
