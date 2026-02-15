"use client";

import { XIcon } from "@phosphor-icons/react";
import * as React from "react";

// ---------------------------------------------------------------------------
// CreateWorkspaceDialog
// ---------------------------------------------------------------------------

interface CreateWorkspaceDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSubmit?: (data: { readonly name: string; readonly description: string }) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange, onSubmit }: CreateWorkspaceDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const handleClose = React.useCallback(() => {
    onOpenChange(false);
    setName("");
    setDescription("");
  }, [onOpenChange]);

  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.({ name, description });
      handleClose();
    },
    [name, description, onSubmit, handleClose]
  );

  if (!open) return null;

  return (
    <div
      data-slot="create-workspace-dialog-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleClose}
      onKeyDown={undefined}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-workspace-title"
        className={[
          "relative w-full max-w-md rounded-xl border border-border bg-popover p-6 shadow-lg",
          "animate-in fade-in-0 zoom-in-95",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 id="create-workspace-title" className="text-lg font-semibold text-foreground">
            Create Workspace
          </h2>
          <button
            type="button"
            className="flex items-center justify-center rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            onClick={handleClose}
            aria-label="Close"
          >
            <XIcon className="size-4" weight="bold" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              required
              className={[
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              ].join(" ")}
            />
          </div>

          {/* Description field */}
          <div className="space-y-1.5">
            <label htmlFor="workspace-description" className="text-sm font-medium text-foreground">
              Description
              <span className="ml-1 text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              id="workspace-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this workspace about?"
              rows={3}
              className={[
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none",
                "placeholder:text-muted-foreground",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              ].join(" ")}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              className={[
                "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              ].join(" ")}
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={[
                "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:pointer-events-none disabled:opacity-50",
              ].join(" ")}
              disabled={name.trim().length === 0}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
