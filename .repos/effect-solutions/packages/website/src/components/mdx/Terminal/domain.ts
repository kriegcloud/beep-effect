import { Context, type Effect, Option, Schema } from "effect"
import * as Arr from "effect/Array"

// =============================================================================
// Task Schema & Domain
// =============================================================================

export const TaskId = Schema.Number.pipe(Schema.brand("TaskId"))
export type TaskId = typeof TaskId.Type

export class Task extends Schema.Class<Task>("Task")({
  id: TaskId,
  text: Schema.NonEmptyString,
  done: Schema.Boolean,
}) {
  toggle() {
    return Task.make({ ...this, done: !this.done })
  }
}

export class TaskList extends Schema.Class<TaskList>("TaskList")({
  tasks: Schema.Array(Task),
}) {
  static Json = Schema.parseJson(TaskList)
  static empty = TaskList.make({ tasks: [] })

  get nextId(): TaskId {
    if (this.tasks.length === 0) return TaskId.make(1)
    return TaskId.make(Math.max(...this.tasks.map((t) => t.id)) + 1)
  }

  add(text: string): [TaskList, Task] {
    const task = Task.make({ id: this.nextId, text, done: false })
    return [TaskList.make({ tasks: [...this.tasks, task] }), task]
  }

  toggle(id: TaskId): [TaskList, Option.Option<Task>] {
    const index = this.tasks.findIndex((t) => t.id === id)
    if (index === -1) return [this, Option.none()]

    // biome-ignore lint/style/noNonNullAssertion: index check above
    const updated = this.tasks[index]!.toggle()
    const tasks = Arr.modify(this.tasks, index, () => updated)
    return [TaskList.make({ tasks }), Option.some(updated)]
  }
}

// =============================================================================
// TaskRepo Service
// =============================================================================

export class TaskRepo extends Context.Tag("TaskRepo")<
  TaskRepo,
  {
    readonly list: (all?: boolean) => Effect.Effect<ReadonlyArray<Task>>
    readonly add: (text: string) => Effect.Effect<Task>
    readonly toggle: (id: TaskId) => Effect.Effect<Option.Option<Task>>
    readonly clear: () => Effect.Effect<void>
  }
>() {}
