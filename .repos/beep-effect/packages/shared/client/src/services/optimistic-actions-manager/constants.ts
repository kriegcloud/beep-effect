import { $SharedClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedClientId.create("services/optimistic-actions-manager/constants");

export class Folders extends BS.StringLiteralKit(
  "spam",
  "inbox",
  "archive",
  "bin",
  "draft",
  "sent",
  "snoozed"
).annotations(
  $I.annotations("Folders", {
    title: "Email Folders",
    description:
      "Gmail folder identifiers used for organizing and categorizing email threads. Corresponds to standard Gmail system folders and virtual folders.",
  })
) {}

export declare namespace Folders {
  export type Type = typeof Folders.Type;
}

export class Labels extends BS.StringLiteralKit(
  "SPAM",
  "INBOX",
  "UNREAD",
  "IMPORTANT",
  "SENT",
  "TRASH",
  "SNOOZED"
).annotations(
  $I.annotations("Labels", {
    title: "Gmail Labels",
    description:
      "Gmail label identifiers used in the Gmail API for filtering and modifying thread labels. These are the uppercase system label names as used in Gmail API requests.",
  })
) {}

export declare namespace Labels {
  export type Type = typeof Labels.Type;
}

// export class FolderTags extends
