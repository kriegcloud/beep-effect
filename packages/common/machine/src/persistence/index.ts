// Core types
export type {
  ActorMetadata,
  PersistedEvent,
  PersistenceAdapter,
  RestoreFailure,
  RestoreResult,
  Snapshot,
} from "./adapter";
export { PersistenceAdapterTag, PersistenceError, VersionConflictError } from "./adapter";
// Adapters
export {
  InMemoryPersistenceAdapter,
  makeInMemoryPersistenceAdapter,
} from "./adapters/in-memory";
// Persistent actor
export type { PersistentActorRef } from "./persistent-actor";
export { createPersistentActor, restorePersistentActor } from "./persistent-actor";
// Persistent machine
export type { PersistenceConfig, PersistentMachine } from "./persistent-machine";
export { isPersistentMachine, persist } from "./persistent-machine";
