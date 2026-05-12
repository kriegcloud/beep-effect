/**
 * WorkItem repository adapter.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.1.0
 */

import { WorkItemConfig } from "@beep/architecture-lab-config/layer";
import type * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import {
  fromWorkItemRow,
  toWorkItemInsert,
  WORK_ITEM_TABLE_NAME,
  workItemTable,
} from "@beep/architecture-lab-tables/aggregates/WorkItem";
import * as WorkItemUseCaseServer from "@beep/architecture-lab-use-cases/server";
import { PostgresDrizzle, type PostgresDrizzleDatabase } from "@beep/postgres";
import { eq } from "drizzle-orm";
import { Effect, HashMap, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

type WorkItemStore = HashMap.HashMap<DomainWorkItem.WorkItemId, DomainWorkItem.WorkItem>;

const getStoredWorkItem = Effect.fn("ArchitectureLab.WorkItemRepository.getStored")(function* (
  store: Ref.Ref<WorkItemStore>,
  id: DomainWorkItem.WorkItemId
) {
  const workItems = yield* Ref.get(store);
  const found = HashMap.get(workItems, id);
  if (O.isNone(found)) {
    return yield* new WorkItemUseCaseServer.WorkItem.WorkItemRepositoryNotFound({ workItemId: id });
  }
  return found.value;
});

/**
 * Build the in-memory WorkItem repository used by the fast architecture lab proof.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeInMemoryWorkItemRepository = Effect.fn("ArchitectureLab.WorkItemRepository.makeInMemory")(
  function* () {
    const config = yield* WorkItemConfig;
    const store = yield* Ref.make(HashMap.empty<DomainWorkItem.WorkItemId, DomainWorkItem.WorkItem>());

    return WorkItemUseCaseServer.WorkItem.WorkItemRepository.of({
      create: Effect.fn("ArchitectureLab.WorkItemRepository.create")(function* (workItem) {
        const workItems = yield* Ref.get(store);
        if (O.isSome(HashMap.get(workItems, workItem.id))) {
          return yield* new WorkItemUseCaseServer.WorkItem.WorkItemRepositoryConflict({
            workItemId: workItem.id,
            reason: `${config.serverConfig.repositoryName} already contains ${WORK_ITEM_TABLE_NAME}`,
          });
        }
        yield* Ref.update(store, (current) => HashMap.set(current, workItem.id, workItem));
        return workItem;
      }),
      get: Effect.fn("ArchitectureLab.WorkItemRepository.get")(function* (id) {
        return yield* getStoredWorkItem(store, id);
      }),
      list: Effect.fn("ArchitectureLab.WorkItemRepository.list")(function* () {
        const workItems = yield* Ref.get(store);
        return A.fromIterable(HashMap.values(workItems));
      }),
      save: Effect.fn("ArchitectureLab.WorkItemRepository.save")(function* (workItem) {
        yield* getStoredWorkItem(store, workItem.id);
        yield* Ref.update(store, (workItems) => HashMap.set(workItems, workItem.id, workItem));
        return workItem;
      }),
    });
  }
);

const repositoryUnavailable = (operation: string) =>
  Effect.mapError(
    () =>
      new WorkItemUseCaseServer.WorkItem.WorkItemRepositoryUnavailable({
        reason: `${operation} failed against ${WORK_ITEM_TABLE_NAME}`,
      })
  );

const findDrizzleWorkItem = Effect.fn("ArchitectureLab.WorkItemRepository.findDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainWorkItem.WorkItemId
) {
  const rows = yield* db
    .select()
    .from(workItemTable)
    .where(eq(workItemTable.id, id))
    .limit(1)
    .pipe(repositoryUnavailable("select WorkItem"));

  return pipe(rows, A.head, O.map(fromWorkItemRow));
});

const getDrizzleWorkItem = Effect.fn("ArchitectureLab.WorkItemRepository.getDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainWorkItem.WorkItemId
) {
  const found = yield* findDrizzleWorkItem(db, id);
  if (O.isNone(found)) {
    return yield* new WorkItemUseCaseServer.WorkItem.WorkItemRepositoryNotFound({ workItemId: id });
  }
  return found.value;
});

/**
 * Build a Drizzle-backed WorkItem repository used by live persistence tests.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeDrizzleWorkItemRepository = Effect.fn("ArchitectureLab.WorkItemRepository.makeDrizzle")(function* () {
  const db = yield* PostgresDrizzle;

  return WorkItemUseCaseServer.WorkItem.WorkItemRepository.of({
    create: Effect.fn("ArchitectureLab.WorkItemRepository.drizzleCreate")(function* (workItem) {
      const existing = yield* findDrizzleWorkItem(db, workItem.id);
      if (O.isSome(existing)) {
        return yield* new WorkItemUseCaseServer.WorkItem.WorkItemRepositoryConflict({
          workItemId: workItem.id,
          reason: `${WORK_ITEM_TABLE_NAME} already contains ${workItem.id}`,
        });
      }

      const rows = yield* db
        .insert(workItemTable)
        .values(toWorkItemInsert(workItem))
        .returning()
        .pipe(repositoryUnavailable("insert WorkItem"));

      return pipe(
        rows,
        A.head,
        O.map(fromWorkItemRow),
        O.getOrElse(() => workItem)
      );
    }),
    get: Effect.fn("ArchitectureLab.WorkItemRepository.drizzleGet")(function* (id) {
      return yield* getDrizzleWorkItem(db, id);
    }),
    list: Effect.fn("ArchitectureLab.WorkItemRepository.drizzleList")(function* () {
      const rows = yield* db.select().from(workItemTable).pipe(repositoryUnavailable("list WorkItem"));
      return A.map(rows, fromWorkItemRow);
    }),
    save: Effect.fn("ArchitectureLab.WorkItemRepository.drizzleSave")(function* (workItem) {
      yield* getDrizzleWorkItem(db, workItem.id);
      const rows = yield* db
        .update(workItemTable)
        .set(toWorkItemInsert(workItem))
        .where(eq(workItemTable.id, workItem.id))
        .returning()
        .pipe(repositoryUnavailable("update WorkItem"));

      return pipe(
        rows,
        A.head,
        O.map(fromWorkItemRow),
        O.getOrElse(() => workItem)
      );
    }),
  });
});

/**
 * Build the default WorkItem repository for normal slice tests.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeWorkItemRepository = makeInMemoryWorkItemRepository;
