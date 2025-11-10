import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import * as S from "effect/Schema"
import { Todo } from "@beep/tasks-domain/entities";


export const TodoRpc = RpcGroup.make(
  Rpc.make("add", {
    payload: Todo.Model.insert,
    success: Todo.Model,
  }),
  Rpc.make("list", {
    success: S.Array(Todo.Model)
  })
);