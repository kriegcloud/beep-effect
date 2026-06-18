/**
 * Schema-first `formOptions` builders for `@tanstack/react-form`.
 *
 * Every builder turns an effect schema into TanStack `formOptions`: the schema
 * is the single source of validation (via {@link toFormSchema}) and, optionally,
 * of default values (via {@link getDefaultFormValues}). TanStack owns all form
 * state; these helpers only assemble its options.
 *
 * Validation slot routing honours the effect-to-Standard Schema boundary: a schema
 * that decodes **synchronously** uses the sync slot (`onChange`/`onBlur`/
 * `onSubmit`), while an **async-capable** schema must use the async slot
 * (`*Async`) because effect's `validate` returns a `Promise` that the sync slot
 * rejects. Pass `async: true` for async-capable schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { formOptions } from "@tanstack/react-form";
import { Match } from "effect";
import * as S from "effect/Schema";
import { getDefaultFormValues } from "./Defaults.ts";
import { toFormSchema } from "./FormSchema.ts";
import type { ToFormSchemaOptions } from "./FormSchema.ts";

/**
 * Which validation event the schema runs on.
 *
 * @category models
 * @since 0.0.0
 */
export type ValidateOn = "change" | "blur" | "submit";

interface BaseParams<A, I> {
  /** Route to the async validator slot for async-capable schemas; defaults to `false`. */
  readonly async?: boolean;
  /** End-user message + parse options forwarded to the Standard Schema. */
  readonly messages?: ToFormSchemaOptions;
  /** The effect schema validating (and typing) the form. */
  readonly schema: S.Codec<A, I>;
  /** Validation event; defaults to `"submit"`. */
  readonly validateOn?: ValidateOn;
}

const buildValidators = <A, I>(
  standard: ReturnType<typeof toFormSchema<A, I>>,
  validateOn: ValidateOn,
  async: boolean
) =>
  Match.value(validateOn).pipe(
    Match.when("change", () => (async ? { onChangeAsync: standard } : { onChange: standard })),
    Match.when("blur", () => (async ? { onBlurAsync: standard } : { onBlur: standard })),
    Match.when("submit", () => (async ? { onSubmitAsync: standard } : { onSubmit: standard })),
    Match.exhaustive
  );

/**
 * Base builder: wires a schema's Standard Schema into TanStack `validators` on
 * the chosen slot, with caller-supplied default values.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { makeFormOptions } from "@beep/form/core/FormOptions"
 *
 * const schema = S.Struct({ name: S.String })
 * const options = makeFormOptions({ schema, defaultValues: { name: "" } })
 * console.log(options.defaultValues) // { name: "" }
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeFormOptions = <A, I>(
  params: BaseParams<A, I> & {
    readonly defaultValues: I;
  }
) =>
  formOptions({
    defaultValues: params.defaultValues,
    validators: buildValidators(
      toFormSchema(params.schema, params.messages),
      params.validateOn ?? "submit",
      params.async ?? false
    ),
  });

/**
 * Like {@link makeFormOptions}, but derives `defaultValues` from the schema's
 * constructor defaults (see {@link getDefaultFormValues}) when not supplied.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * import { formOptionsWithDefaults } from "@beep/form/core/FormOptions"
 *
 * const schema = S.Struct({
 *   name: S.String.pipe(S.withConstructorDefault(Effect.succeed(""))),
 * })
 * const options = formOptionsWithDefaults({ schema })
 * console.log(options.defaultValues) // { name: "" }
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const formOptionsWithDefaults = <A, I>(
  params: BaseParams<A, I> & {
    readonly defaultValues?: I;
  }
) =>
  makeFormOptions({
    ...params,
    // `getDefaultFormValues` returns the decoded `Type`; the form holds the
    // `Encoded` shape. They coincide for non-transform schemas (the common
    // case). For transform schemas pass explicit `defaultValues`, or a
    // type-side schema so Encoded === Type.
    defaultValues: params.defaultValues ?? (getDefaultFormValues(params.schema) as unknown as I),
  });

/**
 * Builder whose `onSubmit` receives the decoded **`Type`**: the encoded form
 * values are decoded through the schema (`decodeUnknownPromise`) before the
 * callback runs. Named for what `onSubmit` receives (decoded value) — contrast
 * {@link formOptionsWithSubmitEffect}.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { formOptionsWithSubmit } from "@beep/form/core/FormOptions"
 *
 * const schema = S.Struct({ name: S.String })
 * const options = formOptionsWithSubmit({
 *   schema,
 *   defaultValues: { name: "" },
 *   onSubmit: (value) => console.log(value.name),
 * })
 * console.log(typeof options.onSubmit) // "function"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const formOptionsWithSubmit = <A, I>(
  params: BaseParams<A, I> & {
    readonly defaultValues: I;
    readonly onSubmit: (value: A) => void | Promise<void>;
  }
) => {
  const decode = S.decodeUnknownPromise(params.schema);
  return formOptions({
    ...makeFormOptions(params),
    onSubmit: ({ value }: { readonly value: I }) => decode(value).then((decoded) => params.onSubmit(decoded)),
  });
};

/**
 * Builder whose `onSubmit` receives the decode **`Effect`**: the caller runs it
 * in their own runtime (e.g. bridging to an effect atom mutation — the
 * sanctioned TanStack-to-atom boundary). Named for what `onSubmit` receives (an
 * `Effect`) — contrast {@link formOptionsWithSubmit}.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import * as S from "effect/Schema"
 * import { formOptionsWithSubmitEffect } from "@beep/form/core/FormOptions"
 *
 * const schema = S.Struct({ name: S.String })
 * const options = formOptionsWithSubmitEffect({
 *   schema,
 *   defaultValues: { name: "" },
 *   onSubmit: (effect) => Effect.runPromise(effect).then((v) => console.log(v.name)),
 * })
 * console.log(typeof options.onSubmit) // "function"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const formOptionsWithSubmitEffect = <A, I>(
  params: BaseParams<A, I> & {
    readonly defaultValues: I;
    readonly onSubmit: (
      value: ReturnType<ReturnType<typeof S.decodeUnknownEffect<S.Codec<A, I>>>>
    ) => void | Promise<void>;
  }
) => {
  const decode = S.decodeUnknownEffect(params.schema);
  return formOptions({
    ...makeFormOptions(params),
    onSubmit: ({ value }: { readonly value: I }) => params.onSubmit(decode(value)),
  });
};
