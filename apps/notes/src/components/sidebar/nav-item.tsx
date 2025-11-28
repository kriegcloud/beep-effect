"use client";

import { useCurrentUser } from "@beep/notes/components/auth/useCurrentUser";
import { routes } from "@beep/notes/lib/navigation/routes";
import { cn } from "@beep/notes/lib/utils";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import { Button } from "@beep/notes/registry/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@beep/notes/registry/ui/dropdown-menu";
import { TooltipTC } from "@beep/notes/registry/ui/tooltip";
import { useArchiveDocumentMutation } from "@beep/notes/trpc/hooks/document-hooks";
import { api, useTRPC } from "@beep/notes/trpc/react";
import { format } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthGuard } from "../auth/useAuthGuard";
import type { IconFC } from "../ui/icon";
import { Icons } from "../ui/icons";
import { Skeleton } from "../ui/skeleton";

interface ItemProps {
  id?: string;
  active?: boolean;
  children?: React.ReactNode;
  className?: string;
  documentIcon?: string | null;
  expanded?: boolean;
  href?: string;
  icon?: IconFC;
  isSearch?: boolean;
  label?: string;
  level?: number;
  loading?: boolean;
  tooltip?: string;
  updatedAt?: Date;
  onClick?: () => void;
  onExpand?: () => void;
}

export function NavItem({
  id,
  active,
  children,
  className,
  documentIcon,
  expanded,
  href,
  icon: Icon,
  label,
  level = 0,
  loading,
  tooltip,
  updatedAt,
  onClick,
  onExpand: onExpandProp,
}: ItemProps & React.ComponentProps<"div">) {
  const authGuard = useAuthGuard();

  const ChevronIcon = expanded ? Icons.chevronDown : Icons.chevronRight;

  const user = useCurrentUser();

  const router = useRouter();
  const mounted = useMounted();

  const trpc = useTRPC();
  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
    },
  });
  const archiveDocument = useArchiveDocumentMutation();

  const onArchive = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();

    if (!id) return;

    const promise = archiveDocument.mutateAsync({ id });

    toast.promise(promise, {
      error: "Failed to archive note!",
      loading: "Moving to trash...",
      success: "Note moved to trash.",
    });
  };

  const onExpand = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    onExpandProp?.();
  };

  const onCreate = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    if (!id) return;

    const promise = createDocument.mutateAsync({ parentDocumentId: id }).then((document) => {
      if (!expanded) {
        onExpandProp?.();
      }

      router.push(routes.document({ documentId: document.id }));
    });

    toast.promise(promise, {
      error: "Failed to create a new note!",
      loading: "Creating a new note...",
      success: "New Note created.",
    });
  };

  const content = (
    <div
      className={cn(
        "group flex min-h-[27px] cursor-pointer items-center rounded-md py-1 text-sm font-medium text-subtle-foreground hover:bg-primary/[.04]",
        active && "bg-primary/[.04] text-primary",
        className
      )}
      style={{ paddingLeft: `${(level + 1) * 8}px` }}
      onClick={onClick}
      role="button"
    >
      {loading ? (
        <>
          <Skeleton className="mr-2 size-4 rounded-sm" />
          <Skeleton className="h-4 w-3/5" />
        </>
      ) : (
        <>
          {(documentIcon || Icon) && (
            <Button
              size="navAction"
              variant={id ? "navAction" : "none"}
              className="relative mr-2 opacity-100"
              onClick={id ? onExpand : undefined}
            >
              {documentIcon ? (
                <div className="shrink text-[18px] transition-opacity duration-200 select-none group-hover:opacity-0">
                  {documentIcon}
                </div>
              ) : (
                Icon && (
                  <Icon
                    variant="muted"
                    className={cn(
                      "size-5 shrink text-muted-foreground/80 transition-opacity duration-200",
                      !!id && "size-4 group-hover:opacity-0"
                    )}
                  />
                )
              )}
              {!!id && (
                <ChevronIcon className="absolute top-0.5 left-0.5 size-4 shrink text-muted-foreground/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              )}
            </Button>
          )}

          <span className="truncate select-none">{label}</span>
        </>
      )}

      <div className="mr-0.5 ml-auto flex items-center gap-x-1">
        {!!id && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="navAction"
                  variant="navAction"
                  onClick={(e) => {
                    return e.stopPropagation();
                  }}
                  tooltip="Delete"
                  tooltipContentProps={{
                    side: "bottom",
                  }}
                >
                  <Icons.moreX variant="muted" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="right">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={(e) => authGuard(() => onArchive(e))}>
                    <Icons.trash />
                    Move to Trash
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                {user.id && (
                  <div>
                    <DropdownMenuSeparator />
                    <div className="space-y-1 p-2 text-xs text-muted-foreground/90">
                      <div>Last edited by {user?.name}</div>
                      <div>{updatedAt && format(new Date(updatedAt), "MMM d, yyyy, h:mm a")}</div>
                    </div>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="navAction"
              variant="navAction"
              onClick={(e) => authGuard(() => onCreate(e))}
              tooltip="Add a page inside"
              tooltipContentProps={{
                side: "bottom",
              }}
            >
              <Icons.plus variant="muted" />
            </Button>
          </>
        )}

        {children}
      </div>
    </div>
  );

  const wrappedElement =
    mounted && href ? (
      <Link href={href} target={href.startsWith("http") ? "_blank" : ""}>
        {content}
      </Link>
    ) : (
      content
    );

  if (tooltip && mounted) {
    return (
      <TooltipTC content={tooltip} side="right">
        {wrappedElement}
      </TooltipTC>
    );
  }

  return wrappedElement;
}

export function NavItemSkeleton({ level }: { level?: number }) {
  return (
    <div
      className="flex gap-x-2 py-[3px] pl-2"
      style={{
        paddingLeft: level ? `${level * 8}px` : "8px",
      }}
    >
      <Skeleton className="size-4" />
      <Skeleton className="h-4 w-[30%]" />
    </div>
  );
}
