"use client";

import type { MyLinkElement } from "@beep/notes/registry/components/editor/plate-types";
import { type BaseLinkConfig, BaseLinkPlugin } from "@platejs/link";
import { CursorOverlayPlugin } from "@platejs/selection/react";
import type { ExtendConfig } from "platejs";
import { Key, toTPlatePlugin, useEditorSelector, usePluginOption } from "platejs/react";

import { getCursorOverlayElement } from "@/registry/ui/cursor-overlay";
import { LinkElement } from "@/registry/ui/link-node";
import { LinkFloatingToolbar } from "@/registry/ui/link-toolbar";

export type FloatingLinkMode = "cursor" | "edit" | "hover" | "insert" | null;

export type LinkConfig = ExtendConfig<
  BaseLinkConfig,
  {
    activeId: string | null;
    anchorElement: HTMLElement | null;
    mode: FloatingLinkMode;
  },
  {
    a: {
      show: (options?: LinkShowOptions) => void;
    };
  }
>;

export type LinkShowOptions = {
  anchorElement?: HTMLElement;
  linkElement?: MyLinkElement;
  mode?: FloatingLinkMode;
};

/** Enables support for hyperlinks. */
export const linkPlugin = toTPlatePlugin<LinkConfig>(BaseLinkPlugin, {
  options: {
    activeId: null,
    anchorElement: null,
    mode: null,
  },
  render: { afterEditable: () => <LinkFloatingToolbar /> },
})
  .extendApi<Partial<LinkConfig["api"]["a"]>>(({ editor, setOption }) => ({
    show({ linkElement, mode = "insert" } = {}) {
      if (linkElement) {
        editor.tf.select(linkElement);
      }

      editor.tf.blur();

      editor.getApi(CursorOverlayPlugin).cursorOverlay.addCursor("selection", {
        selection: editor.selection,
      });

      setTimeout(() => {
        setOption("mode", mode);
        setOption("anchorElement", getCursorOverlayElement() as HTMLElement);
      }, 0);
    },
  }))
  .extend({
    shortcuts: {
      toggleLink: {
        keys: [[Key.Mod, "k"]],
        preventDefault: true,
        handler: ({ editor }) => {
          editor.getApi(linkPlugin).a.show();
        },
      },
    },
  });

export const useActiveLink = () => {
  const mode = usePluginOption(linkPlugin, "mode");
  const activeLinkId = usePluginOption(linkPlugin, "activeId");

  const editingLinkEntry = useEditorSelector(
    (editor) => {
      if (!mode) return;

      return editor.api.node<MyLinkElement>({
        at: [],
        mode: "lowest",
        match: (n) => n.type === linkPlugin.key && n.id === activeLinkId,
      });
    },
    [activeLinkId]
  );

  return editingLinkEntry;
};

export const LinkKit = [linkPlugin.configure({ node: { component: LinkElement } })];
