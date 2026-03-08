import { Layer } from "effect"
import * as Chat from "effect/unstable/ai/Chat"
import * as Persistence from "effect/unstable/persistence/Persistence"

export const layer = Chat.layerPersisted({
  storeId: "session_chat"
}).pipe(
  Layer.provide(Persistence.layerBackingSql)
)
