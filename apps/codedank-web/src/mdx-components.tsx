/**
 * MDX component bindings for codedank web.
 *
 * @since 0.0.0
 * @module
 */

import type { MDXComponents } from "mdx/types";

const components: MDXComponents = {};

/**
 * Returns the MDX component overrides used by codedank web.
 *
 * @category constructors
 * @since 0.0.0
 */
export function useMDXComponents(): MDXComponents {
  return components;
}
