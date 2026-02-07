// Machine namespace (Effect-style)

// Actor types and system
export type { ActorRef, ActorSystem } from "./actor";
export { ActorSystem as ActorSystemService, Default as ActorSystemDefault } from "./actor";
// Errors
export {
  AssertionError,
  DuplicateActorError,
  InvalidSchemaError,
  MissingMatchHandlerError,
  MissingSchemaError,
  ProvisionValidationError,
  SlotProvisionError,
  UnprovidedSlotsError,
} from "./errors";
export * as Machine from "./facade";
// Inspection
export type {
  AnyInspectionEvent,
  EffectEvent,
  ErrorEvent,
  EventReceivedEvent,
  InspectionEvent,
  Inspector,
  SpawnEvent,
  StopEvent,
  TransitionEvent,
} from "./inspection";
export {
  collectingInspector,
  consoleInspector,
  Inspector as InspectorService,
  makeInspector,
} from "./inspection";
// Core machine types (for advanced use)
export type {
  BackgroundEffect,
  BuiltMachine,
  HandlerContext,
  Machine as MachineType,
  MachineRef,
  MakeConfig,
  PersistOptions,
  ProvideHandlers,
  SpawnEffect,
  StateHandlerContext,
  Transition,
} from "./machine";
// Persistence
export type {
  ActorMetadata,
  PersistedEvent,
  PersistenceAdapter,
  PersistenceConfig,
  PersistentActorRef,
  PersistentMachine,
  RestoreFailure,
  RestoreResult,
  Snapshot,
} from "./persistence/index";
export {
  createPersistentActor,
  InMemoryPersistenceAdapter,
  isPersistentMachine,
  makeInMemoryPersistenceAdapter,
  PersistenceAdapterTag,
  PersistenceError,
  restorePersistentActor,
  VersionConflictError,
} from "./persistence/index";
export type { MachineEventSchema, MachineStateSchema } from "./schema";
// Schema-first State/Event definitions
export { Event, State } from "./schema";
export type {
  EffectHandlers as SlotEffectHandlers,
  EffectSlot as SlotEffectSlot,
  EffectSlots,
  EffectsDef,
  EffectsSchema,
  GuardHandlers,
  GuardSlot,
  GuardSlots,
  GuardsDef,
  GuardsSchema,
  MachineContext,
} from "./slot";
// Slot module
export { Slot } from "./slot";
export type { SimulationResult, TestHarness, TestHarnessOptions } from "./testing";
// Testing utilities
export {
  assertNeverReaches,
  assertPath,
  assertReaches,
  createTestHarness,
  simulate,
} from "./testing";
