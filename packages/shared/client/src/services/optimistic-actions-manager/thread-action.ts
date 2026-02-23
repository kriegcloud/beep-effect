import { $SharedClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedClientId.create("services/optimistic-actions-manager/thread-action");

export class ThreadDestination extends BS.StringLiteralKit("inbox", "archive", "spam", "bin", "snoozed").annotations(
  $I.annotations("ThreadDestination", {
    title: "Thread Destination",
    description:
      "Valid target locations for email thread move operations. Represents the Gmail system folders where threads can be relocated during optimistic updates.",
  })
) {}

export declare namespace ThreadDestination {
  export type Type = typeof ThreadDestination.Type;
}

export class FolderLocation extends BS.StringLiteralKit("inbox", "archive", "spam", "sent", "bin").annotations(
  $I.annotations("FolderLocation", {
    title: "Folder Location",
    description:
      "Gmail folder location identifiers representing the current location of an email thread. Used to track the source folder in move operations and for folder-based filtering.",
  })
) {}

export declare namespace FolderLocation {
  export type Type = typeof FolderLocation.Type;
}
