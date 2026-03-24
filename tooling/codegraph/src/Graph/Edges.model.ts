import { $CodegraphId } from "@beep/identity";
import { ArrayOfStrings, LiteralKit } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $CodegraphId.create("Graph/Edges.model");

const DependsOnKind = LiteralKit(["import", "call", "http", "event", "env", "test"]).annotate(
  $I.annote("DependsOnKind", {
    description: "Supported dependency kinds for dependency edges.",
  })
);

const WritesToOperation = LiteralKit(["INSERT", "UPDATE", "DELETE", "UPSERT"]).annotate(
  $I.annote("WritesToOperation", {
    description: "Supported write operations for database write edges.",
  })
);

const UsesMetricOperation = LiteralKit(["inc", "dec", "set", "observe", "startTimer", "define"]).annotate(
  $I.annote("UsesMetricOperation", {
    description: "Supported metric operations for metric usage edges.",
  })
);

class GraphEdgeBase extends S.Class<GraphEdgeBase>($I`GraphEdgeBase`)(
  {
    id: S.String,
    sourceId: S.String,
    targetId: S.String,
    confidence: S.Number,
  },
  $I.annote("GraphEdgeBase", {
    description: "Shared graph edge fields without a discriminant.",
  })
) {}

/**
 * Supported graph edge kinds.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const EdgeType = LiteralKit([
  "CONTAINS",
  "IMPORTS",
  "EXPORTS",
  "EXTENDS",
  "IMPLEMENTS",
  "CALLS",
  "DEPENDS_ON",
  "HANDLES",
  "READS_FROM",
  "WRITES_TO",
  "CALLS_EXTERNAL",
  "TRIGGERS",
  "EMITS",
  "LISTENS_TO",
  "USES_ENV",
  "PRODUCES_JOB",
  "CONSUMES_JOB",
  "USES_METRIC",
  "STARTS_SPAN",
  "PRODUCES_MESSAGE",
  "CONSUMES_MESSAGE",
  "HAS_SECURITY_ISSUE",
  "SCHEDULES",
]).annotate(
  $I.annote("EdgeType", {
    description: "Supported graph edge kinds.",
  })
);

/**
 * Supported graph edge kinds.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type EdgeType = typeof EdgeType.Type;

/**
 * Supported call-resolution strategies.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CallResolution = LiteralKit(["same-file", "file-context", "import-resolved", "global-filtered"]).annotate(
  $I.annote("CallResolution", {
    description: "Resolution strategies for call edges.",
  })
);

/**
 * Supported call-resolution strategies.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CallResolution = typeof CallResolution.Type;

/**
 * Common graph edge shape.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class BaseEdge extends S.Class<BaseEdge>($I`BaseEdge`)(
  {
    id: S.String,
    type: EdgeType,
    sourceId: S.String,
    targetId: S.String,
    confidence: S.Number,
  },
  $I.annote("BaseEdge", {
    description: "Common graph edge shape.",
  })
) {}

/**
 * Contains relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ContainsEdge extends GraphEdgeBase.extend<ContainsEdge>($I`ContainsEdge`)(
  {
    type: S.tag("CONTAINS"),
  },
  $I.annote("ContainsEdge", {
    description: "Edge describing a containment relationship.",
  })
) {}

/**
 * Import relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ImportsEdge extends GraphEdgeBase.extend<ImportsEdge>($I`ImportsEdge`)(
  {
    type: S.tag("IMPORTS"),
    specifiers: ArrayOfStrings,
    isDefault: S.Boolean,
    isDynamic: S.Boolean,
  },
  $I.annote("ImportsEdge", {
    description: "Edge describing an import relationship.",
  })
) {}

/**
 * Export relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ExportsEdge extends GraphEdgeBase.extend<ExportsEdge>($I`ExportsEdge`)(
  {
    type: S.tag("EXPORTS"),
    isDefault: S.Boolean,
    alias: S.optional(S.String),
  },
  $I.annote("ExportsEdge", {
    description: "Edge describing an export relationship.",
  })
) {}

/**
 * Extends relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ExtendsEdge extends GraphEdgeBase.extend<ExtendsEdge>($I`ExtendsEdge`)(
  {
    type: S.tag("EXTENDS"),
  },
  $I.annote("ExtendsEdge", {
    description: "Edge describing an inheritance relationship.",
  })
) {}

/**
 * Implements relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ImplementsEdge extends GraphEdgeBase.extend<ImplementsEdge>($I`ImplementsEdge`)(
  {
    type: S.tag("IMPLEMENTS"),
  },
  $I.annote("ImplementsEdge", {
    description: "Edge describing an interface implementation relationship.",
  })
) {}

/**
 * Function or method call edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CallsEdge extends GraphEdgeBase.extend<CallsEdge>($I`CallsEdge`)(
  {
    type: S.tag("CALLS"),
    line: S.Number,
    column: S.optional(S.Number),
    resolution: S.optional(CallResolution),
  },
  $I.annote("CallsEdge", {
    description: "Edge describing a function or method call.",
  })
) {}

/**
 * Dependency relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class DependsOnEdge extends GraphEdgeBase.extend<DependsOnEdge>($I`DependsOnEdge`)(
  {
    type: S.tag("DEPENDS_ON"),
    kind: DependsOnKind,
  },
  $I.annote("DependsOnEdge", {
    description: "Edge describing a dependency relationship.",
  })
) {}

/**
 * Route or event handler edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class HandlesEdge extends GraphEdgeBase.extend<HandlesEdge>($I`HandlesEdge`)(
  {
    type: S.tag("HANDLES"),
    middleware: ArrayOfStrings,
  },
  $I.annote("HandlesEdge", {
    description: "Edge describing a handler relationship.",
  })
) {}

/**
 * Database read edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ReadsFromEdge extends GraphEdgeBase.extend<ReadsFromEdge>($I`ReadsFromEdge`)(
  {
    type: S.tag("READS_FROM"),
    query: S.optional(S.String),
  },
  $I.annote("ReadsFromEdge", {
    description: "Edge describing a database read relationship.",
  })
) {}

/**
 * Database write edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class WritesToEdge extends GraphEdgeBase.extend<WritesToEdge>($I`WritesToEdge`)(
  {
    type: S.tag("WRITES_TO"),
    operation: WritesToOperation,
  },
  $I.annote("WritesToEdge", {
    description: "Edge describing a database write relationship.",
  })
) {}

/**
 * External call edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class CallsExternalEdge extends GraphEdgeBase.extend<CallsExternalEdge>($I`CallsExternalEdge`)(
  {
    type: S.tag("CALLS_EXTERNAL"),
    method: S.String,
    endpoint: S.optional(S.String),
  },
  $I.annote("CallsExternalEdge", {
    description: "Edge describing an outbound external call.",
  })
) {}

/**
 * Trigger relationship edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TriggersEdge extends GraphEdgeBase.extend<TriggersEdge>($I`TriggersEdge`)(
  {
    type: S.tag("TRIGGERS"),
    schedule: S.optional(S.String),
  },
  $I.annote("TriggersEdge", {
    description: "Edge describing a trigger relationship.",
  })
) {}

/**
 * Event emission edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class EmitsEdge extends GraphEdgeBase.extend<EmitsEdge>($I`EmitsEdge`)(
  {
    type: S.tag("EMITS"),
    payload: S.optional(S.String),
  },
  $I.annote("EmitsEdge", {
    description: "Edge describing an emitted event.",
  })
) {}

/**
 * Event listener edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ListensToEdge extends GraphEdgeBase.extend<ListensToEdge>($I`ListensToEdge`)(
  {
    type: S.tag("LISTENS_TO"),
    handler: S.String,
  },
  $I.annote("ListensToEdge", {
    description: "Edge describing an event listener.",
  })
) {}

/**
 * Environment variable usage edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class UsesEnvEdge extends GraphEdgeBase.extend<UsesEnvEdge>($I`UsesEnvEdge`)(
  {
    type: S.tag("USES_ENV"),
  },
  $I.annote("UsesEnvEdge", {
    description: "Edge describing environment variable usage.",
  })
) {}

/**
 * Queue producer edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ProducesJobEdge extends GraphEdgeBase.extend<ProducesJobEdge>($I`ProducesJobEdge`)(
  {
    type: S.tag("PRODUCES_JOB"),
    jobName: S.optional(S.String),
  },
  $I.annote("ProducesJobEdge", {
    description: "Edge describing production of a queue job.",
  })
) {}

/**
 * Queue consumer edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ConsumesJobEdge extends GraphEdgeBase.extend<ConsumesJobEdge>($I`ConsumesJobEdge`)(
  {
    type: S.tag("CONSUMES_JOB"),
    jobName: S.optional(S.String),
  },
  $I.annote("ConsumesJobEdge", {
    description: "Edge describing consumption of a queue job.",
  })
) {}

/**
 * Metric usage edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class UsesMetricEdge extends GraphEdgeBase.extend<UsesMetricEdge>($I`UsesMetricEdge`)(
  {
    type: S.tag("USES_METRIC"),
    operation: UsesMetricOperation,
  },
  $I.annote("UsesMetricEdge", {
    description: "Edge describing metric usage.",
  })
) {}

/**
 * Span start edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class StartsSpanEdge extends GraphEdgeBase.extend<StartsSpanEdge>($I`StartsSpanEdge`)(
  {
    type: S.tag("STARTS_SPAN"),
    spanName: S.optional(S.String),
  },
  $I.annote("StartsSpanEdge", {
    description: "Edge describing span creation.",
  })
) {}

/**
 * Message producer edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ProducesMessageEdge extends GraphEdgeBase.extend<ProducesMessageEdge>($I`ProducesMessageEdge`)(
  {
    type: S.tag("PRODUCES_MESSAGE"),
    topicName: S.optional(S.String),
  },
  $I.annote("ProducesMessageEdge", {
    description: "Edge describing message production.",
  })
) {}

/**
 * Message consumer edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class ConsumesMessageEdge extends GraphEdgeBase.extend<ConsumesMessageEdge>($I`ConsumesMessageEdge`)(
  {
    type: S.tag("CONSUMES_MESSAGE"),
    topicName: S.optional(S.String),
  },
  $I.annote("ConsumesMessageEdge", {
    description: "Edge describing message consumption.",
  })
) {}

/**
 * Security issue association edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class HasSecurityIssueEdge extends GraphEdgeBase.extend<HasSecurityIssueEdge>($I`HasSecurityIssueEdge`)(
  {
    type: S.tag("HAS_SECURITY_ISSUE"),
  },
  $I.annote("HasSecurityIssueEdge", {
    description: "Edge associating a node with a security issue.",
  })
) {}

/**
 * Scheduled execution edge.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SchedulesEdge extends GraphEdgeBase.extend<SchedulesEdge>($I`SchedulesEdge`)(
  {
    type: S.tag("SCHEDULES"),
    schedule: S.optional(S.String),
  },
  $I.annote("SchedulesEdge", {
    description: "Edge describing a scheduling relationship.",
  })
) {}

/**
 * Graph edge union keyed by `type`.
 *
 * @returns Tagged schema covering every supported graph edge relationship.
 * @category DomainModel
 * @since 0.0.0
 */
export const GraphEdge = EdgeType.mapMembers(
  Tuple.evolve([
    () => ContainsEdge,
    () => ImportsEdge,
    () => ExportsEdge,
    () => ExtendsEdge,
    () => ImplementsEdge,
    () => CallsEdge,
    () => DependsOnEdge,
    () => HandlesEdge,
    () => ReadsFromEdge,
    () => WritesToEdge,
    () => CallsExternalEdge,
    () => TriggersEdge,
    () => EmitsEdge,
    () => ListensToEdge,
    () => UsesEnvEdge,
    () => ProducesJobEdge,
    () => ConsumesJobEdge,
    () => UsesMetricEdge,
    () => StartsSpanEdge,
    () => ProducesMessageEdge,
    () => ConsumesMessageEdge,
    () => HasSecurityIssueEdge,
    () => SchedulesEdge,
  ])
)
  .annotate(
    $I.annote("GraphEdge", {
      description: "Graph edge union keyed by `type`.",
    })
  )
  .pipe(S.toTaggedUnion("type"));

/**
 * Graph edge union keyed by `type`.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type GraphEdge = typeof GraphEdge.Type;
