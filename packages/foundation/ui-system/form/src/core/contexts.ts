/**
 * Shared `@tanstack/react-form` field/form contexts.
 *
 * These are created once and shared between the field components (which read
 * {@link useFieldContext}) and the {@link useAppForm} factory (which receives
 * {@link fieldContext} / {@link formContext}). Keeping them in their own module
 * breaks the field/factory import cycle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { createFormHookContexts } from "@tanstack/react-form";

const contexts = createFormHookContexts();

/**
 * React context carrying the active field API to a registered field component.
 *
 * @example
 * ```ts
 * import { fieldContext } from "@beep/form/core/contexts"
 *
 * console.log(fieldContext)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const fieldContext = contexts.fieldContext;

/**
 * Hook returning the active field API inside a registered field component.
 *
 * @example
 * ```ts
 * import { useFieldContext } from "@beep/form/core/contexts"
 *
 * console.log(useFieldContext)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const useFieldContext = contexts.useFieldContext;

/**
 * React context carrying the active form API to a registered form component.
 *
 * @example
 * ```ts
 * import { formContext } from "@beep/form/core/contexts"
 *
 * console.log(formContext)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const formContext = contexts.formContext;

/**
 * Hook returning the active form API inside a registered form component.
 *
 * @example
 * ```ts
 * import { useFormContext } from "@beep/form/core/contexts"
 *
 * console.log(useFormContext)
 * ```
 *
 * @category hooks
 * @since 0.0.0
 */
export const useFormContext = contexts.useFormContext;
