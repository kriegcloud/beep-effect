import type { UnsafeTypes } from "@beep/types";
import type { DiffOperation } from "@platejs/diff";
import type { TText } from "platejs";

import { PlateLeaf, type PlateLeafProps, type RenderNodeWrapper } from "platejs/react";

import { describeUpdate } from "./diff-utils";

const diffOperationColors: Record<DiffOperation["type"], string> = {
  delete: "bg-red-200",
  insert: "bg-green-200",
  update: "bg-blue-200",
};

export const BlockDiff: RenderNodeWrapper = () => {
  return ({ children, editor, element }) => {
    {
      if (!element.diff) return children;

      const diffOperation = element.diffOperation as DiffOperation;

      const label = {
        delete: "deletion",
        insert: "insertion",
        update: "update",
      }[diffOperation.type];

      const Component = editor.api.isInline(element) ? "span" : "div";

      return (
        <Component
          className={diffOperationColors[diffOperation.type]}
          title={diffOperation.type === "update" ? describeUpdate(diffOperation) : undefined}
          aria-label={label}
        >
          {children}
        </Component>
      );
    }
  };
};

export function DiffLeaf(props: PlateLeafProps<TText & { readonly diffOperation: DiffOperation }>) {
  const diffOperation = props.leaf.diffOperation;

  const Component = {
    delete: "del",
    insert: "ins",
    update: "span",
  }[diffOperation.type] as UnsafeTypes.UnsafeAny;

  return (
    <PlateLeaf
      {...props}
      as={Component}
      className={diffOperationColors[diffOperation.type]}
      attributes={{
        ...props.attributes,
        title: diffOperation.type === "update" ? describeUpdate(diffOperation) : undefined,
      }}
    />
  );
}
