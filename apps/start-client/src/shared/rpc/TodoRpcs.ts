import * as Rpc from "@effect/rpc/Rpc";
import * as RpcGroup from "@effect/rpc/RpcGroup";
import { Todo } from "@shared/types/Todo.js";
import { TodoIdSchema } from "@shared/types/TodoId.js";
import { TodoServiceError } from "@shared/types/TodoServiceError.js";
import * as Schema from "effect/Schema";

export class TodoRpcs extends RpcGroup.make(
  Rpc.make("getTodos", {
    success: Schema.Array(Todo),
    error: TodoServiceError,
  }),
  Rpc.make("addTodo", {
    payload: Schema.String,
    success: Todo,
    error: TodoServiceError,
  }),
  Rpc.make("toggleTodo", {
    payload: TodoIdSchema,
    success: Todo,
    error: TodoServiceError,
  }),
  Rpc.make("deleteTodo", {
    payload: TodoIdSchema,
    success: TodoIdSchema,
    error: TodoServiceError,
  })
) {}
