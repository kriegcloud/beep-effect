"use client";

import { cn } from "@beep/notes/lib/utils";

import type { SuggestionConfig } from "@beep/notes/registry/components/editor/plugins/suggestion-kit";
import { suggestionPlugin } from "@beep/notes/registry/components/editor/plugins/suggestion-kit";

import { cva } from "class-variance-authority";
import { CornerDownLeftIcon } from "lucide-react";
import type { TSuggestionData, TSuggestionText } from "platejs";
import {
  PlateLeaf,
  type PlateLeafProps,
  type RenderNodeWrapper,
  useEditorPlugin,
  usePluginOption,
} from "platejs/react";
import * as React from "react";

const suggestionVariants = cva(
  cn("border-b-2 border-b-brand/[.24] bg-brand/[.08] text-brand/80 no-underline transition-colors duration-200"),
  {
    defaultVariants: {
      insertActive: false,
      remove: false,
      removeActive: false,
    },
    variants: {
      insertActive: {
        false: "",
        true: "border-b-brand/[.60] bg-brand/[.13]",
      },
      remove: {
        false: "",
        true: "border-b-gray-300 bg-gray-300/25 text-gray-400 line-through",
      },
      removeActive: {
        false: "",
        true: "border-b-gray-500 bg-gray-400/25 text-gray-500 no-underline",
      },
    },
  }
);

export function SuggestionLeaf(props: PlateLeafProps<TSuggestionText>) {
  const { api, setOption } = useEditorPlugin(suggestionPlugin);

  const leafId: string = api.suggestion.nodeId(props.leaf) ?? "";
  const activeSuggestionId = usePluginOption(suggestionPlugin, "activeId");
  const hoverSuggestionId = usePluginOption(suggestionPlugin, "hoverId");
  const dataList = api.suggestion.dataList(props.leaf);

  const hasRemove = dataList.some((data) => data.type === "remove");
  const hasActive = dataList.some((data) => data.id === activeSuggestionId);
  const hasHover = dataList.some((data) => data.id === hoverSuggestionId);

  const diffOperation = {
    type: hasRemove ? "delete" : "insert",
  } as const;

  const Component = (
    {
      delete: "del",
      insert: "ins",
      update: "span",
    } as const
  )[diffOperation.type];

  return (
    <PlateLeaf
      {...props}
      as={Component}
      className={suggestionVariants({
        insertActive: hasActive || hasHover,
        remove: hasRemove,
        removeActive: (hasActive || hasHover) && hasRemove,
      })}
      attributes={{
        ...props.attributes,
        onMouseEnter: () => setOption("hoverId", leafId),
        onMouseLeave: () => setOption("hoverId", null),
      }}
    />
  );
}

export const SuggestionLineBreak: RenderNodeWrapper<SuggestionConfig> = ({ api, element }) => {
  if (!api.suggestion.isBlockSuggestion(element)) return;

  const suggestionData = element.suggestion;

  return function Component({ children }) {
    return <SuggestionLineBreakContent suggestionData={suggestionData}>{children}</SuggestionLineBreakContent>;
  };
};

function SuggestionLineBreakContent({
  children,
  suggestionData,
}: {
  children: React.ReactNode;
  suggestionData: TSuggestionData;
}) {
  const { isLineBreak, type } = suggestionData;
  const isRemove = type === "remove";
  const isInsert = type === "insert";

  const activeSuggestionId = usePluginOption(suggestionPlugin, "activeId");
  const hoverSuggestionId = usePluginOption(suggestionPlugin, "hoverId");

  const isActive = activeSuggestionId === suggestionData.id;
  const isHover = hoverSuggestionId === suggestionData.id;

  const spanRef = React.useRef<HTMLSpanElement>(null);
  const { setOption } = useEditorPlugin(suggestionPlugin);

  return (
    <React.Fragment>
      {isLineBreak ? (
        <React.Fragment>
          {children}
          <span
            ref={spanRef}
            className={cn(
              "absolute border-b-2 border-b-brand/[.24] bg-brand/[.08] text-justify text-brand/80 no-underline transition-colors duration-200",
              isInsert && (isActive || isHover) && "border-b-brand/[.60] bg-brand/[.13]",
              isRemove && "border-b-gray-300 bg-gray-300/25 text-gray-400 line-through",
              isRemove && (isActive || isHover) && "border-b-gray-500 bg-gray-400/25 text-gray-500 no-underline"
            )}
            style={{
              bottom: 3.5,
              height: 21,
            }}
            contentEditable={false}
          >
            <CornerDownLeftIcon className="mt-0.5 size-4" />
          </span>
        </React.Fragment>
      ) : (
        <div
          className={cn(
            suggestionVariants({
              insertActive: isInsert && (isActive || isHover),
              remove: isRemove,
              removeActive: (isActive || isHover) && isRemove,
            })
          )}
          onMouseEnter={() => setOption("hoverId", suggestionData.id)}
          onMouseLeave={() => setOption("hoverId", null)}
          data-block-suggestion="true"
        >
          {children}
        </div>
      )}
    </React.Fragment>
  );
}
