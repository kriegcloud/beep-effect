import type { DiffUpdate } from "@platejs/diff";

import { type Descendant, ElementApi } from "platejs";
import { createPlatePlugin, type OverrideEditor } from "platejs/react";
import stringComparison from "string-comparison";

import { BlockDiff, DiffLeaf } from "./diff-node";

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

        return fragment as any;
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

export const describeUpdate = ({ newProperties, properties }: DiffUpdate) => {
  const addedProps: string[] = [];
  const removedProps: string[] = [];
  const updatedProps: string[] = [];

  Object.keys(newProperties).forEach((key) => {
    const oldValue = properties[key];
    const newValue = newProperties[key];

    if (oldValue === undefined) {
      addedProps.push(key);

      return;
    }
    if (newValue === undefined) {
      removedProps.push(key);

      return;
    }

    updatedProps.push(key);
  });

  const descriptionParts: string[] = [];

  if (addedProps.length > 0) {
    descriptionParts.push(`Added ${addedProps.join(", ")}`);
  }
  if (removedProps.length > 0) {
    descriptionParts.push(`Removed ${removedProps.join(", ")}`);
  }
  if (updatedProps.length > 0) {
    updatedProps.forEach((key) => {
      descriptionParts.push(`Updated ${key} from ${properties[key]} to ${newProperties[key]}`);
    });
  }

  return descriptionParts.join("\n");
};

export const hasDiff = (descendant: Descendant): boolean =>
  "diff" in descendant || (ElementApi.isElement(descendant) && descendant.children.some(hasDiff));

export const textsAreComparable = (text1: string, text2: string): boolean =>
  text1.trim() === "" || text2.trim() === "" || stringComparison.lcs.similarity(text1, text2) > 0.5;
