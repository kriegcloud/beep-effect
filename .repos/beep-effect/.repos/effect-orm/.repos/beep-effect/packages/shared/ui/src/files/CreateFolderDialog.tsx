"use client";
import { createFolderAtom } from "@beep/shared-client/atom";
import { Banner } from "@beep/ui/components/banner";
import { Dialog } from "@beep/ui/components/dialog";
import { Input } from "@beep/ui/components/input";
import { Label } from "@beep/ui/components/label";
import { Result, useAtom } from "@effect-atom/atom-react";
import Button from "@mui/material/Button";
import * as Cause from "effect/Cause";
import React from "react";

type CreateFolderDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

export const CreateFolderDialog: React.FC<CreateFolderDialogProps> = ({ open, onOpenChange }) => {
  const [folderName, setFolderName] = React.useState("");
  const [createResult, createFolder] = useAtom(createFolderAtom, { mode: "promiseExit" });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!folderName.trim()) return;

    createFolder(folderName.trim()).then((result) => {
      if (result._tag === "Success") {
        setFolderName("");
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Create Folder</Dialog.Title>
          <Dialog.Description>Enter a name for the new folder.</Dialog.Description>
        </Dialog.Header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {createResult.waiting && (
            <Banner variant="loading">
              <Banner.Content>
                <Banner.Title>Creating folder "{folderName}"...</Banner.Title>
              </Banner.Content>
            </Banner>
          )}

          {!createResult.waiting && Result.isFailure(createResult) && (
            <Banner variant="destructive">
              <Banner.Content>
                <Banner.Title>Failed to create folder</Banner.Title>
                <Banner.Description className="line-clamp-2 whitespace-pre-wrap">
                  {Cause.pretty(createResult.cause)}
                </Banner.Description>
              </Banner.Content>
            </Banner>
          )}

          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              disabled={createResult.waiting}
              autoFocus
            />
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outlined"
              onClick={() => onOpenChange(false)}
              disabled={createResult.waiting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createResult.waiting || !folderName.trim()}>
              {createResult.waiting ? "Creating..." : "Create Folder"}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};
