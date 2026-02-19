"use client";

import { useDocumentId } from "@beep/notes/lib/navigation/routes";
import { Button } from "@beep/notes/registry/ui/button";
import { Input } from "@beep/notes/registry/ui/input";
import { useUpdateDocumentTitle } from "@beep/notes/trpc/hooks/document-hooks";
import { useDocumentQueryOptions } from "@beep/notes/trpc/hooks/query-options";
import { useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { useAuthGuard } from "../auth/useAuthGuard";
import { getTemplateDocument } from "../editor/utils/useTemplateDocument";
import { Skeleton } from "../ui/skeleton";

export const NavTitle = () => {
  const authGuard = useAuthGuard();
  const documentId = useDocumentId();

  const queryOptions = useDocumentQueryOptions();
  const { data: _title, isLoading } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.title,
  });
  const title = queryOptions.enabled ? _title : getTemplateDocument(documentId)?.title;

  const { data: icon } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.icon,
  });

  const { data: isArchived } = useQuery({
    ...queryOptions,
    select: (data) => data.document?.isArchived,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const updateTitle = useUpdateDocumentTitle();

  const enableInput = () => {
    if (isArchived) return;

    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.value = title ?? "";
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }, 0);
  };

  const disableInput = () => {
    setIsEditing(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTitle({ id: documentId, title: e.target.value });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      disableInput();
    }
  };

  if (isLoading) {
    return <NavTitleSkeleton />;
  }

  return (
    <div className="flex items-center gap-x-1">
      {!!icon && <p className="select-none">{icon}</p>}
      {isEditing ? (
        <Input
          ref={inputRef}
          variant="flat"
          className="h-7 px-2"
          onBlur={disableInput}
          onChange={onChange}
          // onClick={enableInput}
          onKeyDown={onKeyDown}
          placeholder="Untitled"
        />
      ) : (
        <Button variant="ghost" className="line-clamp-1 h-auto p-1" onClick={() => authGuard(enableInput)}>
          <div className="w-[180px] truncate text-left">{title}</div>
        </Button>
      )}
    </div>
  );
};

export function NavTitleSkeleton() {
  return <Skeleton className="h-[28px] w-20 rounded-md" />;
}
