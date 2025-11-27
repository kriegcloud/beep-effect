"use client";

import { LinkElement } from "@beep/ui/components/link-node";
import { LinkFloatingToolbar } from "@beep/ui/components/link-toolbar";
import { LinkPlugin } from "@platejs/link/react";

export const LinkKit = [
  LinkPlugin.configure({
    render: {
      node: LinkElement,
      afterEditable: () => <LinkFloatingToolbar />,
    },
  }),
];
