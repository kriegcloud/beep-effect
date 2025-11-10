import { Todo } from "./entities";
import { EventStreamRpc } from "./events/index";

export class TasksDomainRpc extends Todo.TodoRpc.merge(
  EventStreamRpc
) {}

