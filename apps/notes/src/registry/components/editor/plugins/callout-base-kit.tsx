import { CalloutElementStatic } from "@beep/notes/registry/ui/callout-node-static";
import { BaseCalloutPlugin } from "@platejs/callout";

export const BaseCalloutKit = [BaseCalloutPlugin.withComponent(CalloutElementStatic)];
