// Message fragments for the package's tagged errors: an optional field reads
// as nothing when it is absent and as `<prefix><value><closing>` when it is
// present, spelled once so every `message` getter composes the same way.

/**
 * `value` framed by `prefix` and `closing`, or `""` when it is absent.
 *
 * **Example** (Render an optional status)
 *
 * ```ts
 * import { framed } from "@beep/github-actions/internal/messageText";
 *
 * console.log(`refused${framed(403, " with status ")}`) // refused with status 403
 * console.log(`refused${framed(undefined, " with status ")}`) // refused
 * ```
 *
 * @internal
 * @category formatting
 * @since 0.0.0
 */
export const framed = (value: string | number | undefined, prefix: string, closing = ""): string =>
  value === undefined ? "" : `${prefix}${value}${closing}`;
