"use client";

import { CalloutElement } from "@beep/notes/registry/ui/callout-node";
import { CalloutPlugin } from "@platejs/callout/react";

export const CalloutKit = [CalloutPlugin.withComponent(CalloutElement)];
