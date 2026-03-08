import { Effect, HashMap, Layer, Option, Ref, ServiceMap } from "effect"
import type { FileReadState } from "./FileTypes.js"

type ScopeReads = HashMap.HashMap<string, FileReadState>

export interface FileReadTrackerService {
  readonly recordRead: (
    scopeKey: string,
    state: FileReadState
  ) => Effect.Effect<void>
  readonly getLastRead: (
    scopeKey: string,
    canonicalPath: string
  ) => Effect.Effect<FileReadState | null>
  readonly clearScope: (
    scopeKey: string
  ) => Effect.Effect<void>
}

export class FileReadTracker extends ServiceMap.Service<FileReadTracker>()(
  "server/tools/file/FileReadTracker",
  {
    make: Effect.gen(function*() {
      const stateRef = yield* Ref.make(
        HashMap.empty<string, ScopeReads>()
      )

      const recordRead: FileReadTrackerService["recordRead"] = (scopeKey, state) =>
        Ref.update(stateRef, (store) => {
          const currentScope = HashMap.get(store, scopeKey)
          const scopeReads = Option.isSome(currentScope)
            ? currentScope.value
            : HashMap.empty<string, FileReadState>()
          const nextScopeReads = HashMap.set(
            scopeReads,
            state.canonicalPath,
            state
          )
          return HashMap.set(store, scopeKey, nextScopeReads)
        })

      const getLastRead: FileReadTrackerService["getLastRead"] = (
        scopeKey,
        canonicalPath
      ) =>
        Ref.get(stateRef).pipe(
          Effect.map((store) => {
            const scopeReads = HashMap.get(store, scopeKey)
            if (Option.isNone(scopeReads)) {
              return null
            }
            const entry = HashMap.get(scopeReads.value, canonicalPath)
            return Option.isSome(entry) ? entry.value : null
          })
        )

      const clearScope: FileReadTrackerService["clearScope"] = (scopeKey) =>
        Ref.update(stateRef, HashMap.remove(scopeKey))

      return {
        recordRead,
        getLastRead,
        clearScope
      } satisfies FileReadTrackerService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
