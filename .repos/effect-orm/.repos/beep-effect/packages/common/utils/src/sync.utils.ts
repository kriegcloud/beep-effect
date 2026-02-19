/**
 * Sync-status primitives exported via `@beep/utils`, providing typed enums for
 * reporting adapter progress.
 *
 * @example
 * import type * as FooTypes from "@beep/types/common.types";
 * import * as Utils from "@beep/utils";
 *
 * const syncUtilsItem: FooTypes.Prettify<Utils.AdapterSyncItem> = {
 *   module: "files",
 *   entity: "asset",
 *   status: { _tag: "syncing", current: 1, total: 2 },
 * };
 * void syncUtilsItem;
 *
 * @category Documentation
 * @since 0.1.0
 */
import type * as Data from "effect/Data";

/**
 * Tagged enum describing adapter sync lifecycle states.
 *
 * @example
 * import type { SyncStatus } from "@beep/utils/sync.utils";
 *
 * const status: SyncStatus = { _tag: "notSynced" };
 *
 * @category Core
 * @since 0.1.0
 */
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

/**
 * Represents a module/entity sync entry reported to dashboards.
 *
 * @example
 * import type { AdapterSyncItem } from "@beep/utils/sync.utils";
 *
 * const item: AdapterSyncItem = { module: "files", entity: "asset", status: { _tag: "synced" } };
 *
 * @category Core
 * @since 0.1.0
 */
export type AdapterSyncItem = {
  readonly module: string;
  readonly entity: string;
  readonly parent?: string | undefined;
  readonly status: SyncStatus;
};
