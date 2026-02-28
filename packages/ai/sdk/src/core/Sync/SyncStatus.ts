import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { SyncService } from "./SyncService.js";

/**
 * @since 0.0.0
 */
export const status = Effect.service(SyncService).pipe(Effect.flatMap((service) => service.status()));

/**
 * @since 0.0.0
 */
export const statusStream = Stream.unwrap(
  Effect.service(SyncService).pipe(Effect.map((service) => service.statusStream()))
);
