import { describe, expect, it } from "vitest"
import { Chunk, Effect, Stream, pipe } from "effect"
import { ClientFetcher, DataFetcher } from "../core/DataFetcher"

type Task = {
  id: string
  title: string
  priority: number
}

const sampleTasks: ReadonlyArray<Task> = [
  { id: "1", title: "Task 1", priority: 1 },
  { id: "2", title: "Task 2", priority: 2 },
  { id: "3", title: "Task 3", priority: 3 },
]

describe("DataFetcher", () => {
  describe("ClientFetcher", () => {
    it("creates a Layer that provides DataFetcher service", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.map((service) => service)
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toBeDefined()
      expect(result.fetch).toBeDefined()
      expect(typeof result.fetch).toBe("function")
    })

    it("fetch returns Stream of all rows", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toBeDefined()
      expect(result).toEqual(sampleTasks)
    })

    it("Stream can be collected to array", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toEqual(sampleTasks)
      expect(result.length).toBe(3)
      expect(result[0]).toEqual({ id: "1", title: "Task 1", priority: 1 })
      expect(result[1]).toEqual({ id: "2", title: "Task 2", priority: 2 })
      expect(result[2]).toEqual({ id: "3", title: "Task 3", priority: 3 })
    })

    it("works with empty data array", async () => {
      const emptyData: ReadonlyArray<Task> = []
      const layer = ClientFetcher(emptyData)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toEqual([])
      expect(result.length).toBe(0)
    })

    it("works with single row", async () => {
      const singleTask: ReadonlyArray<Task> = [
        { id: "1", title: "Task 1", priority: 1 },
      ]
      const layer = ClientFetcher(singleTask)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toEqual(singleTask)
      expect(result.length).toBe(1)
    })

    it("ignores filters parameter (current implementation)", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream1 = service.fetch({})
          const stream2 = service.fetch({ someFilter: "value" })

          return pipe(
            Effect.all([
              pipe(Stream.runCollect(stream1), Effect.map((c) => Chunk.toReadonlyArray(c).flat())),
              pipe(Stream.runCollect(stream2), Effect.map((c) => Chunk.toReadonlyArray(c).flat()))
            ]),
            Effect.map(([result1, result2]) => ({ result1, result2 }))
          )
        })
      )

      const { result1, result2 } = await Effect.runPromise(Effect.provide(program, layer))

      expect(result1).toEqual(sampleTasks)
      expect(result2).toEqual(sampleTasks)
    })

    it("preserves row data integrity", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      result.forEach((task, index) => {
        expect(task).toEqual(sampleTasks[index])
        expect(task.id).toBe(sampleTasks[index].id)
        expect(task.title).toBe(sampleTasks[index].title)
        expect(task.priority).toBe(sampleTasks[index].priority)
      })
    })
  })

  describe("DataFetcher Tag", () => {
    it("can be used as dependency in Effect", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toEqual(sampleTasks)
    })

    it("is provided via Layer", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.map((service) => service)
      )

      const service = await Effect.runPromise(Effect.provide(program, layer))

      expect(service).toBeDefined()
      expect(service.fetch).toBeDefined()
    })

    it("supports multiple independent DataFetcher instances", async () => {
      type User = { id: string; name: string }

      const taskData: ReadonlyArray<Task> = sampleTasks
      const userData: ReadonlyArray<User> = [
        { id: "u1", name: "Alice" },
        { id: "u2", name: "Bob" },
      ]

      const taskLayer = ClientFetcher(taskData)
      const userLayer = ClientFetcher(userData)

      const taskFetcher = DataFetcher<Task>()
      const userFetcher = DataFetcher<User>()

      const taskProgram = pipe(
        taskFetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const userProgram = pipe(
        userFetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const tasks = await Effect.runPromise(Effect.provide(taskProgram, taskLayer))
      const users = await Effect.runPromise(Effect.provide(userProgram, userLayer))

      expect(tasks).toEqual(taskData)
      expect(users).toEqual(userData)
    })

    it("can be composed with other Effects", async () => {
      const layer = ClientFetcher(sampleTasks)
      const fetcher = DataFetcher<Task>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => {
              const tasks = Chunk.toReadonlyArray(chunks).flat()
              return tasks.filter((task) => task.priority > 2).length
            })
          )
        })
      )

      const count = await Effect.runPromise(Effect.provide(program, layer))

      expect(count).toBe(1)
    })
  })

  describe("Type Safety", () => {
    it("respects generic Row type", async () => {
      type CustomRow = {
        customId: number
        customName: string
      }

      const customData: ReadonlyArray<CustomRow> = [
        { customId: 1, customName: "Custom 1" },
        { customId: 2, customName: "Custom 2" },
      ]

      const layer = ClientFetcher(customData)
      const fetcher = DataFetcher<CustomRow>()

      const program = pipe(
        fetcher,
        Effect.flatMap((service) => {
          const stream = service.fetch({})
          return pipe(
            Stream.runCollect(stream),
            Effect.map((chunks) => Chunk.toReadonlyArray(chunks).flat())
          )
        })
      )

      const result = await Effect.runPromise(Effect.provide(program, layer))

      expect(result).toEqual(customData)
      expect(result[0].customId).toBe(1)
      expect(result[0].customName).toBe("Custom 1")
    })
  })
})
