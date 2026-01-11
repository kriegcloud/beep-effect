"use client";
import { filesAtom, StartUploadInput, selectedFilesAtom, startUploadAtom } from "@beep/shared-client/atom";
import { EntityKind, SharedEntityIds } from "@beep/shared-domain";
import { File } from "@beep/shared-domain/entities";
import { DropdownMenu } from "@beep/ui/components/dropdown-menu";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import Button from "@mui/material/Button";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as FC from "effect/FastCheck";
import * as F from "effect/Function";
import { FolderInput, FolderPlus, Plus, Trash2Icon, Upload } from "lucide-react";
import React from "react";
import { CreateFolderDialog } from "./CreateFolderDialog.tsx";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog.tsx";
import { MoveFilesDialog } from "./MoveFilesDialog.tsx";

const mockMetadata = F.constant(FC.sample(Arbitrary.make(File.Model.fields.metadata), 1)[0]!);

const FilesLoadingBar = () => {
  return <div className="h-1 bg-primary rounded-full w-full animate-pulse" />;
};

export const FilesLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const filesResult = useAtomValue(filesAtom);
  const selection = useAtomValue(selectedFilesAtom);
  const startUpload = useAtomSet(startUploadAtom);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  const hasSelection = !A.isEmptyArray(selection.fileIds) || !A.isEmptyArray(selection.folderIds);
  const canMoveFiles = !A.isEmptyArray(selection.fileIds) && A.isEmptyArray(selection.folderIds);

  return (
    <div className="flex flex-col h-full p-8">
      <div className="shrink-0 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Files</h2>
            <p className="text-sm text-muted-foreground">Browse and organize your uploaded files and folders.</p>
          </div>

          <div className="flex items-center gap-2">
            {hasSelection ? (
              <Button variant="contained" color={"warning"} size="small" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            ) : null}

            {canMoveFiles ? (
              <Button variant="outlined" size="small" onClick={() => setMoveDialogOpen(true)}>
                <FolderInput className="h-4 w-4" />
                Move to...
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="outlined" size="small">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="end">
                <DropdownMenu.Item
                  onClick={() => {
                    startUpload(
                      StartUploadInput.makeRoot({
                        entityKind: EntityKind.Enum.shared_user,
                        entityIdentifier: SharedEntityIds.UserId.create(),
                        entityAttribute: "image",
                        metadata: mockMetadata(),
                      })
                    );
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </DropdownMenu.Item>

                <DropdownMenu.Item onClick={() => setCreateFolderDialogOpen(true)}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu>
          </div>
        </div>

        <div className="h-1">{hydrated && filesResult.waiting ? <FilesLoadingBar /> : null}</div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 mt-8">{children}</div>

      <CreateFolderDialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen} />
      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      <MoveFilesDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen} />
    </div>
  );
};
