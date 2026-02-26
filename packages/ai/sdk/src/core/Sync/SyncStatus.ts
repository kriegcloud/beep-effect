import * as Effect from "effect/Effect"
import * as Stream from "effect/Stream"
import { SyncService } from "./SyncService.js"

export const status = Effect.service(SyncService).pipe(
  Effect.flatMap((service) => service.status())
)

export const statusStream = Stream.unwrap(
  Effect.service(SyncService).pipe(
    Effect.map((service) => service.statusStream())
  )
)
