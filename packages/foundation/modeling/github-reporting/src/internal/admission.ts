// The one door every `GitHubMarkdown` node goes through on its way into a
// tree.
//
// A node `make` validates and copies its whole input subtree, so the writer's
// admission work is the summed subtree sizes of its `make` calls. That sum is
// what `test/GitHubMarkdown.admission.test.ts` pins, and it can only see it
// here: a schema's `make` memoizes itself as a non-configurable own property on
// first read, so it cannot be wrapped once any test in a shared worker has
// built a node. `admission` is a plain object, so a test can spy on `admit`
// and restore it.

import type * as S from "effect/Schema";

/**
 * Admit a writer node through its schema's `make`.
 *
 * **Example** (Admit a raw HTML node)
 *
 * ```ts
 * import { admission } from "@beep/github-reporting/internal/admission"
 * import { Html } from "@beep/markdown/MarkdownNode"
 *
 * const node = admission.admit(Html, { value: "<b>Hi</b>" })
 * console.log(node.value) // <b>Hi</b>
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const admission = {
  admit: <Self extends S.Top>(schema: Self, input: Self["~type.make.in"]): Self["Type"] => schema.make(input),
};
