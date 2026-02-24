"use client";

import { IndentKit } from "@beep/notes/registry/components/editor/plugins/indent-kit";
import { ToggleElement } from "@beep/notes/registry/ui/toggle-node";
import { TogglePlugin } from "@platejs/toggle/react";

export const ToggleKit = [...IndentKit, TogglePlugin.withComponent(ToggleElement)];
