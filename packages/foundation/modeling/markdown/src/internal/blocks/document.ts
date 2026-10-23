// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Port notes: upstream's `document` finalize runs
// `removeLinkReferenceDefinitions`, a whole-tree walk that strips definitions
// out. This package keeps definitions as nodes and splits them out as each paragraph closes
// (`linkReferenceDefinition.ts`), so this construct's finalize is a no-op.

import { alwaysContinues, BlockConstruct, containerMaterializer, containsFlow, flowChildren } from "../blockTypes.ts";
import { trustedNode } from "../nodes.ts";
import type { Root } from "../nodes.ts";

/**
 * Materializes the document root, containing everything except a bare list item.
 *
 * **Example** (Inspect root containment)
 *
 * ```ts
 * import { documentConstruct } from "@beep/markdown/internal/blocks/document";
 *
 * console.log(documentConstruct.canContain("blockquote")); // true
 * console.log(documentConstruct.canContain("listItem")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const documentConstruct = new BlockConstruct("document", false, {
  canContain: containsFlow,
  continue: alwaysContinues,
  materialize: containerMaterializer((block, children, context) =>
    trustedNode<Root>({
      type: "root",
      children: flowChildren(children),
      position: context.position(block.startOffset, block.endOffset),
    })
  ),
});
