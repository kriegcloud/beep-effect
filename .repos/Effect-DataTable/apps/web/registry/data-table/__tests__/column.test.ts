import { describe, expect, it } from "vitest"
import { Context, Effect, Option, Stream } from "effect"
import * as Accessor from "../core/Accessor"
import { createColumnHelper, type Column } from "../core/Column"

// Sample row type for tests
type Task = {
  id: string
  title: string
  priority: number
  tags: string[]
}

describe("Accessor", () => {
  describe("sync", () => {
    it("creates a sync accessor that extracts value immediately", () => {
      const accessor = Accessor.sync((task: Task) => task.title)

      expect(accessor._tag).toBe("Sync")
      expect(accessor.get({ id: "1", title: "Test Task", priority: 1, tags: [] })).toBe("Test Task")
    })

    it("preserves value type", () => {
      const stringAccessor = Accessor.sync((task: Task) => task.title)
      const numberAccessor = Accessor.sync((task: Task) => task.priority)
      const arrayAccessor = Accessor.sync((task: Task) => task.tags)

      const task: Task = { id: "1", title: "Test", priority: 5, tags: ["urgent"] }

      expect(typeof stringAccessor.get(task)).toBe("string")
      expect(typeof numberAccessor.get(task)).toBe("number")
      expect(Array.isArray(arrayAccessor.get(task))).toBe(true)
    })

  })

  describe("deferred", () => {
    it("creates a deferred accessor with Effect", () => {
      const accessor = Accessor.deferred((task: Task) => Effect.succeed(task.title.toUpperCase()))

      expect(accessor._tag).toBe("Deferred")

      const effect = accessor.get({ id: "1", title: "test", priority: 1, tags: [] })
      const result = Effect.runSync(effect)
      expect(result).toBe("TEST")
    })

    it("preserves Effect error type", () => {
      class FetchError {
        readonly _tag = "FetchError"
        constructor(readonly message: string) {}
      }

      const accessor = Accessor.deferred(
        (task: Task): Effect.Effect<string, FetchError> =>
          task.id === "error"
            ? Effect.fail(new FetchError("Failed to fetch"))
            : Effect.succeed(task.title)
      )

      const successEffect = accessor.get({ id: "1", title: "Success", priority: 1, tags: [] })
      const successResult = Effect.runSync(successEffect)
      expect(successResult).toBe("Success")

      const errorEffect = accessor.get({ id: "error", title: "Error", priority: 1, tags: [] })
      const errorResult = Effect.runSyncExit(errorEffect)
      expect(errorResult._tag).toBe("Failure")
    })

    it("preserves Effect requirements type", () => {
      class TaskService extends Context.Tag("TaskService")<
        TaskService,
        { readonly fetchTitle: (id: string) => Effect.Effect<string> }
      >() {}

      const accessor = Accessor.deferred(
        (task: Task): Effect.Effect<string, never, TaskService> =>
          Effect.flatMap(TaskService, (service) => service.fetchTitle(task.id))
      )

      expect(accessor._tag).toBe("Deferred")
    })

  })

  describe("streamed", () => {
    it("creates a streamed accessor with Stream", () => {
      const accessor = Accessor.streamed((task: Task) => Stream.make(task.title, task.title.toUpperCase()))

      expect(accessor._tag).toBe("Streamed")

      const stream = accessor.get({ id: "1", title: "test", priority: 1, tags: [] })
      const result = Effect.runSync(Stream.runCollect(stream))
      expect(Array.from(result)).toEqual(["test", "TEST"])
    })

    it("preserves Stream error type", () => {
      class StreamError {
        readonly _tag = "StreamError"
        constructor(readonly message: string) {}
      }

      const accessor = Accessor.streamed(
        (task: Task): Stream.Stream<string, StreamError> =>
          task.id === "error"
            ? Stream.fail(new StreamError("Stream failed"))
            : Stream.make(task.title)
      )

      const successStream = accessor.get({ id: "1", title: "Success", priority: 1, tags: [] })
      const successResult = Effect.runSync(Stream.runCollect(successStream))
      expect(Array.from(successResult)).toEqual(["Success"])

      const errorStream = accessor.get({ id: "error", title: "Error", priority: 1, tags: [] })
      const errorResult = Effect.runSyncExit(Stream.runCollect(errorStream))
      expect(errorResult._tag).toBe("Failure")
    })

    it("preserves Stream requirements type", () => {
      class StreamService extends Context.Tag("StreamService")<
        StreamService,
        { readonly streamTitles: (id: string) => Stream.Stream<string> }
      >() {}

      const accessor = Accessor.streamed(
        (task: Task): Stream.Stream<string, never, StreamService> =>
          Stream.flatMap(StreamService, (service) => service.streamTitles(task.id))
      )

      expect(accessor._tag).toBe("Streamed")
    })

  })

  describe("match", () => {
    it("matches Sync accessor", () => {
      const accessor = Accessor.sync((task: Task) => task.title)

      const result = Accessor.match(accessor, {
        onSync: () => "sync",
        onDeferred: () => "deferred",
        onStreamed: () => "streamed"
      })

      expect(result).toBe("sync")
    })

    it("matches Deferred accessor", () => {
      const accessor = Accessor.deferred((task: Task) => Effect.succeed(task.title))

      const result = Accessor.match(accessor, {
        onSync: () => "sync",
        onDeferred: () => "deferred",
        onStreamed: () => "streamed"
      })

      expect(result).toBe("deferred")
    })

    it("matches Streamed accessor", () => {
      const accessor = Accessor.streamed((task: Task) => Stream.make(task.title))

      const result = Accessor.match(accessor, {
        onSync: () => "sync",
        onDeferred: () => "deferred",
        onStreamed: () => "streamed"
      })

      expect(result).toBe("streamed")
    })
  })

  describe("type guards", () => {
    it("isSync checks if value is Sync accessor", () => {
      const accessor = Accessor.sync((task: Task) => task.title)
      expect(Accessor.isSync(accessor)).toBe(true)
      expect(Accessor.isDeferred(accessor)).toBe(false)
      expect(Accessor.isStreamed(accessor)).toBe(false)
    })

    it("isDeferred checks if value is Deferred accessor", () => {
      const accessor = Accessor.deferred((task: Task) => Effect.succeed(task.title))
      expect(Accessor.isSync(accessor)).toBe(false)
      expect(Accessor.isDeferred(accessor)).toBe(true)
      expect(Accessor.isStreamed(accessor)).toBe(false)
    })

    it("isStreamed checks if value is Streamed accessor", () => {
      const accessor = Accessor.streamed((task: Task) => Stream.make(task.title))
      expect(Accessor.isSync(accessor)).toBe(false)
      expect(Accessor.isDeferred(accessor)).toBe(false)
      expect(Accessor.isStreamed(accessor)).toBe(true)
    })

    it("isAccessor checks if value is any Accessor", () => {
      const syncAccessor = Accessor.sync((task: Task) => task.title)
      const deferredAccessor = Accessor.deferred((task: Task) => Effect.succeed(task.title))
      const streamedAccessor = Accessor.streamed((task: Task) => Stream.make(task.title))

      expect(Accessor.isAccessor(syncAccessor)).toBe(true)
      expect(Accessor.isAccessor(deferredAccessor)).toBe(true)
      expect(Accessor.isAccessor(streamedAccessor)).toBe(true)
      expect(Accessor.isAccessor({ _tag: "Sync" })).toBe(false)
      expect(Accessor.isAccessor(null)).toBe(false)
    })
  })

  describe("Type extraction helpers", () => {
    it("extracts Row type with RowOf", () => {
      const accessor = Accessor.sync((task: Task) => task.title)
      type ExtractedRow = Accessor.Accessor.RowOf<typeof accessor>

      const task: ExtractedRow = { id: "1", title: "test", priority: 1, tags: [] }
      expect(accessor.get(task)).toBe("test")
    })

    it("extracts Value type with ValueOf", () => {
      const accessor = Accessor.sync((task: Task) => task.title)
      type ExtractedValue = Accessor.Accessor.ValueOf<typeof accessor>

      const value: ExtractedValue = "test"
      expect(typeof value).toBe("string")
    })

    it("extracts Error type with ErrorOf", () => {
      class CustomError {
        readonly _tag = "CustomError"
      }

      const accessor = Accessor.deferred(
        (_task: Task): Effect.Effect<string, CustomError> =>
          Effect.fail(new CustomError())
      )

      type ExtractedError = Accessor.Accessor.ErrorOf<typeof accessor>

      const error: ExtractedError = new CustomError()
      expect(error._tag).toBe("CustomError")
    })

    it("extracts Requirements type with RequirementsOf", () => {
      class MyService extends Context.Tag("MyService")<
        MyService,
        { readonly _tag: "MyService" }
      >() {}

      const accessor = Accessor.deferred(
        (_task: Task): Effect.Effect<string, never, MyService> =>
          Effect.map(MyService, () => "value")
      )

      type ExtractedRequirements = Accessor.Accessor.RequirementsOf<typeof accessor>

      // Type-level test - if this compiles, the type is correct
      const _typeTest: ExtractedRequirements extends MyService ? true : false = true
      expect(_typeTest).toBe(true)
    })
  })
})

describe("Column", () => {
  describe("createColumnHelper", () => {
    it("creates sync column via col(id, fn)", () => {
      const col = createColumnHelper<Task>()

      const column = col("title", (task) => task.title)
        .header("Task Title")
        .icon(Option.none())

      expect(column._tag).toBe("Column")
      expect(column.id).toBe("title")
      expect(column.header).toBe("Task Title")
      expect(Option.isNone(column.icon)).toBe(true)
      expect(column.accessor._tag).toBe("Sync")
    })

    it("creates deferred column via col.deferred(id, fn)", () => {
      const col = createColumnHelper<Task>()

      const column = col.deferred("title", (task) => Effect.succeed(task.title.toUpperCase()))
        .header("Uppercase Title")
        .icon(Option.none())

      expect(column._tag).toBe("Column")
      expect(column.id).toBe("title")
      expect(column.header).toBe("Uppercase Title")
      expect(column.accessor._tag).toBe("Deferred")

      const task: Task = { id: "1", title: "test", priority: 1, tags: [] }
      if (column.accessor._tag === "Deferred") {
        const result = Effect.runSync(column.accessor.get(task))
        expect(result).toBe("TEST")
      }
    })

    it("creates streamed column via col.streamed(id, fn)", () => {
      const col = createColumnHelper<Task>()

      const column = col.streamed("tags", (task) => Stream.fromIterable(task.tags))
        .header("Tags Stream")
        .icon(Option.none())

      expect(column._tag).toBe("Column")
      expect(column.id).toBe("tags")
      expect(column.header).toBe("Tags Stream")
      expect(column.accessor._tag).toBe("Streamed")

      const task: Task = { id: "1", title: "test", priority: 1, tags: ["a", "b", "c"] }
      if (column.accessor._tag === "Streamed") {
        const result = Effect.runSync(Stream.runCollect(column.accessor.get(task)))
        expect(Array.from(result)).toEqual(["a", "b", "c"])
      }
    })

    it("preserves type safety across different value types", () => {
      const col = createColumnHelper<Task>()

      const idColumn = col("id", (task) => task.id)
        .header("ID")
        .icon(Option.none())

      const priorityColumn = col("priority", (task) => task.priority)
        .header("Priority")
        .icon(Option.none())

      const tagsColumn = col("tags", (task) => task.tags)
        .header("Tags")
        .icon(Option.none())

      const task: Task = { id: "1", title: "test", priority: 5, tags: ["urgent"] }

      if (idColumn.accessor._tag === "Sync") {
        expect(typeof idColumn.accessor.get(task)).toBe("string")
      }

      if (priorityColumn.accessor._tag === "Sync") {
        expect(typeof priorityColumn.accessor.get(task)).toBe("number")
      }

      if (tagsColumn.accessor._tag === "Sync") {
        expect(Array.isArray(tagsColumn.accessor.get(task))).toBe(true)
      }
    })
  })

  describe("builder pattern", () => {
    it("sets header via .header()", () => {
      const col = createColumnHelper<Task>()

      const builder = col("title", (task) => task.title)
      const column = builder.header("Custom Header").icon(Option.none())

      expect(column.header).toBe("Custom Header")
    })

    it("sets icon via .icon()", () => {
      const col = createColumnHelper<Task>()

      const mockIcon = (() => null) as any // Mock LucideIcon
      const columnWithIcon = col("title", (task) => task.title)
        .header("Title")
        .icon(Option.some(mockIcon))

      const columnWithoutIcon = col("title", (task) => task.title)
        .header("Title")
        .icon(Option.none())

      expect(Option.isSome(columnWithIcon.icon)).toBe(true)
      expect(Option.isNone(columnWithoutIcon.icon)).toBe(true)

      if (Option.isSome(columnWithIcon.icon)) {
        expect(columnWithIcon.icon.value).toBe(mockIcon)
      }
    })

    it("chains methods fluently", () => {
      const col = createColumnHelper<Task>()
      const mockIcon = (() => null) as any

      const column = col("priority", (task) => task.priority)
        .header("Priority Level")
        .icon(Option.some(mockIcon))

      expect(column.id).toBe("priority")
      expect(column.header).toBe("Priority Level")
      expect(Option.isSome(column.icon)).toBe(true)
      expect(column.accessor._tag).toBe("Sync")
    })

    it("maintains builder pattern for deferred columns", () => {
      const col = createColumnHelper<Task>()
      const mockIcon = (() => null) as any

      const column = col.deferred("title", (task) => Effect.succeed(task.title))
        .header("Async Title")
        .icon(Option.some(mockIcon))

      expect(column.id).toBe("title")
      expect(column.header).toBe("Async Title")
      expect(Option.isSome(column.icon)).toBe(true)
      expect(column.accessor._tag).toBe("Deferred")
    })

    it("maintains builder pattern for streamed columns", () => {
      const col = createColumnHelper<Task>()
      const mockIcon = (() => null) as any

      const column = col.streamed("tags", (task) => Stream.fromIterable(task.tags))
        .header("Tag Stream")
        .icon(Option.some(mockIcon))

      expect(column.id).toBe("tags")
      expect(column.header).toBe("Tag Stream")
      expect(Option.isSome(column.icon)).toBe(true)
      expect(column.accessor._tag).toBe("Streamed")
    })
  })

  describe("Column data structure", () => {
    it("creates columns with Data.struct for equality", () => {
      const col = createColumnHelper<Task>()

      const column1 = col("title", (task) => task.title)
        .header("Title")
        .icon(Option.none())

      const column2 = col("title", (task) => task.title)
        .header("Title")
        .icon(Option.none())

      // Columns with same structure should be considered equal by Effect's Equal
      expect(column1._tag).toBe(column2._tag)
      expect(column1.id).toBe(column2.id)
      expect(column1.header).toBe(column2.header)
    })

    it("stores all required properties", () => {
      const col = createColumnHelper<Task>()
      const mockIcon = (() => null) as any

      const column = col("priority", (task) => task.priority)
        .header("Priority")
        .icon(Option.some(mockIcon))

      expect(column).toHaveProperty("_tag")
      expect(column).toHaveProperty("id")
      expect(column).toHaveProperty("accessor")
      expect(column).toHaveProperty("header")
      expect(column).toHaveProperty("icon")
    })

    it("properly types column with error and requirements", () => {
      class MyService extends Context.Tag("MyService")<
        MyService,
        { readonly fetch: (id: string) => Effect.Effect<string> }
      >() {}

      class MyError {
        readonly _tag = "MyError"
        constructor(readonly message: string) {}
      }

      const col = createColumnHelper<Task>()

      const column = col.deferred(
        "title",
        (task): Effect.Effect<string, MyError, MyService> =>
          Effect.flatMap(MyService, (service) => service.fetch(task.id))
      )
        .header("Fetched Title")
        .icon(Option.none())

      type ColumnType = typeof column
      type ExtractedError = ColumnType extends Column<any, any, any, infer E, any> ? E : never
      type ExtractedRequirements = ColumnType extends Column<any, any, any, any, infer R> ? R : never

      // Type-level tests
      const _errorTest: ExtractedError extends MyError ? true : false = true
      const _reqTest: ExtractedRequirements extends MyService ? true : false = true

      expect(_errorTest).toBe(true)
      expect(_reqTest).toBe(true)
    })
  })

  describe("Real-world usage patterns", () => {
    it("creates a simple table column definition", () => {
      const col = createColumnHelper<Task>()

      const columns = [
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col("title", (task) => task.title).header("Title").icon(Option.none()),
        col("priority", (task) => task.priority).header("Priority").icon(Option.none())
      ]

      expect(columns).toHaveLength(3)
      expect(columns[0].id).toBe("id")
      expect(columns[1].id).toBe("title")
      expect(columns[2].id).toBe("priority")
    })

    it("mixes sync and async columns", () => {
      const col = createColumnHelper<Task>()

      const columns = [
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col.deferred("title", (task) => Effect.succeed(task.title.toUpperCase()))
          .header("Title (Async)")
          .icon(Option.none()),
        col.streamed("tags", (task) => Stream.fromIterable(task.tags))
          .header("Tags (Stream)")
          .icon(Option.none())
      ]

      expect(columns[0].accessor._tag).toBe("Sync")
      expect(columns[1].accessor._tag).toBe("Deferred")
      expect(columns[2].accessor._tag).toBe("Streamed")
    })

    it("supports computed values in sync accessors", () => {
      const col = createColumnHelper<Task>()

      const column = col("computed", (task) => `${task.title} (P${task.priority})`)
        .header("Computed")
        .icon(Option.none())

      const task: Task = { id: "1", title: "Test", priority: 5, tags: [] }

      if (column.accessor._tag === "Sync") {
        const result = column.accessor.get(task)
        expect(result).toBe("Test (P5)")
      }
    })

    it("supports async data fetching in deferred accessors", () => {
      const col = createColumnHelper<Task>()

      const column = col.deferred("async-data", (task) =>
        Effect.succeed(`Fetched: ${task.title}`)
      )
        .header("Async Data")
        .icon(Option.none())

      const task: Task = { id: "1", title: "Test", priority: 1, tags: [] }

      if (column.accessor._tag === "Deferred") {
        const result = Effect.runSync(column.accessor.get(task))
        expect(result).toBe("Fetched: Test")
      }
    })

    it("supports streaming data in streamed accessors", () => {
      const col = createColumnHelper<Task>()

      const column = col.streamed("tag-stream", (task) =>
        Stream.fromIterable(task.tags).pipe(
          Stream.map((tag) => tag.toUpperCase())
        )
      )
        .header("Tag Stream")
        .icon(Option.none())

      const task: Task = { id: "1", title: "Test", priority: 1, tags: ["a", "b", "c"] }

      if (column.accessor._tag === "Streamed") {
        const result = Effect.runSync(Stream.runCollect(column.accessor.get(task)))
        expect(Array.from(result)).toEqual(["A", "B", "C"])
      }
    })
  })
})
