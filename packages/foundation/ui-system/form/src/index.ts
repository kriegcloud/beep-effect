/**
 * `@beep/form` — a schema-first, effect-first form substrate built on
 * `@tanstack/react-form` and bound to `@beep/ui` primitives.
 *
 * The schema is the single source of both validation and default values.
 * TanStack owns all form/field/validation/submission state; non-form field
 * state uses scoped atoms.
 *
 * @example
 * ```ts
 * import { makeFormOptions, toFormSchema } from "@beep/form"
 *
 * console.log(typeof makeFormOptions, typeof toFormSchema)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export * from "./components/Form.tsx";
export * from "./components/SubmitButton.tsx";
export * from "./core/contexts.ts";
export * from "./core/Defaults.ts";
export * from "./core/Errors.ts";
export * from "./core/FormOptions.ts";
export * from "./core/FormSchema.ts";
export * from "./core/Options.ts";
export * as Path from "./core/Path.ts";
export * from "./fields/CheckboxField.tsx";
export * from "./fields/NumberField.tsx";
export * from "./fields/SwitchField.tsx";
export * from "./fields/TextareaField.tsx";
export * from "./fields/TextField.tsx";
export * from "./hooks/useAppForm.tsx";
