import { $SharedClientId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkNull } from "@beep/utils";
import type * as HashSet from "effect/HashSet";
import * as MutableHashMap from "effect/MutableHashMap";
import * as S from "effect/Schema";
import { ThreadDestination } from "./thread-action.ts";

const $I = $SharedClientId.create("services/optimistic-actions-manager/constants");

export class PendingActionType extends BS.StringLiteralKit(
  "MOVE",
  "STAR",
  "READ",
  "LABEL",
  "IMPORTANT",
  "SNOOZE",
  "UNSNOOZE"
).annotations(
  $I.annotations("PendingActionType", {
    title: "Pending Action Type",
    description:
      "Discriminator for optimistic thread actions. Each type represents a distinct operation that can be applied to email threads while awaiting server confirmation.",
  })
) {}

export declare namespace PendingActionType {
  export type Type = typeof PendingActionType.Type;
}

const makePendingActionClass = PendingActionType.toTagged("type").composer({
  id: S.String.annotations({
    title: "Action ID",
    description: "Unique identifier for this pending action instance",
  }),
  threadIds: S.Array(
    S.String.annotations({
      description: "Gmail thread identifier",
    })
  ).annotations({
    title: "Thread IDs",
    description: "List of email thread IDs affected by this optimistic action",
  }),
  optimisticId: S.String.annotations({
    title: "Optimistic ID",
    description: "Client-generated identifier for correlating the optimistic update with the server response",
  }),
  toastId: S.optionalWith(S.Union(S.String, S.Number), { as: "Option" }).annotations({
    title: "Toast ID",
    description:
      "Optional identifier for the associated toast notification, used to dismiss or update the toast on action completion",
  }),
});

export class MoveAction extends S.Class<MoveAction>($I`MoveAction`)(
  makePendingActionClass.MOVE({
    params: S.Struct({
      currentFolder: S.String.annotations({
        title: "Current Folder",
        description: "The folder location from which the thread is being moved",
      }),
      destination: ThreadDestination.annotations({
        title: "Destination",
        description: "Target folder where the thread will be relocated",
      }),
    }).annotations({
      title: "Move Parameters",
      description: "Configuration for the thread move operation",
    }),
  }),
  $I.annotations("MoveAction", {
    title: "Move Action",
    description:
      "Optimistic action representing the relocation of email threads between folders (inbox, archive, spam, bin, snoozed)",
  })
) {}

export class StarAction extends S.Class<StarAction>($I`StarAction`)(
  makePendingActionClass.STAR({
    params: S.Struct({
      starred: S.Boolean.annotations({
        title: "Starred",
        description: "Target star state: true to add star, false to remove",
      }),
    }).annotations({
      title: "Star Parameters",
      description: "Configuration for the thread star toggle operation",
    }),
  }),
  $I.annotations("StarAction", {
    title: "Star Action",
    description: "Optimistic action representing the starring or unstarring of email threads",
  })
) {}

export class ReadAction extends S.Class<ReadAction>($I`ReadAction`)(
  makePendingActionClass.READ({
    params: S.Struct({
      read: S.Boolean.annotations({
        title: "Read",
        description: "Target read state: true to mark as read, false to mark as unread",
      }),
    }).annotations({
      title: "Read Parameters",
      description: "Configuration for the thread read status toggle operation",
    }),
  }),
  $I.annotations("ReadAction", {
    title: "Read Action",
    description: "Optimistic action representing marking email threads as read or unread",
  })
) {}

export class LabelAction extends S.Class<LabelAction>($I`LabelAction`)(
  makePendingActionClass.LABEL({
    params: S.Struct({
      label: S.String.annotations({
        title: "Label",
        description: "Gmail label identifier to add or remove from the thread",
      }),
      add: S.Boolean.annotations({
        title: "Add Label",
        description: "Operation mode: true to add the label, false to remove it",
      }),
    }).annotations({
      title: "Label Parameters",
      description: "Configuration for the thread label modification operation",
    }),
  }),
  $I.annotations("LabelAction", {
    title: "Label Action",
    description: "Optimistic action representing the addition or removal of Gmail labels from email threads",
  })
) {}

export class ImportantAction extends S.Class<ImportantAction>($I`ImportantAction`)(
  makePendingActionClass.IMPORTANT({
    params: S.Struct({
      important: S.Boolean.annotations({
        title: "Important",
        description: "Target importance state: true to mark as important, false to remove importance",
      }),
    }).annotations({
      title: "Important Parameters",
      description: "Configuration for the thread importance toggle operation",
    }),
  }),
  $I.annotations("ImportantAction", {
    title: "Important Action",
    description: "Optimistic action representing marking email threads as important or not important",
  })
) {}

export class PendingAction extends S.Union(
  MoveAction,
  StarAction,
  ReadAction,
  LabelAction,
  ImportantAction
).annotations(
  $I.annotations("PendingAction", {
    title: "Pending Action",
    description:
      "Discriminated union of all optimistic thread actions. Each variant represents a specific operation (move, star, read, label, important) that is applied optimistically to the UI while awaiting server confirmation.",
  })
) {}

export declare namespace PendingAction {
  export type Type = typeof PendingAction.Type;
  export type Encoded = typeof PendingAction.Encoded;
}

export class OptimisticActionsManager extends S.Class<OptimisticActionsManager>($I`OptimisticActionsManager`)(
  {
    pendingActions: S.optionalWith(
      BS.MutableHashMap({
        key: S.String.annotations({
          description: "Action ID serving as the map key",
        }),
        value: PendingAction,
      }).annotations({
        title: "Pending Actions Map",
        description: "Mutable map of action IDs to their corresponding pending action details",
      }),
      {
        default: MutableHashMap.empty<string, PendingAction.Type>,
      }
    ).annotations({
      title: "Pending Actions",
      description: "Map tracking all currently pending optimistic actions by their unique action ID",
    }),
    pendingActionsByType: S.optionalWith(
      BS.MutableHashMap({
        key: S.String.annotations({
          description: "Action type discriminator (MOVE, STAR, READ, etc.)",
        }),
        value: S.HashSet(
          S.String.annotations({
            description: "Thread ID affected by this action type",
          })
        ).annotations({
          description: "Set of thread IDs with pending actions of this type",
        }),
      }).annotations({
        title: "Pending Actions By Type Map",
        description: "Index mapping action types to the set of thread IDs with pending actions of that type",
      }),
      {
        default: MutableHashMap.empty<string, HashSet.HashSet<string>>,
      }
    ).annotations({
      title: "Pending Actions By Type",
      description:
        "Secondary index for efficient lookup of pending actions by action type, enabling quick determination of whether a thread has a pending action of a specific type",
    }),
    lastActionId: S.optionalWith(S.NullOr(S.String), {
      default: thunkNull,
    }).annotations({
      title: "Last Action ID",
      description:
        "The most recently created action ID, used for action correlation and undo operations. Null when no actions have been performed.",
    }),
  },
  $I.annotations("OptimisticActionsManager", {
    title: "Optimistic Actions Manager",
    description:
      "State container managing optimistic UI updates for email thread operations. Tracks pending actions, maintains indexes for efficient lookup, and supports action correlation for undo/confirmation flows.",
  })
) {}
