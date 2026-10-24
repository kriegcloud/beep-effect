// Message fragments for the package's tagged errors: an optional field reads
// as nothing when it is absent and as `<prefix><value><closing>` when it is
// present, spelled once so every `message` getter composes the same way.

/**
 * How a present value is framed: the text before it and, optionally, after it.
 *
 * @internal
 * @category models
 * @since 0.0.0
 */
export interface Frame {
  readonly closing?: string;
  readonly prefix: string;
}

/**
 * The renderer for one optional field: a present value framed by `prefix`
 * and `closing`, an absent one as `""`.
 *
 * **Example** (Render an optional status)
 *
 * ```ts
 * import { framed } from "@beep/github-actions/internal/messageText";
 *
 * const status = framed({ prefix: " with status " });
 * console.log(`refused${status(403)}`) // refused with status 403
 * console.log(`refused${status(undefined)}`) // refused
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const framed =
  ({ prefix, closing = "" }: Frame) =>
  (value: string | number | undefined): string =>
    value === undefined ? "" : `${prefix}${value}${closing}`;

/**
 * A `: <detail>` suffix, the shape every error message gives its detail, stderr
 * or subject.
 *
 * **Example** (Render an optional detail)
 *
 * ```ts
 * import { detailText } from "@beep/github-actions/internal/messageText";
 *
 * console.log(`failed${detailText("disk full")}`) // failed: disk full
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const detailText = framed({ prefix: ": " });

/**
 * A ` with status <status>` suffix for an HTTP refusal.
 *
 * **Example** (Render an optional status)
 *
 * ```ts
 * import { statusText } from "@beep/github-actions/internal/messageText";
 *
 * console.log(`refused${statusText(403)}`) // refused with status 403
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const statusText = framed({ prefix: " with status " });
