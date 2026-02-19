import { useSession } from "@beep/notes/components/auth/useSession";
import { useIsDesktop } from "@beep/notes/components/providers/tailwind-provider";
import { SearchStore } from "@beep/notes/components/search/SearchStore";
import { useToggleLeftPanel } from "@beep/notes/hooks/useResizablePanel";
import { routes } from "@beep/notes/lib/navigation/routes";
import { cn } from "@beep/notes/lib/utils";
import { useMounted } from "@beep/notes/registry/hooks/use-mounted";
import { Button } from "@beep/notes/registry/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@beep/notes/registry/ui/popover";
import { api, useTRPC } from "@beep/notes/trpc/react";
import { HouseIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { toast } from "sonner";

import { useAuthGuard } from "../auth/useAuthGuard";
import { pushModal } from "../modals";
import { Icons } from "../ui/icons";
import { DocumentList } from "./document-list";
import { NavItem } from "./nav-item";
import { SidebarSwitcher } from "./sidebar-switcher";
import { TrashBox } from "./trash-box";

export function Sidebar({ ...props }: React.HTMLAttributes<HTMLElement>) {
  const session = useSession();
  const router = useRouter();
  const isMobile = !useIsDesktop();
  const trpc = useTRPC();
  const createDocument = api.document.create.useMutation({
    onSuccess: () => {
      void trpc.document.documents.invalidate();
    },
  });
  const authGuard = useAuthGuard();
  const mounted = useMounted();

  const onCreate = () => {
    authGuard(() => {
      const promise = createDocument
        .mutateAsync({
          contentRich: [
            {
              children: [{ text: "" }],
              type: "p",
            },
          ],
        })
        .then((document) => {
          router.push(routes.document({ documentId: document.id }));
        });

      toast.promise(promise, {
        error: "Failed to create a new note!",
        loading: "Creating a new note...",
        success: "New Note created.",
      });
    });
  };

  return (
    <aside
      className={cn("group/sidebar relative z-20 flex size-full flex-col overflow-y-auto border-r", props.className)}
      {...props}
    >
      <SidebarSwitcher />

      <div className="absolute top-2 right-2 z-50 flex gap-0.5">
        <CloseButton />

        <Button
          size="navAction"
          variant="nav"
          className="size-[28px]"
          onClick={onCreate}
          tooltip="Create a new page"
          tooltipContentProps={{
            side: "right",
          }}
        >
          <Icons.newPage variant="primary" />
        </Button>
      </div>

      <div className="space-y-6 px-2">
        <div className="space-y-0.5">
          <NavItem
            onClick={() => {
              SearchStore.actions.onOpen();
            }}
            label="Search"
            icon={Icons.search}
            tooltip="Search page"
          />
          <NavItem label="Home" href={routes.home()} icon={HouseIcon} tooltip="View recent pages" />
        </div>

        <div className="space-y-0.5">
          <NavItem
            className="text-xs text-muted-foreground/90"
            onClick={() => {}}
            label={session ? "Private" : "Draft"}
          >
            <Button
              size="navAction"
              variant="navAction"
              onClick={onCreate}
              tooltip="Create a new page"
              tooltipContentProps={{
                side: "right",
              }}
            >
              <Icons.plus variant="muted" />
            </Button>
          </NavItem>

          <DocumentList />
        </div>

        <div className="space-y-0.5">
          <NavItem
            onClick={() => {
              authGuard(() => {
                pushModal("Settings");
              });
            }}
            label="Settings"
            icon={Icons.settings}
            tooltip="Manage your account and settings"
          />

          <NavItem label="Editor" href="/editor" icon={Icons.editor} />

          <NavItem label="Templates" href="https://pro.todox.com/docs/templates/app" icon={Icons.templates} />

          {mounted ? (
            <Popover>
              <PopoverTrigger
                asChild
                className="w-full"
                onClick={(e) => {
                  if (authGuard()) {
                    e.preventDefault();
                  }
                }}
              >
                <NavItem label="Trash" icon={Icons.trash} tooltip="Restore deleted pages" />
              </PopoverTrigger>

              <PopoverContent
                className="h-[50vh] max-h-[70vh] w-80 p-0"
                align="start"
                side={isMobile ? "bottom" : "right"}
              >
                <TrashBox />
              </PopoverContent>
            </Popover>
          ) : (
            <NavItem loading />
          )}
        </div>
      </div>
    </aside>
  );
}

const CloseButton = () => {
  const toggle = useToggleLeftPanel();

  return (
    <Button
      size="navAction"
      variant="nav"
      className="group/button size-[28px] opacity-100"
      onClick={() => toggle()}
      tooltip="Close sidebar"
      tooltipContentProps={{
        side: "right",
      }}
    >
      <Icons.chevronsLeft
        variant="muted"
        className="size-5 transition-opacity duration-300 group-hover/button:text-muted-foreground group-hover/sidebar:opacity-100 md:opacity-0"
      />
    </Button>
  );
};
