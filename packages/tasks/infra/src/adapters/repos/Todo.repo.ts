import { Repo } from "@beep/core-db/Repo";
import { dependencies } from "@beep/tasks-infra/adapters/repos/_common";
import { TasksDb } from "@beep/tasks-infra/db";
import { SharedEntityIds } from "@beep/shared-domain";
import { Todo } from "@beep/tasks-domain/entities";
import * as Effect from "effect/Effect";

export class TodoRepo extends Effect.Service<TodoRepo>()("@beep/tasks-infra/adapters/repos/TodoRepo", {
  dependencies,
  accessors: true,
  effect: Repo.make(
    SharedEntityIds.FileId,
    Todo.Model,
    Effect.gen(function* () {
      yield* TasksDb.TasksDb;
      // const list = makeQuery((execute, input: string) => execute((client) => client.query.account.findMany()));

      return {
        // list,
      };
    })
  ),
}) {}
