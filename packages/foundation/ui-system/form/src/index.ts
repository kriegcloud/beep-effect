/**
 * `@beep/form` — a schema-first, effect-first form substrate built on
 * `@tanstack/react-form` and bound to `@beep/ui` primitives.
 *
 * The schema is the single source of both validation and default values.
 * TanStack owns all form/field/validation/submission state; non-form field
 * state uses scoped atoms. Field components are consumed through the
 * {@link useAppForm} factory (`<form.AppField>{(field) => <field.Text/>}`);
 * import individual field components from the `@beep/form/fields/*` subpath when
 * needed directly.
 *
 * @example
 * ```ts
 * import { makeFormOptions, toFormSchema } from "@beep/form"
 *
 * console.log(typeof makeFormOptions, typeof toFormSchema)
 * ```
 *
 * @packageDocumentation \@beep/form
 * @since 0.0.0
 */

/**
 * Native `<form>` wrapper that stops default submission and delegates.
 *
 * @example
 * ```ts
 * import { Form } from "@beep/form"
 *
 * console.log(typeof Form)
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./components/Form.tsx";
/**
 * Submit button bound to the active form's submission state.
 *
 * @example
 * ```ts
 * import { SubmitButton } from "@beep/form"
 *
 * console.log(typeof SubmitButton)
 * ```
 *
 * @since 0.0.0
 * @category components
 */
export * from "./components/SubmitButton.tsx";
/**
 * Shared TanStack field/form contexts.
 *
 * @example
 * ```ts
 * import { useFieldContext } from "@beep/form"
 *
 * console.log(typeof useFieldContext)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export * from "./core/contexts.ts";
/**
 * Schema-first default form values via `schema.make({})`.
 *
 * @example
 * ```ts
 * import { getDefaultFormValues } from "@beep/form"
 *
 * console.log(typeof getDefaultFormValues)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export * from "./core/Defaults.ts";
/**
 * Mapping TanStack field errors into the `@beep/ui` `FieldError` shape.
 *
 * @example
 * ```ts
 * import { toFieldErrors } from "@beep/form"
 *
 * console.log(typeof toFieldErrors)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export * from "./core/Errors.ts";
/**
 * Schema-first `formOptions` builders for `@tanstack/react-form`.
 *
 * @example
 * ```ts
 * import { makeFormOptions } from "@beep/form"
 *
 * console.log(typeof makeFormOptions)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export * from "./core/FormOptions.ts";
/**
 * The validation seam between effect `Schema` and `@tanstack/react-form`.
 *
 * @example
 * ```ts
 * import { toFormSchema } from "@beep/form"
 *
 * console.log(typeof toFormSchema)
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export * from "./core/FormSchema.ts";
/**
 * The option model shared by selection fields.
 *
 * @example
 * ```ts
 * import type { FieldOption } from "@beep/form"
 *
 * const option: FieldOption = { value: "a", label: "Alpha" }
 * console.log(option.value)
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * from "./core/Options.ts";
/**
 * Field path formatting, reading, writing, and dirty-path predicates.
 *
 * @example
 * ```ts
 * import { Path } from "@beep/form"
 *
 * console.log(Path.schemaPathToFieldPath(["items", 0, "name"])) // "items[0].name"
 * ```
 *
 * @since 0.0.0
 * @category utilities
 */
export * as Path from "./core/Path.ts";
/**
 * The centralized `useAppForm` factory plus `withForm` / `withFieldGroup`.
 *
 * @example
 * ```ts
 * import { useAppForm } from "@beep/form"
 *
 * console.log(typeof useAppForm)
 * ```
 *
 * @since 0.0.0
 * @category hooks
 */
export * from "./hooks/useAppForm.tsx";
