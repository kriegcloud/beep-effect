"use client";

import { Icons } from "@beep/notes/components/ui/icons";

export const Empty = ({ title }: { title?: string }) => {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="flex flex-col items-center">
        <Icons.messages variant="muted" className="size-14" />
        <span className="mt-3 text-sm font-semibold text-muted-foreground"> {title ?? "No relevant data found."}</span>
      </div>
    </div>
  );
};
