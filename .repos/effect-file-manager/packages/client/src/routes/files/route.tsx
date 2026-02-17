import { Button } from "@/components/ui/button";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import * as Arr from "effect/Array";
import { FolderInput, FolderPlus, Plus, Trash2Icon, Upload } from "lucide-react";
import React from "react";
import { CreateFolderDialog } from "./-files-layout/create-folder-dialog";
import { DeleteConfirmationDialog } from "./-files-layout/delete-confirmation-dialog";
import { MoveFilesDialog } from "./-files-layout/move-files-dialog";
import { filesAtom, selectedFilesAtom, startUploadAtom } from "./-files/files-atoms";

const FilesLoadingBar = () => {
  return <div className="h-1 bg-primary rounded-full w-full animate-pulse" />;
};

const FilesLayoutRoute = () => {
  const filesResult = useAtomValue(filesAtom);
  const selection = useAtomValue(selectedFilesAtom);
  const startUpload = useAtomSet(startUploadAtom);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false);

  const hasSelection =
    !Arr.isEmptyArray(selection.fileIds) || !Arr.isEmptyArray(selection.folderIds);
  const canMoveFiles =
    !Arr.isEmptyArray(selection.fileIds) && Arr.isEmptyArray(selection.folderIds);

  return (
    <div className="flex flex-col h-full p-8">
      <div className="shrink-0 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Files</h2>
            <p className="text-sm text-muted-foreground">
              Browse and organize your uploaded files and folders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasSelection ? (
              <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2Icon className="h-4 w-4" />
                Delete
              </Button>
            ) : null}

            {canMoveFiles ? (
              <Button variant="outline" size="sm" onClick={() => setMoveDialogOpen(true)}>
                <FolderInput className="h-4 w-4" />
                Move to...
              </Button>
            ) : null}

            <DropdownMenu>
              <DropdownMenu.Trigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                  New
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content align="end">
                <DropdownMenu.Item onClick={() => startUpload({ _tag: "Root" })}>
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

        <div className="h-1">{filesResult.waiting ? <FilesLoadingBar /> : null}</div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 mt-8">
        <Outlet />
      </div>

      <CreateFolderDialog open={createFolderDialogOpen} onOpenChange={setCreateFolderDialogOpen} />
      <DeleteConfirmationDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} />
      <MoveFilesDialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen} />
    </div>
  );
};

export const Route = createFileRoute("/files")({
  component: FilesLayoutRoute,
});
