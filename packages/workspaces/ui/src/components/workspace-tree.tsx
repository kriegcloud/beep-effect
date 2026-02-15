"use client";

import { CaretDownIcon, CaretRightIcon, FileTextIcon, FolderIcon, PlusIcon } from "@phosphor-icons/react";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as React from "react";
import type { WorkspacePage } from "../types/workspace.ts";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_PAGES: ReadonlyArray<WorkspacePage> = [
  {
    id: "page-1",
    title: "Getting Started",
    children: [
      { id: "page-1-1", title: "Quick Start Guide" },
      { id: "page-1-2", title: "Installation" },
    ],
  },
  {
    id: "page-2",
    title: "Architecture",
    children: [
      { id: "page-2-1", title: "System Overview" },
      {
        id: "page-2-2",
        title: "Backend",
        children: [
          { id: "page-2-2-1", title: "API Design" },
          { id: "page-2-2-2", title: "Database Schema" },
        ],
      },
      { id: "page-2-3", title: "Frontend" },
    ],
  },
  { id: "page-3", title: "Meeting Notes" },
  { id: "page-4", title: "Roadmap" },
];

// ---------------------------------------------------------------------------
// PageTreeItem
// ---------------------------------------------------------------------------

interface PageTreeItemProps {
  readonly page: WorkspacePage;
  readonly depth: number;
  readonly expandedIds: ReadonlySet<string>;
  readonly selectedId: string | undefined;
  readonly onToggle: (id: string) => void;
  readonly onSelect: (id: string) => void;
}

function PageTreeItem({ page, depth, expandedIds, selectedId, onToggle, onSelect }: PageTreeItemProps) {
  const hasChildren = page.children != null && !A.isEmptyReadonlyArray(page.children);
  const isExpanded = expandedIds.has(page.id);
  const isSelected = selectedId === page.id;

  const paddingLeft = `${depth * 12 + 8}px`;

  const handleToggle = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggle(page.id);
    },
    [onToggle, page.id]
  );

  const handleSelect = React.useCallback(() => {
    onSelect(page.id);
  }, [onSelect, page.id]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(page.id);
      }
    },
    [onSelect, page.id]
  );

  return (
    <div role="none">
      <div
        role="treeitem"
        tabIndex={0}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        className={[
          "group flex items-center gap-1.5 rounded-md px-2 py-1 text-sm cursor-pointer transition-colors",
          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          isSelected ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "text-sidebar-foreground/80",
        ].join(" ")}
        style={{ paddingLeft }}
        onClick={handleSelect}
        onKeyDown={handleKeyDown}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            type="button"
            className="flex shrink-0 items-center justify-center rounded p-0.5 text-sidebar-foreground/50 hover:text-sidebar-foreground"
            onClick={handleToggle}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <CaretDownIcon className="size-3.5" weight="bold" />
            ) : (
              <CaretRightIcon className="size-3.5" weight="bold" />
            )}
          </button>
        ) : (
          <span className="inline-block size-3.5 shrink-0" />
        )}

        {/* Icon */}
        {hasChildren ? (
          <FolderIcon className="size-4 shrink-0 text-sidebar-foreground/60" weight="duotone" />
        ) : (
          <FileTextIcon className="size-4 shrink-0 text-sidebar-foreground/60" weight="duotone" />
        )}

        {/* Title */}
        <span className="truncate">{page.title}</span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div role="group">
          {F.pipe(
            page.children ?? [],
            A.map((child) => (
              <PageTreeItem
                key={child.id}
                page={child}
                depth={depth + 1}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggle={onToggle}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkspaceTree
// ---------------------------------------------------------------------------

interface WorkspaceTreeProps {
  readonly workspaceName?: string;
  readonly pages?: ReadonlyArray<WorkspacePage>;
  readonly className?: string;
  readonly onPageSelect?: (pageId: string) => void;
  readonly onAddPage?: () => void;
}

export function WorkspaceTree({
  workspaceName = "My Workspace",
  pages = MOCK_PAGES,
  className,
  onPageSelect,
  onAddPage,
}: WorkspaceTreeProps) {
  const [expandedIds, setExpandedIds] = React.useState<ReadonlySet<string>>(() => new Set(["page-1", "page-2"]));
  const [selectedId, setSelectedId] = React.useState<string | undefined>(undefined);

  const handleToggle = React.useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = React.useCallback(
    (id: string) => {
      setSelectedId(id);
      onPageSelect?.(id);
    },
    [onPageSelect]
  );

  return (
    <div data-slot="workspace-tree" className={["flex h-full flex-col", className].filter(Boolean).join(" ")}>
      {/* Workspace header */}
      <div className="flex items-center justify-between border-b border-sidebar-border px-4 py-3">
        <span className="text-sm font-semibold text-sidebar-foreground truncate">{workspaceName}</span>
      </div>

      {/* Page tree */}
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        <div role="tree" className="space-y-0.5">
          {F.pipe(
            pages,
            A.map((page) => (
              <PageTreeItem
                key={page.id}
                page={page}
                depth={0}
                expandedIds={expandedIds}
                selectedId={selectedId}
                onToggle={handleToggle}
                onSelect={handleSelect}
              />
            ))
          )}
        </div>
      </nav>

      {/* Add page button */}
      <div className="border-t border-sidebar-border px-2 py-2">
        <button
          type="button"
          className={[
            "flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
            "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          ].join(" ")}
          onClick={onAddPage}
        >
          <PlusIcon className="size-4" weight="bold" />
          <span>Add Page</span>
        </button>
      </div>
    </div>
  );
}
