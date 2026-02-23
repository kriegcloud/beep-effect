import { describe, expect, it } from "vitest"
import { Effect, Stream, Option } from "effect"
import { Result, Registry } from "@effect-atom/atom"
import { createColumnHelper, createTable } from "../core"
import * as TableAtoms from "../state"

type Task = {
  id: string
  title: string
  priority: number
  tags: string[]
}

const col = createColumnHelper<Task>()

describe("TableAtoms", () => {
  describe("make", () => {
    it("creates table state with rows atom", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col("title", (task) => task.title).header("Title").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      expect(state.table).toBe(table)
      expect(registry.get(state.rowsAtom)).toEqual([])
    })

    it("accepts initial rows", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col("title", (task) => task.title).header("Title").icon(Option.none())
      ])

      const initialRows: Task[] = [
        { id: "1", title: "Task 1", priority: 1, tags: [] },
        { id: "2", title: "Task 2", priority: 2, tags: [] }
      ]

      const state = TableAtoms.make(table, initialRows)
      const registry = Registry.make()

      expect(registry.get(state.rowsAtom)).toEqual(initialRows)
    })

    it("creates state without initial rows when not provided", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      expect(registry.get(state.rowsAtom)).toEqual([])
    })
  })

  describe("rowsAtom", () => {
    it("is writable and can be updated", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      const newRows: Task[] = [{ id: "1", title: "Task 1", priority: 1, tags: [] }]

      registry.set(state.rowsAtom, newRows)
      expect(registry.get(state.rowsAtom)).toEqual(newRows)
    })

    it("notifies subscribers when rows change", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      let callCount = 0
      let lastValue: ReadonlyArray<Task> = []

      registry.subscribe(state.rowsAtom, (value) => {
        callCount++
        lastValue = value
      })

      const newRows: Task[] = [{ id: "1", title: "Task 1", priority: 1, tags: [] }]

      registry.set(state.rowsAtom, newRows)

      expect(callCount).toBeGreaterThan(0)
      expect(lastValue).toEqual(newRows)
    })

    it("supports multiple updates", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      const rows1: Task[] = [{ id: "1", title: "Task 1", priority: 1, tags: [] }]
      const rows2: Task[] = [
        { id: "1", title: "Task 1", priority: 1, tags: [] },
        { id: "2", title: "Task 2", priority: 2, tags: [] }
      ]

      registry.set(state.rowsAtom, rows1)
      expect(registry.get(state.rowsAtom)).toEqual(rows1)

      registry.set(state.rowsAtom, rows2)
      expect(registry.get(state.rowsAtom)).toEqual(rows2)
    })
  })

  describe("getCellAtom - Sync columns", () => {
    it("returns atom for sync accessor that resolves to value", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col("title", (task) => task.title).header("Title").icon(Option.none())
      ])

      const rows: Task[] = [
        { id: "1", title: "Task 1", priority: 1, tags: [] },
        { id: "2", title: "Task 2", priority: 2, tags: [] }
      ]

      const state = TableAtoms.make(table, rows)
      const registry = Registry.make()

      const idColumn = table.columns[0]
      const titleColumn = table.columns[1]

      const cell00 = registry.get(state.getCellAtom(0, idColumn))
      const cell01 = registry.get(state.getCellAtom(0, titleColumn))
      const cell10 = registry.get(state.getCellAtom(1, idColumn))

      expect(cell00).toBe("1")
      expect(cell01).toBe("Task 1")
      expect(cell10).toBe("2")
    })

    it("updates when row data changes", () => {
      const table = createTable<Task>()([
        col("title", (task) => task.title).header("Title").icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "Original", priority: 1, tags: [] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      const cellAtom = state.getCellAtom(0, column)

      expect(registry.get(cellAtom)).toBe("Original")

      registry.set(state.rowsAtom, [
        { id: "1", title: "Updated", priority: 1, tags: [] }
      ])

      expect(registry.get(cellAtom)).toBe("Updated")
    })

    it("supports computed values", () => {
      const table = createTable<Task>()([
        col("computed", (task) => `${task.title} (P${task.priority})`)
          .header("Computed")
          .icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "Task", priority: 5, tags: [] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      const cell = registry.get(state.getCellAtom(0, column))

      expect(cell).toBe("Task (P5)")
    })
  })

  describe("getCellAtom - Deferred columns", () => {
    it("creates atom for deferred accessor", async () => {
      const table = createTable<Task>()([
        col
          .deferred("async-title", (task) => Effect.succeed(task.title.toUpperCase()))
          .header("Async Title")
          .icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "test", priority: 1, tags: [] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      const cellAtom = state.getCellAtom(0, column)

      // Cell atom should be an Atom - mount it to run the effect
      registry.mount(cellAtom)

      // Wait for effect to resolve
      await new Promise((resolve) => setTimeout(resolve, 20))

      const result = registry.get(cellAtom)
      expect(Result.isSuccess(result) || Result.isInitial(result)).toBe(true)
    })

    it("returns memoized atom for same row/column", () => {
      const table = createTable<Task>()([
        col
          .deferred("async-title", (task) => Effect.succeed(task.title))
          .header("Async Title")
          .icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "test", priority: 1, tags: [] }
      ])

      const column = table.columns[0]

      const cellAtom1 = state.getCellAtom(0, column)
      const cellAtom2 = state.getCellAtom(0, column)

      // Should return the same atom instance
      expect(cellAtom1).toBe(cellAtom2)
    })

    it("resolves to Result.success when effect succeeds", async () => {
      const table = createTable<Task>()([
        col
          .deferred("async-title", (task) => Effect.succeed(task.title.toUpperCase()))
          .header("Async Title")
          .icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "test", priority: 1, tags: [] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      const cellAtom = state.getCellAtom(0, column)

      registry.mount(cellAtom)

      // Wait for effect to resolve
      await new Promise((resolve) => setTimeout(resolve, 20))

      const result = registry.get(cellAtom)
      expect(Result.isSuccess(result)).toBe(true)
      if (Result.isSuccess(result)) {
        expect(result.value).toBe("TEST")
      }
    })
  })

  describe("getCellAtom - Streamed columns", () => {
    it("creates atom for streamed accessor", async () => {
      const table = createTable<Task>()([
        col
          .streamed("stream-tags", (task) => Stream.fromIterable(task.tags))
          .header("Tags Stream")
          .icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "test", priority: 1, tags: ["a", "b"] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      const cellAtom = state.getCellAtom(0, column)

      const unmount = registry.mount(cellAtom)

      // Wait for stream to emit
      await new Promise((resolve) => setTimeout(resolve, 20))

      const result = registry.get(cellAtom)
      expect(Result.isSuccess(result) || Result.isInitial(result)).toBe(true)

      unmount()
    })
  })

  describe("multiple columns and rows", () => {
    it("handles table with mixed sync column types", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col("title", (task) => task.title).header("Title").icon(Option.none()),
        col("priority", (task) => task.priority).header("Priority").icon(Option.none())
      ])

      const rows: Task[] = [
        { id: "1", title: "Task 1", priority: 1, tags: [] },
        { id: "2", title: "Task 2", priority: 2, tags: [] }
      ]

      const state = TableAtoms.make(table, rows)
      const registry = Registry.make()

      const idColumn = table.columns[0]
      const titleColumn = table.columns[1]
      const priorityColumn = table.columns[2]

      // Use type assertions since TypeScript can't narrow column types from array access
      expect(registry.get(state.getCellAtom(0, idColumn) as any)).toBe("1")
      expect(registry.get(state.getCellAtom(0, titleColumn) as any)).toBe("Task 1")
      expect(registry.get(state.getCellAtom(0, priorityColumn) as any)).toBe(1)

      expect(registry.get(state.getCellAtom(1, idColumn) as any)).toBe("2")
      expect(registry.get(state.getCellAtom(1, titleColumn) as any)).toBe("Task 2")
      expect(registry.get(state.getCellAtom(1, priorityColumn) as any)).toBe(2)
    })

    it("handles table with all three accessor types", async () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none()),
        col
          .deferred("async", (task) => Effect.succeed(task.title.toUpperCase()))
          .header("Async")
          .icon(Option.none()),
        col
          .streamed("stream", (task) => Stream.fromIterable(task.tags))
          .header("Stream")
          .icon(Option.none())
      ])

      const rows: Task[] = [{ id: "1", title: "test", priority: 1, tags: ["a", "b"] }]

      const state = TableAtoms.make(table, rows)
      const registry = Registry.make()

      const syncCol = table.columns[0]
      const deferredCol = table.columns[1]
      const streamedCol = table.columns[2]

      // Sync should return value through atom
      expect(registry.get(state.getCellAtom(0, syncCol))).toBe("1")

      // Deferred should return atom with Result
      const deferredAtom = state.getCellAtom(0, deferredCol)
      registry.mount(deferredAtom)

      await new Promise((resolve) => setTimeout(resolve, 20))

      const deferredResult = registry.get(deferredAtom)
      expect(Result.isSuccess(deferredResult) || Result.isInitial(deferredResult)).toBe(
        true
      )

      // Streamed should return atom with Result
      const streamedAtom = state.getCellAtom(0, streamedCol)
      const unmount = registry.mount(streamedAtom)

      await new Promise((resolve) => setTimeout(resolve, 20))

      const streamedResult = registry.get(streamedAtom)
      expect(Result.isSuccess(streamedResult) || Result.isInitial(streamedResult)).toBe(
        true
      )

      unmount()
    })
  })

  describe("edge cases", () => {
    it("handles empty rows", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table)
      const registry = Registry.make()

      expect(registry.get(state.rowsAtom)).toEqual([])
    })

    it("handles single row and column", () => {
      const table = createTable<Task>()([
        col("id", (task) => task.id).header("ID").icon(Option.none())
      ])

      const state = TableAtoms.make(table, [
        { id: "1", title: "test", priority: 1, tags: [] }
      ])
      const registry = Registry.make()

      const column = table.columns[0]
      expect(registry.get(state.getCellAtom(0, column))).toBe("1")
    })
  })
})
