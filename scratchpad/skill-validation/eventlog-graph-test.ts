/**
 * Skill validation: eventlog-graph-specialist
 *
 * Proves that the Effect v4 EventLog / EventGroup / Event APIs referenced in
 * the specialist skill actually type-check in this repo.
 */
import * as S from "effect/Schema"
import { Event, EventGroup, EventJournal, EventLog } from "effect/unstable/eventlog"

// ---------------------------------------------------------------------------
// 1. Event types exist and are importable
// ---------------------------------------------------------------------------

void Event.TypeId
void EventGroup.TypeId

// ---------------------------------------------------------------------------
// 2. EventGroup.empty -- create an empty group
// ---------------------------------------------------------------------------

const _emptyGroup: EventGroup.EventGroup<never> = EventGroup.empty
void _emptyGroup

// ---------------------------------------------------------------------------
// 3. EventGroup.empty.add(...) -- add events to a group
// ---------------------------------------------------------------------------

const TodoEvents = EventGroup.empty
  .add({
    tag: "TodoCreated",
    primaryKey: (payload) => payload.id,
    payload: S.Struct({ id: S.String, title: S.String }),
    success: S.Void,
  })
  .add({
    tag: "TodoCompleted",
    primaryKey: (payload) => payload.id,
    payload: S.Struct({ id: S.String }),
    success: S.Void,
  })

void TodoEvents

// ---------------------------------------------------------------------------
// 4. EventGroup.addError -- add error to all events in a group
// ---------------------------------------------------------------------------

const TodoEventsWithError = TodoEvents.addError(
  S.Struct({ code: S.String, message: S.String })
)
void TodoEventsWithError

// ---------------------------------------------------------------------------
// 5. EventLog.schema(...groups) -- create an EventLog schema
// ---------------------------------------------------------------------------

const TodoLogSchema = EventLog.schema(TodoEvents)
void TodoLogSchema

// ---------------------------------------------------------------------------
// 6. EventLog service tag exists
// ---------------------------------------------------------------------------

void EventLog.EventLog

// ---------------------------------------------------------------------------
// 7. EventJournal service tag exists
// ---------------------------------------------------------------------------

void EventJournal.EventJournal

// ---------------------------------------------------------------------------
// 8. Type-level: extract events from a group
// ---------------------------------------------------------------------------

type _TodoGroupEvents = EventGroup.Events<typeof TodoEvents>
void (undefined as unknown as _TodoGroupEvents)

// ---------------------------------------------------------------------------
// 9. Event.isEvent guard
// ---------------------------------------------------------------------------

const _isEvent: (u: unknown) => u is Event.Event<any, any, any, any> = Event.isEvent
void _isEvent
