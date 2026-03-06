import { $CodegraphId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $CodegraphId.create("Graph/Nodes.model");

const VariableKind = LiteralKit(["const", "let", "var"]).annotate(
  $I.annote("VariableKind", {
    description: "Supported variable declaration kinds.",
  })
);

const ModuleType = LiteralKit(["file", "package", "external"]).annotate(
  $I.annote("ModuleType", {
    description: "Supported module node categories.",
  })
);

const RouteMethod = LiteralKit(["GET", "POST", "PUT", "DELETE", "PATCH", "ALL"]).annotate(
  $I.annote("RouteMethod", {
    description: "Supported HTTP methods for route nodes.",
  })
);

const DbOperation = LiteralKit(["SELECT", "INSERT", "UPDATE", "DELETE"]).annotate(
  $I.annote("DbOperation", {
    description: "Supported database operations for table nodes.",
  })
);

const EventKind = LiteralKit(["emit", "listen"]).annotate(
  $I.annote("EventKind", {
    description: "Supported event node kinds.",
  })
);

const QueueJobKind = LiteralKit(["producer", "consumer"]).annotate(
  $I.annote("QueueJobKind", {
    description: "Supported queue job node kinds.",
  })
);

const MetricType = LiteralKit(["counter", "gauge", "histogram", "summary", "unknown"]).annotate(
  $I.annote("MetricType", {
    description: "Supported metric node kinds.",
  })
);

const SpanKind = LiteralKit(["server", "client", "producer", "consumer", "internal"]).annotate(
  $I.annote("SpanKind", {
    description: "Supported tracing span kinds.",
  })
);

const TopicBroker = LiteralKit(["kafka", "rabbitmq", "nats", "sqs", "sns", "pubsub", "unknown"]).annotate(
  $I.annote("TopicBroker", {
    description: "Supported topic brokers for message nodes.",
  })
);

const TopicKind = LiteralKit(["producer", "consumer"]).annotate(
  $I.annote("TopicKind", {
    description: "Supported topic node roles.",
  })
);

const SecurityIssueSeverity = LiteralKit(["critical", "high", "medium", "low"]).annotate(
  $I.annote("SecurityIssueSeverity", {
    description: "Supported security issue severities.",
  })
);

const SecurityIssueCategory = LiteralKit([
  "hardcoded_secret",
  "weak_crypto",
  "insecure_config",
  "exposed_credential",
]).annotate(
  $I.annote("SecurityIssueCategory", {
    description: "Supported security issue categories.",
  })
);

class GraphNodeBase extends S.Class<GraphNodeBase>($I`GraphNodeBase`)(
  {
    id: S.String,
  },
  $I.annote("GraphNodeBase", {
    description: "Shared graph node fields without a discriminant.",
  })
) {}

/**
 * Parameter metadata for function nodes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ParameterInfo extends S.Class<ParameterInfo>($I`ParameterInfo`)(
  {
    name: S.String,
    type: S.optional(S.String),
    optional: S.Boolean,
    defaultValue: S.optional(S.String),
  },
  $I.annote("ParameterInfo", {
    description: "Parameter metadata for function nodes.",
  })
) {}

/**
 * File system node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FileNode extends GraphNodeBase.extend<FileNode>($I`FileNode`)(
  {
    type: S.tag("file"),
    path: S.String,
    language: S.String,
    hash: S.String,
    size: S.Number,
    lineCount: S.Number,
    lastParsed: S.String,
  },
  $I.annote("FileNode", {
    description: "Graph node representing a source file.",
  })
) {}

/**
 * Function or method node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class FunctionNode extends GraphNodeBase.extend<FunctionNode>($I`FunctionNode`)(
  {
    type: S.tag("function"),
    name: S.String,
    filePath: S.String,
    startLine: S.Number,
    endLine: S.Number,
    params: S.Array(ParameterInfo),
    returnType: S.optional(S.String),
    isAsync: S.Boolean,
    isExported: S.Boolean,
    isGenerator: S.Boolean,
    decorators: S.Array(S.String),
    confidence: S.Number,
    bodyHash: S.optional(S.String),
  },
  $I.annote("FunctionNode", {
    description: "Graph node representing a function or method.",
  })
) {}

/**
 * Captures class declarations and their structural metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ClassNode extends GraphNodeBase.extend<ClassNode>($I`ClassNode`)(
  {
    type: S.tag("class"),
    name: S.String,
    filePath: S.String,
    startLine: S.Number,
    endLine: S.Number,
    isExported: S.Boolean,
    isAbstract: S.Boolean,
    superClass: S.optional(S.String),
    interfaces: S.Array(S.String),
    decorators: S.Array(S.String),
    methods: S.Array(S.String),
    properties: S.Array(S.String),
    bodyHash: S.optional(S.String),
  },
  $I.annote("ClassNode", {
    description: "Graph node representing a class declaration.",
  })
) {}

/**
 * Captures variable declarations that participate in the graph.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class VariableNode extends GraphNodeBase.extend<VariableNode>($I`VariableNode`)(
  {
    type: S.tag("variable"),
    name: S.String,
    filePath: S.String,
    line: S.Number,
    kind: VariableKind,
    isExported: S.Boolean,
    valueType: S.optional(S.String),
  },
  $I.annote("VariableNode", {
    description: "Graph node representing a variable declaration.",
  })
) {}

/**
 * Captures a logical module boundary within the indexed project.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ModuleNode extends GraphNodeBase.extend<ModuleNode>($I`ModuleNode`)(
  {
    type: S.tag("module"),
    name: S.String,
    path: S.String,
    moduleType: ModuleType,
  },
  $I.annote("ModuleNode", {
    description: "Graph node representing a module.",
  })
) {}

/**
 * Captures HTTP route handlers and their attached API metadata.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RouteNode extends GraphNodeBase.extend<RouteNode>($I`RouteNode`)(
  {
    type: S.tag("route"),
    method: RouteMethod,
    path: S.String,
    handlerName: S.String,
    filePath: S.String,
    middleware: S.Array(S.String),
    apiTags: S.optional(S.Array(S.String)),
    apiSummary: S.optional(S.String),
    apiDescription: S.optional(S.String),
    apiResponseStatus: S.optional(S.Array(S.Number)),
  },
  $I.annote("RouteNode", {
    description: "Graph node representing an HTTP route.",
  })
) {}

/**
 * Database table node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DBTableNode extends GraphNodeBase.extend<DBTableNode>($I`DBTableNode`)(
  {
    type: S.tag("db_table"),
    name: S.String,
    schema: S.optional(S.String),
    operations: S.Array(DbOperation),
  },
  $I.annote("DBTableNode", {
    description: "Graph node representing a database table.",
  })
) {}

/**
 * Database column node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class DBColumnNode extends GraphNodeBase.extend<DBColumnNode>($I`DBColumnNode`)(
  {
    type: S.tag("db_column"),
    name: S.String,
    tableName: S.String,
    dataType: S.optional(S.String),
    nullable: S.optional(S.Boolean),
  },
  $I.annote("DBColumnNode", {
    description: "Graph node representing a database column.",
  })
) {}

/**
 * External API node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ExternalAPINode extends GraphNodeBase.extend<ExternalAPINode>($I`ExternalAPINode`)(
  {
    type: S.tag("external_api"),
    name: S.String,
    baseUrl: S.optional(S.String),
    methods: S.Array(S.String),
  },
  $I.annote("ExternalAPINode", {
    description: "Graph node representing an external API.",
  })
) {}

/**
 * Captures scheduled job handlers and their execution schedule.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CronJobNode extends GraphNodeBase.extend<CronJobNode>($I`CronJobNode`)(
  {
    type: S.tag("cron_job"),
    name: S.String,
    schedule: S.String,
    handlerName: S.String,
    filePath: S.String,
  },
  $I.annote("CronJobNode", {
    description: "Graph node representing a cron job.",
  })
) {}

/**
 * Captures application events that can be emitted or handled.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EventNode extends GraphNodeBase.extend<EventNode>($I`EventNode`)(
  {
    type: S.tag("event"),
    name: S.String,
    eventKind: EventKind,
    filePath: S.String,
    namespace: S.optional(S.String),
    room: S.optional(S.String),
  },
  $I.annote("EventNode", {
    description: "Graph node representing an application event.",
  })
) {}

/**
 * Environment variable node.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EnvVarNode extends GraphNodeBase.extend<EnvVarNode>($I`EnvVarNode`)(
  {
    type: S.tag("env_var"),
    name: S.String,
    required: S.Boolean,
    defaultValue: S.optional(S.String),
  },
  $I.annote("EnvVarNode", {
    description: "Graph node representing an environment variable.",
  })
) {}

/**
 * Captures queued work items and the job kind they represent.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class QueueJobNode extends GraphNodeBase.extend<QueueJobNode>($I`QueueJobNode`)(
  {
    type: S.tag("queue_job"),
    name: S.String,
    queueName: S.String,
    filePath: S.String,
    jobKind: QueueJobKind,
  },
  $I.annote("QueueJobNode", {
    description: "Graph node representing a queue job.",
  })
) {}

/**
 * Captures metrics that are produced or observed by the system.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class MetricNode extends GraphNodeBase.extend<MetricNode>($I`MetricNode`)(
  {
    type: S.tag("metric"),
    name: S.String,
    metricType: MetricType,
    help: S.optional(S.String),
    filePath: S.String,
  },
  $I.annote("MetricNode", {
    description: "Graph node representing a metric.",
  })
) {}

/**
 * Captures tracing spans and their optional semantic attributes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SpanNode extends GraphNodeBase.extend<SpanNode>($I`SpanNode`)(
  {
    type: S.tag("span"),
    name: S.String,
    spanKind: S.optional(SpanKind),
    attributes: S.optional(S.Array(S.String)),
    filePath: S.String,
  },
  $I.annote("SpanNode", {
    description: "Graph node representing a tracing span.",
  })
) {}

/**
 * Captures broker topics or queues used for message transport.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TopicNode extends GraphNodeBase.extend<TopicNode>($I`TopicNode`)(
  {
    type: S.tag("topic"),
    name: S.String,
    broker: TopicBroker,
    topicKind: TopicKind,
    filePath: S.String,
  },
  $I.annote("TopicNode", {
    description: "Graph node representing a message topic or queue.",
  })
) {}

/**
 * Captures detected security findings anchored to source locations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SecurityIssueNode extends GraphNodeBase.extend<SecurityIssueNode>($I`SecurityIssueNode`)(
  {
    type: S.tag("security_issue"),
    name: S.String,
    severity: SecurityIssueSeverity,
    category: SecurityIssueCategory,
    filePath: S.String,
    line: S.Number,
    description: S.String,
  },
  $I.annote("SecurityIssueNode", {
    description: "Graph node representing a detected security issue.",
  })
) {}

/**
 * Captures the top-level project boundary represented in the graph.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ProjectNode extends GraphNodeBase.extend<ProjectNode>($I`ProjectNode`)(
  {
    type: S.tag("project"),
    name: S.String,
    rootPath: S.String,
    createdAt: S.String,
    lastScanAt: S.optional(S.String),
  },
  $I.annote("ProjectNode", {
    description: "Graph node representing a scanned project boundary.",
  })
) {}

/**
 * Supported graph node kinds.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const NodeType = LiteralKit([
  "file",
  "function",
  "class",
  "variable",
  "module",
  "route",
  "db_table",
  "db_column",
  "external_api",
  "cron_job",
  "event",
  "env_var",
  "queue_job",
  "metric",
  "span",
  "topic",
  "security_issue",
  "project",
]).annotate(
  $I.annote("NodeType", {
    description: "Supported graph node kinds.",
  })
);

/**
 * Supported graph node kinds.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NodeType = typeof NodeType.Type;

/**
 * Graph node union keyed by `type`.
 *
 * @returns Tagged schema covering every supported graph node variant.
 * @since 0.0.0
 * @category DomainModel
 */
export const GraphNode = NodeType.mapMembers(
  Tuple.evolve([
    () => FileNode,
    () => FunctionNode,
    () => ClassNode,
    () => VariableNode,
    () => ModuleNode,
    () => RouteNode,
    () => DBTableNode,
    () => DBColumnNode,
    () => ExternalAPINode,
    () => CronJobNode,
    () => EventNode,
    () => EnvVarNode,
    () => QueueJobNode,
    () => MetricNode,
    () => SpanNode,
    () => TopicNode,
    () => SecurityIssueNode,
    () => ProjectNode,
  ])
)
  .annotate(
    $I.annote("GraphNode", {
      description: "Graph node union keyed by `type`.",
    })
  )
  .pipe(S.toTaggedUnion("type"));

/**
 * Graph node union keyed by `type`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GraphNode = typeof GraphNode.Type;
