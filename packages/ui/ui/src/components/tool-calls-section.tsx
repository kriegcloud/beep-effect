"use client";

import { cn } from "@beep/ui-core/utils";
import { CaretDownIcon, WrenchIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export interface ToolCallEntry {
  readonly tool_name: string;
  readonly tool_category: string;
  readonly message?: undefined |  string;
  readonly show_category?: undefined |  boolean;
  readonly tool_call_id?: undefined |  string;
  readonly inputs?: undefined |  Record<string, unknown>;
  readonly output?: undefined |  string;
  readonly icon_url?: undefined |  string;
  readonly integration_name?: undefined |  string;
}

export interface IntegrationInfo {
  readonly iconUrl?: undefined |  string;
  readonly name?: undefined |  string;
}

export interface ToolCallsSectionProps {
  readonly toolCalls: ToolCallEntry[];
  readonly integrations?: undefined |  Map<string, IntegrationInfo>;
  readonly maxIconsToShow?: undefined |  number;
  readonly defaultExpanded?: undefined |  boolean;
  readonly className?: undefined |  string;
  readonly renderIcon?: undefined |  ((call: ToolCallEntry) => ReactNode);
  readonly renderContent?: undefined |  ((content: unknown) => ReactNode);
}

const formatToolName = (name: string): string =>
  name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const getCategoryChipClasses = (category: string): string => {
  const normalized = category.toLowerCase();

  if (normalized.includes("calendar") || normalized.includes("schedule")) {
    return "bg-sky-500/20 text-sky-300";
  }
  if (normalized.includes("mail") || normalized.includes("message")) {
    return "bg-indigo-500/20 text-indigo-300";
  }
  if (normalized.includes("search") || normalized.includes("web")) {
    return "bg-emerald-500/20 text-emerald-300";
  }
  if (normalized.includes("doc") || normalized.includes("file")) {
    return "bg-orange-500/20 text-orange-300";
  }

  return "bg-zinc-500/20 text-zinc-300";
};

const stringifyContent = (content: unknown): string => {
  if (typeof content === "string") {
    return content;
  }

  try {
    return JSON.stringify(content, null, 2);
  } catch {
    return String(content);
  }
};

function DefaultContent({ content }: { readonly content: unknown }) {
  return (
    <pre className="max-h-60 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-zinc-900/50 p-3 text-xs text-zinc-400">
      {stringifyContent(content)}
    </pre>
  );
}

function DefaultChip({ call }: { readonly call: ToolCallEntry }) {
  const label = call.integration_name ?? call.tool_category ?? call.tool_name ?? "tool";

  return (
    <div
      className={cn(
        "flex min-h-8 min-w-8 items-center justify-center rounded-lg px-1 text-[10px] font-semibold uppercase",
        getCategoryChipClasses(label)
      )}
      title={label}
    >
      {(label.trim()[0] ?? "T").toUpperCase()}
    </div>
  );
}

export function ToolCallsSection({
  toolCalls,
  integrations,
  maxIconsToShow = 10,
  defaultExpanded = false,
  className,
  renderIcon,
  renderContent,
}: ToolCallsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedCalls, setExpandedCalls] = useState<Set<number>>(new Set());

  const integrationLookup = useMemo(() => integrations ?? new Map(), [integrations]);

  if (toolCalls.length === 0) {
    return null;
  }

  const iconRenderer = renderIcon ?? ((call: ToolCallEntry) => <DefaultChip call={call} />);
  const contentRenderer =
    renderContent ??
    ((content: unknown) => {
      return <DefaultContent content={content} />;
    });

  const uniqueCalls = useMemo(() => {
    const seen = new Set<string>();
    return toolCalls.filter((call) => {
      const key = call.tool_category || call.tool_name || "general";
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [toolCalls]);

  const displayCalls = uniqueCalls.slice(0, maxIconsToShow);

  const toggleCallExpansion = (index: number) => {
    setExpandedCalls((previous) => {
      const next = new Set(previous);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className={cn("w-fit max-w-[35rem]", className)}>
      <button
        type="button"
        onClick={() => setIsExpanded((value) => !value)}
        className="flex cursor-pointer items-center gap-2 py-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
      >
        <div className="flex min-h-8 items-center -space-x-2">
          {displayCalls.map((call, index) => (
            <div
              key={`${call.tool_name}-${index}`}
              className="relative flex min-w-8 items-center justify-center"
              style={{ zIndex: index }}
            >
              {iconRenderer(call)}
            </div>
          ))}
          {uniqueCalls.length > maxIconsToShow && (
            <div className="z-0 flex size-7 min-h-7 min-w-7 items-center justify-center rounded-lg bg-zinc-200 text-xs font-normal text-zinc-600 dark:bg-zinc-700/60 dark:text-zinc-500">
              +{uniqueCalls.length - maxIconsToShow}
            </div>
          )}
        </div>

        <span className="text-xs font-medium transition-all duration-200">
          Used {toolCalls.length} tool{toolCalls.length > 1 ? "s" : ""}
        </span>

        <CaretDownIcon size={16} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
      </button>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-0 pt-1">
          {toolCalls.map((call, index) => {
            const categoryLabel =
              call.integration_name ?? integrationLookup.get(call.tool_category)?.name ?? call.tool_category;

            const hasCategoryText =
              call.show_category !== false && Boolean(categoryLabel) && categoryLabel !== "unknown";

            const hasDetails = Boolean(call.inputs || call.output);
            const isCallExpanded = expandedCalls.has(index);

            return (
              <div key={call.tool_call_id ?? `${call.tool_name}-step-${index}`} className="flex items-stretch gap-2">
                <div className="flex flex-col items-center self-stretch">
                  <div className="flex min-h-8 min-w-8 shrink-0 items-center justify-center">{iconRenderer(call)}</div>
                  {index < toolCalls.length - 1 && <div className="min-h-4 w-px flex-1 bg-zinc-300 dark:bg-zinc-700" />}
                </div>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className={cn(
                      "group/parent flex items-center gap-1",
                      hasDetails ? "cursor-pointer" : "",
                      !hasCategoryText ? "pt-2" : ""
                    )}
                    onClick={() => {
                      if (hasDetails) {
                        toggleCallExpansion(index);
                      }
                    }}
                  >
                    <p
                      className={cn(
                        "text-xs font-medium text-zinc-600 dark:text-zinc-400",
                        hasDetails && "group-hover/parent:text-zinc-900 dark:group-hover/parent:text-white"
                      )}
                    >
                      {call.message ?? formatToolName(call.tool_name)}
                    </p>
                    {hasDetails && (
                      <CaretDownIcon
                        size={14}
                        className={cn("transition-transform duration-200", isCallExpanded && "rotate-180")}
                      />
                    )}
                  </button>

                  {hasCategoryText && (
                    <p className="text-[11px] capitalize text-zinc-400 dark:text-zinc-500">
                      {categoryLabel.replace(/_/g, " ")}
                    </p>
                  )}

                  {isCallExpanded && hasDetails && (
                    <div className="mb-3 mt-2 w-fit space-y-2 rounded-xl bg-zinc-100 p-3 text-[11px] dark:bg-zinc-800/50">
                      {call.inputs && Object.keys(call.inputs).length > 0 && (
                        <div className="flex flex-col">
                          <span className="mb-1 font-medium text-zinc-400 dark:text-zinc-500">Input</span>
                          {contentRenderer(call.inputs)}
                        </div>
                      )}

                      {call.output && (
                        <div className="flex flex-col">
                          <span className="mb-1 font-medium text-zinc-400 dark:text-zinc-500">Output</span>
                          {contentRenderer(call.output)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {!displayCalls.length && (
        <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 p-2 text-xs text-zinc-400">
          <WrenchIcon size={14} />
          No tool calls
        </div>
      )}
    </div>
  );
}

export default ToolCallsSection;
