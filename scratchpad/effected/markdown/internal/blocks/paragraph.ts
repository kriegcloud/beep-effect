// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Port notes: a paragraph has no block start of its own — the line loop opens
// one for any line no other construct claimed, which is upstream's structure
// too. The link-reference-definition split runs here rather than in the
// document's finalize walk (see `linkReferenceDefinition.ts`), which is the
// one structural difference: upstream defers it to a tree walk at the end,
// this port does it as each paragraph closes.

import { Paragraph } from "../../MarkdownNode.ts";
import type { BlockConstruct, BlockContinueResult, BlockNode, BlockScanner, MaterializeContext, MaterializedBlock } from "../blockTypes.ts";
import { extractDefinitions } from "./linkReferenceDefinition.ts";
import { dual } from "effect/Function";

/**
 * Absorbs paragraph lines until a blank line and contains no child blocks.
 *
 * **Details**
 *
 * Finalization extracts leading link reference definitions. Materialization
 * omits a paragraph whose trimmed inline content is empty, including one
 * that held only definitions.
 *
 * **Example** (Inspect paragraph line absorption)
 *
 * ```ts
 * import { paragraphConstruct } from "@beep/scratchpad/effected/markdown/internal/blocks/paragraph";
 *
 * console.log(paragraphConstruct.acceptsLines); // true
 * console.log(paragraphConstruct.canContain("list")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const paragraphConstruct: BlockConstruct = {
	type: "paragraph",
	acceptsLines: true,
	canContain: () => false,
	continue: dual(2, (scanner: BlockScanner, _block: BlockNode): BlockContinueResult => (scanner.blank ? 1 : 0)),
	finalize: dual(2, (_scanner: BlockScanner, block: BlockNode): void => {
		extractDefinitions(block);
	}),
	materialize: dual(3, (block: BlockNode, _children: ReadonlyArray<MaterializedBlock>, context: MaterializeContext): MaterializedBlock | undefined => {
		const inline = context.inlineSlice(block);
		// A paragraph whose content trimmed away renders nothing; dropping it
		// keeps `<p></p>` out of the tree. A paragraph that held only link
		// reference definitions is the case that makes this reachable.
		if (inline.text.length === 0) {
			return undefined;
		}

		const node = Paragraph.make({
			children: inline.children,
			position: context.position(block.startOffset, block.endOffset),
		});
		context.registerInline(node, inline);
		return node;
	}),
};
