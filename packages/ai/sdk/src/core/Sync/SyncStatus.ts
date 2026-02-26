import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { SyncService } from "./SyncService.js"

export const status = Effect.flatMap(SyncService, (service) => service.status())

export const statusStream = Stream.unwrap(
  Effect.map(SyncService, (service) => service.statusStream())
)
