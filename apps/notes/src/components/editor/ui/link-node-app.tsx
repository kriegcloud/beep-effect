"use client";

import { useSession } from "@beep/notes/components/auth/useSession";
import { templateList } from "@beep/notes/components/editor/utils/useTemplateDocument";
import type { MyLinkElement } from "@beep/notes/registry/components/editor/plate-types";
import { linkPlugin } from "@beep/notes/registry/components/editor/plugins/link-kit";
import { Button } from "@beep/notes/registry/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@beep/notes/registry/ui/hover-card";
import { useTRPC } from "@beep/notes/trpc/react";
import type { UnsafeTypes } from "@beep/types";
import { useLink } from "@platejs/link/react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRightIcon, CopyIcon, FileTextIcon, LinkIcon } from "lucide-react";
import { PlateElement, type PlateElementProps, useEditorPlugin, useElement, usePluginOption } from "platejs/react";
import * as React from "react";

export function LinkElement(props: PlateElementProps) {
  const element = useElement<MyLinkElement>();
  const { props: linkProps } = useLink({ element });
  const { api, setOption } = useEditorPlugin(linkPlugin);

  const activeLinkId = usePluginOption(linkPlugin, "activeId");
  const mode = usePluginOption(linkPlugin, "mode");
  const open = activeLinkId === element.id && mode === "hover";

  const isInternal = element.url.startsWith("/");

  const onCopy = () => {
    const urlToCopy = isInternal ? `${window.location.origin}${element.url}` : element.url;

    void navigator.clipboard.writeText(urlToCopy);
  };

  return (
    <HoverCard
      open={open}
      onOpenChange={(open) => {
        setOption("mode", open ? "hover" : null);
        setOption("activeId", open ? element.id : null);
      }}
      closeDelay={0}
      openDelay={0}
    >
      <HoverCardTrigger asChild>
        <span>
          <PlateElement
            as="a"
            {...props}
            className="cursor-pointer border-b-1 font-medium text-primary/65"
            attributes={{
              ...props.attributes,
              ...(linkProps as UnsafeTypes.UnsafeAny),
              onClick: () => {
                window.open(element.url, isInternal ? "_self" : "_blank");
              },
              onMouseDown: (e) => e.preventDefault(),
            }}
          >
            {props.children}
          </PlateElement>
        </span>
      </HoverCardTrigger>
      <HoverCardContent className="w-fit animate-none px-1.5 py-1">
        <div className="flex items-center">
          <LinkPreview element={element} />
          <Button variant="ghost" className="ml-1 shrink-0 px-2 py-1" onClick={onCopy}>
            <CopyIcon className="size-3! shrink-0" />
          </Button>
          <Button
            variant="ghost"
            className="shrink-0 px-2 py-1"
            onClick={() => {
              setOption("activeId", element.id);
              api.a.show({ linkElement: element, mode: "edit" });
            }}
          >
            <span className="text-xs">Edit</span>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

const LinkPreview = ({ element }: { element: MyLinkElement }) => {
  const { editor } = useEditorPlugin(linkPlugin);

  const isInternal = element.url.startsWith("/");

  const session = useSession();
  const trpc = useTRPC();

  const { data } = useQuery({
    ...trpc.document.document.queryOptions({ id: element.url.slice(1) }),
    enabled: !!session && isInternal,
  });

  const document = session ? data?.document : templateList.find((template) => template.id === element.url.slice(1));

  const Icon = <span>{element.icon ? <span>{element.icon}</span> : <FileTextIcon className="size-4" />}</span>;

  React.useEffect(() => {
    if (!document) return;
    if (document.title !== element.title || document.icon !== element.icon) {
      editor.tf.setNodes(
        { icon: document.icon, title: document.title },
        {
          at: [],
          mode: "lowest",
          match: (n) => n.type === linkPlugin.key && n.id === element.id,
        }
      );
    }
  }, [document]);

  return (
    <div className="flex items-center gap-1 text-primary/65">
      {element.title ? (
        <React.Fragment>
          <span className="relative mr-3">
            {Icon}
            <ArrowUpRightIcon className="absolute -right-3 bottom-0 size-3.5 font-bold" />
          </span>
          <span className="h-6 max-w-[200px] truncate text-sm leading-6">{element.title}</span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <LinkIcon className="mt-px mr-1 size-3.5 shrink-0" />
          <span className="h-6 max-w-[200px] truncate text-sm leading-6">{element.url}</span>
        </React.Fragment>
      )}
    </div>
  );
};
