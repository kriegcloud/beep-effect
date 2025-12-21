import { PackageOpenIcon } from "lucide-react";
import type React from "react";

export const FilesEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-secondary/50 px-6 py-12 text-center">
      <PackageOpenIcon className="mb-4 size-10 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-semibold">No Files Yet</h3>
      <p className="max-w-md text-sm text-muted-foreground">Upload files or create folders to see them listed here.</p>
    </div>
  );
};
