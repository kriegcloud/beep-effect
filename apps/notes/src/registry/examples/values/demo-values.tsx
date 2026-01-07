import { aiValue } from "@beep/notes/registry/examples/values/ai-value";
import { basicElementsValue } from "@beep/notes/registry/examples/values/basic-elements-value";
import { basicMarksValue } from "@beep/notes/registry/examples/values/basic-marks-value";
import { basicNodesValue } from "@beep/notes/registry/examples/values/basic-nodes-value";
import { blockMenuValue } from "@beep/notes/registry/examples/values/block-menu-value";
import { calloutValue } from "@beep/notes/registry/examples/values/callout-value";
import { columnValue } from "@beep/notes/registry/examples/values/column-value";
import { copilotValue } from "@beep/notes/registry/examples/values/copilot-value";
import { dateValue } from "@beep/notes/registry/examples/values/date-value";
import { discussionValue } from "@beep/notes/registry/examples/values/discussion-value";
import { dndValue } from "@beep/notes/registry/examples/values/dnd-value";
import { emojiValue } from "@beep/notes/registry/examples/values/emoji-value";
import { equationValue } from "@beep/notes/registry/examples/values/equation-value";
import { floatingToolbarValue } from "@beep/notes/registry/examples/values/floating-toolbar-value";
import { horizontalRuleValue } from "@beep/notes/registry/examples/values/horizontal-rule-value";
import { linkValue } from "@beep/notes/registry/examples/values/link-value";
import { mediaToolbarValue } from "@beep/notes/registry/examples/values/media-toolbar-value";
import { mediaValue } from "@beep/notes/registry/examples/values/media-value";
import { mentionValue } from "@beep/notes/registry/examples/values/mention-value";
import { selectionValue } from "@beep/notes/registry/examples/values/selection-value";
import { slashMenuValue } from "@beep/notes/registry/examples/values/slash-menu-value";
import { tableValue } from "@beep/notes/registry/examples/values/table-value";
import { uploadValue } from "@beep/notes/registry/examples/values/upload-value";

const values = {
  "ai-demo": aiValue,
  "basic-elements-demo": basicElementsValue,
  "basic-marks-demo": basicMarksValue,
  "basic-nodes-demo": basicNodesValue,
  "block-menu-demo": blockMenuValue,
  "block-selection-demo": selectionValue,
  "callout-demo": calloutValue,
  "column-demo": columnValue,
  "copilot-demo": copilotValue,
  "date-demo": dateValue,
  "discussion-demo": discussionValue,
  "dnd-demo": dndValue,
  "emoji-demo": emojiValue,
  "equation-demo": equationValue,
  "floating-toolbar-demo": floatingToolbarValue,
  // 'font-demo': fontValue,
  "horizontal-rule-demo": horizontalRuleValue,
  "link-demo": linkValue,
  // 'list-demo': listValue,
  "media-demo": mediaValue,
  "media-toolbar-demo": mediaToolbarValue,
  "mention-demo": mentionValue,
  "slash-menu-demo": slashMenuValue,
  "table-demo": tableValue,
  "upload-demo": uploadValue,
};

export const DEMO_VALUES = Object.entries(values).reduce(
  (acc, [key, value]) => {
    const demoKey = key.replace("Value", "-demo");
    acc[demoKey] = value;

    return acc;
  },
  // biome-ignore lint/suspicious/noExplicitAny: Platejs demo values are untyped fragments
  {} as Record<string, any>
);
