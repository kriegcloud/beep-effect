import { LinkFloatingToolbar } from "@beep/notes/components/editor/ui/link-floating-toolbar-app";
import { LinkElement } from "@beep/notes/components/editor/ui/link-node-app";
import { linkPlugin } from "@beep/notes/registry/components/editor/plugins/link-kit";

export const LinkKit = [
  linkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
