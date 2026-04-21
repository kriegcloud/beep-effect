/**
 * Skill validation: schema-model-specialist
 *
 * Proves that the Schema + LiteralKit + Model APIs referenced in the
 * specialist skill actually type-check in this repo.
 */
import { $ScratchId } from "@beep/identity"
import { LiteralKit } from "@beep/schema"
import { withKeyDefaults } from "@beep/schema/SchemaUtils/withKeyDefaults"
import * as S from "effect/Schema"

const $I = $ScratchId.create("schema-model-test")

// ---------------------------------------------------------------------------
// 1. LiteralKit with basic usage
// ---------------------------------------------------------------------------

const Status = LiteralKit(["active", "inactive", "pending"] as const)

// Schema usage
type StatusType = typeof Status.Type
void (undefined as unknown as StatusType)

// Enum access
const _active: "active" = Status.Enum.active
void _active

// Guard
const _isActive: boolean = Status.is.active("active")
void _isActive

// Options
const _opts: readonly ["active", "inactive", "pending"] = Status.Options
void _opts

// $match (dual form)
const label = Status.$match({
  active: () => "Active" as const,
  inactive: () => "Inactive" as const,
  pending: () => "Pending" as const,
})
const _result = label("active")
void _result

// ---------------------------------------------------------------------------
// 2. LiteralKit.toTaggedUnion("_tag")(cases)
// ---------------------------------------------------------------------------

const EventKind = LiteralKit(["created", "deleted"] as const)

const DomainEvent = EventKind.toTaggedUnion("_tag")({
  created: { value: S.Number },
  deleted: { reason: S.String },
})
type DomainEventType = typeof DomainEvent.Type
void (undefined as unknown as DomainEventType)

// ---------------------------------------------------------------------------
// 3. S.TemplateLiteral
// ---------------------------------------------------------------------------

const ApiRoute = S.TemplateLiteral(["/api/v1/", S.String])
type ApiRouteType = typeof ApiRoute.Type
void (undefined as unknown as ApiRouteType)

// ---------------------------------------------------------------------------
// 4. S.toTaggedUnion on a Union
// ---------------------------------------------------------------------------

const Shape = S.toTaggedUnion("_tag")(
  S.Union([
    S.Struct({ _tag: S.tag("circle"), radius: S.Number }),
    S.Struct({ _tag: S.tag("square"), side: S.Number }),
  ])
)
type ShapeType = typeof Shape.Type
void (undefined as unknown as ShapeType)

// ---------------------------------------------------------------------------
// 5. S.Class with $I identity pattern
// ---------------------------------------------------------------------------

class Person extends S.Class<Person>($I`Person`)({
  name: S.String,
  age: S.Number,
}) {}

const _p = new Person({ name: "Alice", age: 30 })
void _p

// ---------------------------------------------------------------------------
// 6. S.optionalKey with withKeyDefaults
// ---------------------------------------------------------------------------

const TaskSchema = S.Struct({
  title: S.String,
  status: S.optionalKey(withKeyDefaults(S.String, "draft")),
})

type TaskType = typeof TaskSchema.Type
void (undefined as unknown as TaskType)
