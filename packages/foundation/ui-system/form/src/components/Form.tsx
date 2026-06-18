/**
 * Thin `<form>` wrapper that stops native submission and delegates.
 *
 * Pair with TanStack's `form.handleSubmit`:
 * `<Form onSubmit={() => form.handleSubmit()}>`. It calls `preventDefault` /
 * `stopPropagation` before invoking the supplied `onSubmit`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import type React from "react";

/**
 * Props for {@link Form}: every native `<form>` prop.
 *
 * @category models
 * @since 0.0.0
 */
export interface FormProps extends React.ComponentProps<"form"> {}

/**
 * Native `<form>` element that prevents default submission and delegates to the
 * supplied `onSubmit` handler.
 *
 * @example
 * ```tsx
 * import { Form } from "@beep/form/components/Form"
 *
 * console.log(Form)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const Form: React.FC<FormProps> = ({ onSubmit, children, ...props }) => (
  <form
    {...props}
    onSubmit={(event) => {
      event.preventDefault();
      event.stopPropagation();
      onSubmit?.(event);
    }}
  >
    {children}
  </form>
);
