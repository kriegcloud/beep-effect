import { expect, test } from "bun:test"
import * as EventJournal from "@effect/experimental/EventJournal"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { runEffect } from "./effect-test.js"
import { Sync } from "../src/index.js"

const makeEntry = (msecs: number, label: string) =>
  new EventJournal.Entry({
    id: EventJournal.makeEntryId({ msecs }),
    event: `event-${label}`,
    primaryKey: "pk",
    payload: new TextEncoder().encode(label)
  })

const resolveWith = (
  layer: Layer.Layer<Sync.ConflictPolicy>,
  entry: EventJournal.Entry,
  conflicts: ReadonlyArray<EventJournal.Entry>
) =>
  runEffect(
    Effect.gen(function*() {
      const policy = yield* Sync.ConflictPolicy
      return yield* policy.resolve({ entry, conflicts })
    }).pipe(Effect.provide(layer))
  )

test("ConflictPolicy.lastWriteWins chooses the newest entry", async () => {
  const older = makeEntry(1000, "older")
  const newer = makeEntry(2000, "newer")

  const result = await resolveWith(
    Sync.ConflictPolicy.layerLastWriteWins,
    older,
    [newer]
  )

  expect(result._tag).toBe("accept")
  if (result._tag === "accept") {
    expect(result.entry.idString).toBe(newer.idString)
  }
})

test("ConflictPolicy.firstWriteWins chooses the earliest entry", async () => {
  const older = makeEntry(1000, "older")
  const newer = makeEntry(2000, "newer")

  const result = await resolveWith(
    Sync.ConflictPolicy.layerFirstWriteWins,
    newer,
    [older]
  )

  expect(result._tag).toBe("accept")
  if (result._tag === "accept") {
    expect(result.entry.idString).toBe(older.idString)
  }
})

test("ConflictPolicy.reject returns rejection with reason", async () => {
  const entry = makeEntry(1000, "entry")
  const conflict = makeEntry(2000, "conflict")

  const result = await resolveWith(
    Sync.ConflictPolicy.layerReject("conflict"),
    entry,
    [conflict]
  )

  expect(result._tag).toBe("reject")
  if (result._tag === "reject") {
    expect(result.reason).toBe("conflict")
  }
})

test("ConflictPolicy.merge returns merged entry", async () => {
  const entry = makeEntry(1000, "entry")
  const conflict = makeEntry(2000, "conflict")

  const result = await resolveWith(
    Sync.ConflictPolicy.layerMerge((_entry, conflicts) => conflicts[0] ?? _entry),
    entry,
    [conflict]
  )

  expect(result._tag).toBe("merge")
  if (result._tag === "merge") {
    expect(result.entry.idString).toBe(conflict.idString)
  }
})
