import type * as Data from "effect/Data";

export type SyncStatus = Data.TaggedEnum<{
  notSynced: {};
  syncing: {
    current?: number;
    total?: number;
  };
  synced: {};
  error: {
    message: string;
  };
}>;

// export const SyncStatus   = Data.taggedEnum<SyncStatus>();

export type AdapterSyncItem = {
  readonly module: string;
  readonly entity: string;
  readonly parent?: string;
  readonly status: SyncStatus;
};
