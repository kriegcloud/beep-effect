import { makeInMemorySyncConflictRepository } from "@beep/documents-server/entities/SyncConflict";
import { makeInMemorySyncCursorRepository } from "@beep/documents-server/entities/SyncCursor";
import { makeInMemorySyncItemRepository } from "@beep/documents-server/entities/SyncItem";
import { makeInMemorySyncOperationRepository } from "@beep/documents-server/entities/SyncOperation";
import { it } from "@beep/test-runner";
import { describe } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Versioning from "./SyncRepositoryVersioning.contract.ts";

// The in-memory adapters run each read-modify-write without an async boundary,
// so the injected write race is Drizzle-only (see the PGlite suite); the
// compare-and-increment contract itself is shared.
describe("Sync repository optimistic concurrency (in-memory)", () => {
  it.effect(
    "rejects a stale SyncItem update with a typed version conflict",
    Effect.fnUntraced(function* () {
      yield* Versioning.staleSyncItemUpdate(yield* makeInMemorySyncItemRepository());
    })
  );

  it.effect(
    "advances SyncOperation versions on requeue so a stale lease cannot write",
    Effect.fnUntraced(function* () {
      yield* Versioning.staleSyncOperationAfterRequeue(yield* makeInMemorySyncOperationRepository());
    })
  );

  it.effect(
    "advances the SyncConflict version on review",
    Effect.fnUntraced(function* () {
      yield* Versioning.reviewAdvancesSyncConflictVersion(yield* makeInMemorySyncConflictRepository());
    })
  );

  it.effect(
    "advances the SyncCursor version on a replacing upsert",
    Effect.fnUntraced(function* () {
      yield* Versioning.upsertAdvancesSyncCursorVersion(yield* makeInMemorySyncCursorRepository());
    })
  );
});
