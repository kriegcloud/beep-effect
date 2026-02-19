import { cn } from "@beep/notes/lib/utils";
import type { UnsafeTypes } from "@beep/types";

import { type PlateElementProps, type RenderNodeWrapper, useEditorPlugin } from "platejs/react";
import React, { type HTMLAttributes, type ReactNode } from "react";

import { CHUNK_PLUGIN_KEY, type ChunkPluginConfig } from "./chunk-types";

export interface TChunkProps {
  readonly blockCount: number;
  readonly chunkIndex: number;
  readonly showExpandButton: boolean;
}

export const BlockChunk: RenderNodeWrapper = (props) => {
  const { element } = props;

  if (!element.chunkCollapsed) return;

  return (props) => <BlockChunkContent {...props} />;
};

function BlockChunkContent(props: PlateElementProps) {
  const { children, element } = props;
  const { getOptions } = useEditorPlugin<ChunkPluginConfig>({ key: CHUNK_PLUGIN_KEY });

  const { blockCount, chunkIndex, showExpandButton } = element.chunkCollapsed as TChunkProps;

  const mappedChildren = injectNodeProps(children, { className: "hidden" });

  return (
    <>
      {showExpandButton && (
        <ExpandChunkButton
          onClick={() => getOptions().setExpandedChunks!((prev) => [...prev, chunkIndex])}
          blockCount={blockCount}
        />
      )}
      {mappedChildren}
    </>
  );
}

const mergeableProps: (keyof HTMLAttributes<HTMLElement>)[] = ["className"];

const injectNodeProps = (children: ReactNode, props: HTMLAttributes<HTMLElement>) =>
  React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      const { attributes } = child.props as PlateElementProps;

      Object.keys(props).forEach((key) => {
        const exists = attributes && key in attributes;
        const mergeable = mergeableProps.includes(key as UnsafeTypes.UnsafeAny);

        if (exists && !mergeable) {
          console.warn("injectNodeProps: Overwriting existing node prop", key);
        }
      });

      return React.cloneElement(child, {
        attributes: {
          ...attributes,
          className: cn(attributes?.className, props.className),
        },
      } as Partial<PlateElementProps>);
    }

    return child;
  });

function ExpandChunkButton({ blockCount, onClick }: { blockCount: number; onClick: () => void }) {
  return (
    <button onClick={onClick} type="button">
      View {blockCount} more
    </button>
  );
}
