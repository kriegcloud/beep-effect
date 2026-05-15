/**
 * MDX component bindings for opip web.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

/**
 * Returns the MDX component overrides used by opip web.
 *
 * @example
 * ```ts
 * import { useMDXComponents } from "@beep/opip-web/mdx-components"
 *
 * const components = useMDXComponents()
 * console.log(Object.keys(components).length)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export function useMDXComponents(): MDXComponents {
  return components;
}
