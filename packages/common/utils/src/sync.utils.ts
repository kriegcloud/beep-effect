import type * as Data from "effect/Data";

export type SyncStatus = Data.TaggedEnum<{
  readonly notSynced: {};
  readonly syncing: {
    readonly current?: number | undefined;
    readonly total?: number | undefined;
  };
  readonly synced: {};
  readonly error: {
    readonly message: string;
  };
}>;

// export const SyncStatus   = Data.taggedEnum<SyncStatus>();

export type AdapterSyncItem = {
  readonly module: string;
  readonly entity: string;
  readonly parent?: string | undefined;
  readonly status: SyncStatus;
};
