import type { UnsafeTypes } from "@beep/types";

import { type Descendant, ElementApi } from "platejs";
import { createPlatePlugin, type OverrideEditor } from "platejs/react";
import stringComparison from "string-comparison";

import { BlockDiff, DiffLeaf } from "./diff-node";

export { describeUpdate } from "./diff-utils";

export const withGetFragmentExcludeProps =
  (...propNames: string[]): OverrideEditor =>
  ({ api: { getFragment } }) => ({
    api: {
      getFragment() {
        const fragment = structuredClone(getFragment());

        const removeDiff = (node: Descendant) => {
          propNames.forEach((propName) => {
            delete node[propName];
          });

          if (ElementApi.isElement(node)) node.children.forEach(removeDiff);
        };

        fragment.forEach(removeDiff);

        return fragment as UnsafeTypes.UnsafeAny;
      },
    },
  });

export const DiffPlugin = createPlatePlugin({
  key: "diff",
  node: { component: DiffLeaf, isLeaf: true },
  render: {
    aboveNodes: BlockDiff,
  },
}).overrideEditor(withGetFragmentExcludeProps("diff", "diffOperation"));

export const hasDiff = (descendant: Descendant): boolean =>
  "diff" in descendant || (ElementApi.isElement(descendant) && descendant.children.some(hasDiff));

export const textsAreComparable = (text1: string, text2: string): boolean =>
  text1.trim() === "" || text2.trim() === "" || stringComparison.lcs.similarity(text1, text2) > 0.5;
