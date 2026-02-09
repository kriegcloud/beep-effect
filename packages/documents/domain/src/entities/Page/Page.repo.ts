import { $DocumentsDomainId } from "@beep/identity/packages";
import * as Arbitrary from "effect/Arbitrary";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as FC from "effect/FastCheck";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import {
  Archive,
  Breadcrumbs,
  Create,
  type Delete,
  Get,
  List,
  ListChildren,
  ListTrash,
  Lock,
  Move,
  Publish,
  Restore,
  Search,
  Unlock,
  UnPublish,
  Update,
} from "./contracts";
import * as Page from "./Page.model";

const $I = $DocumentsDomainId.create("entities/Page/Page.repo");

type PayloadMap = {
  readonly Archive: Archive.Payload;
  readonly Breadcrumbs: Breadcrumbs.Payload;
  readonly Create: Create.Payload;
  readonly Delete: Delete.Payload;
  readonly Get: Get.Payload;
  readonly List: List.Payload;
  readonly ListChildren: ListChildren.Payload;
  readonly ListTrash: ListTrash.Payload;
  readonly Lock: Lock.Payload;
  readonly Move: Move.Payload;
  readonly Publish: Publish.Payload;
  readonly Restore: Restore.Payload;
  readonly Search: Search.Payload;
  readonly UnPublish: UnPublish.Payload;
  readonly Unlock: Unlock.Payload;
  readonly Update: Update.Payload;
};

type PayloadIndex<T extends keyof PayloadMap> = PayloadMap[T];

type SuccessMap = {
  readonly Archive: Archive.Success;
  readonly Breadcrumbs: Breadcrumbs.Success;
  readonly Create: Create.Success;
  readonly Delete: void;
  readonly Get: Get.Success;
  readonly List: List.Success;
  readonly ListChildren: ListChildren.Success;
  readonly ListTrash: ListTrash.Success;
  readonly Lock: Lock.Success;
  readonly Move: Move.Success;
  readonly Publish: Publish.Success;
  readonly Restore: Restore.Success;
  readonly Search: Search.Success;
  readonly UnPublish: UnPublish.Success;
  readonly Unlock: Unlock.Success;
  readonly Update: Update.Success;
};

type SuccessIndex<T extends keyof SuccessMap> = SuccessMap[T];

export interface Shape {
  readonly Archive: (payload: Archive.Payload) => Effect.Effect<Archive.Success, Archive.Error, never>;
  readonly Breadcrumbs: (payload: Breadcrumbs.Payload) => Effect.Effect<Breadcrumbs.Success, Breadcrumbs.Error, never>;
  readonly Create: (payload: Create.Payload) => Effect.Effect<Create.Success, Create.Error, never>;
  readonly Delete: (payload: Delete.Payload) => Effect.Effect<void, Delete.Error, never>;
  readonly Get: (payload: Get.Payload) => Effect.Effect<Get.Success, Get.Error, never>;
  readonly List: (payload: List.Payload) => Effect.Effect<List.Success, List.Error, never>;
  readonly ListChildren: (
    payload: ListChildren.Payload
  ) => Effect.Effect<ListChildren.Success, ListChildren.Error, never>;
  readonly ListTrash: (payload: ListTrash.Payload) => Effect.Effect<ListTrash.Success, ListTrash.Error, never>;
  readonly Lock: (payload: Lock.Payload) => Effect.Effect<Lock.Success, Lock.Error, never>;
  readonly Move: (payload: Move.Payload) => Effect.Effect<Move.Success, Move.Error, never>;
  readonly Publish: (payload: Publish.Payload) => Effect.Effect<Publish.Success, Publish.Error, never>;
  readonly Restore: (payload: Restore.Payload) => Effect.Effect<Restore.Success, Restore.Error, never>;
  readonly Search: (payload: Search.Payload) => Effect.Effect<Search.Success, Search.Error, never>;
  readonly UnPublish: (payload: UnPublish.Payload) => Effect.Effect<UnPublish.Success, UnPublish.Error, never>;
  readonly Unlock: (payload: Unlock.Payload) => Effect.Effect<Unlock.Success, Unlock.Error, never>;
  readonly Update: (payload: Update.Payload) => Effect.Effect<Update.Success, Update.Error, never>;
}

export class Repo extends Context.Tag($I`Repo`)<Repo, Shape>() {}

type MockerOptions = {
  qty?: undefined | number;
};

const samplePage = (opts?: MockerOptions) =>
  A.head(FC.sample(Arbitrary.make(Page.Model.json), opts?.qty ?? 1)).pipe(O.getOrThrow);

type Overrides = Partial<{
  readonly [K in keyof Shape]: (payload: PayloadIndex<K>, opts?: MockerOptions) => SuccessIndex<K>;
}>;

export const makeTestLayer = (overrides?: Overrides) => {
  const o = overrides ?? {};

  // Default mock behavior: succeed with arbitrary Success values.
  // For Page-like Success payloads, also shallow-merge the request payload into the result
  // so ids/organizationId/parentId assertions can be written naturally in tests.
  const impl: Shape = {
    Archive: (payload) =>
      Effect.succeed(o.Archive?.(payload) ?? new Archive.Success({ ...samplePage(), id: payload.id })),
    Breadcrumbs: (payload) => Effect.succeed(o.Breadcrumbs?.(payload) ?? new Breadcrumbs.Success({ id: payload.id })),
    Create: (payload) => Effect.succeed(o.Create?.(payload) ?? new Create.Success({ ...samplePage(), ...payload })),
    Delete: (payload) => Effect.succeed(o.Delete?.(payload) ?? undefined),
    Get: (payload) => Effect.succeed(o.Get?.(payload) ?? new Get.Success({ ...samplePage(), id: payload.id })),
    List: (payload) =>
      Effect.succeed(
        o.List?.(payload) ?? new List.Success({ ...samplePage(), organizationId: payload.organizationId })
      ),
    ListChildren: (payload) =>
      Effect.succeed(
        o.ListChildren?.(payload) ?? new ListChildren.Success({ ...samplePage(), parentId: payload.parentId })
      ),
    ListTrash: (payload) =>
      Effect.succeed(
        o.ListTrash?.(payload) ?? new ListTrash.Success({ ...samplePage(), organizationId: payload.organizationId })
      ),
    Lock: (payload) =>
      Effect.succeed(o.Lock?.(payload) ?? new Lock.Success({ ...samplePage(), id: payload.id, lockPage: true })),
    Move: (payload) =>
      Effect.succeed(
        o.Move?.(payload) ??
          new Move.Success({ ...samplePage(), id: payload.id, parentId: payload.parentId, position: payload.position })
      ),
    Publish: (payload) =>
      Effect.succeed(
        o.Publish?.(payload) ?? new Publish.Success({ ...samplePage(), id: payload.id, isPublished: true })
      ),
    Restore: (payload) =>
      Effect.succeed(
        o.Restore?.(payload) ?? new Restore.Success({ ...samplePage(), id: payload.id, isArchived: false })
      ),
    Search: (payload) =>
      Effect.succeed(
        o.Search?.(payload) ?? new Search.Success({ ...samplePage(), organizationId: payload.organizationId })
      ),
    UnPublish: (payload) =>
      Effect.succeed(
        o.UnPublish?.(payload) ?? new UnPublish.Success({ ...samplePage(), id: payload.id, isPublished: false })
      ),
    Unlock: (payload) =>
      Effect.succeed(o.Unlock?.(payload) ?? new Unlock.Success({ ...samplePage(), id: payload.id, lockPage: false })),
    Update: (payload) => Effect.succeed(o.Update?.(payload) ?? new Update.Success({ ...samplePage(), ...payload })),
  };

  return Layer.succeed(Repo, impl);
};
