import { aiValue } from "./ai-value";
import { blockMenuValue } from "./block-menu-value";
import { calloutValue } from "./callout-value";
import { copilotValue } from "./copilot-value";
import { equationValue } from "./equation-value";
import { floatingToolbarValue } from "./floating-toolbar-value";
import { mediaToolbarValue } from "./media-toolbar-value";
import { slashMenuValue } from "./slash-menu-value";
import { tocValue } from "./toc-value";
import { uploadValue } from "./upload-value";

export const playgroundValue = [
  ...tocValue,
  ...aiValue,
  ...copilotValue,
  ...calloutValue,
  ...equationValue,
  ...uploadValue,
  ...slashMenuValue,
  ...blockMenuValue,
  ...floatingToolbarValue,
  ...mediaToolbarValue,
];
