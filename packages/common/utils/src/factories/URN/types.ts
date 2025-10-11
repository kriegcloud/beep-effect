/**
 * Allowed identifier protocol/prefixes.
 * Examples:
 *  - "@beep/"          (workspace-style)
 *  - "https://foo/"    (URL-style)
 *  - "/"               (root-relative / route-ish)
 */
export type Proto = `@${string}/` | `https://${string}/` | `/${string}`; // allow "/" or "/foo/..." (we'll normalize trailing slash)

/** A single path segment: disallow embedded "/" at the type-level. */
export type Segment<S extends string = string> = string extends S
  ? string
  : S extends `${string}/${string}`
    ? never
    : S;
