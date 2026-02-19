"use client";

import { IndentKit } from "@beep/ui/components/editor/plugins/indent-kit";
import { ToggleElement } from "@beep/ui/components/toggle-node";
import { TogglePlugin } from "@platejs/toggle/react";

export const ToggleKit = [...IndentKit, TogglePlugin.withComponent(ToggleElement)];
