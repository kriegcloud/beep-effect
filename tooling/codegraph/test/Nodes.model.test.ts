import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";
import {
  ClassNode,
  CronJobNode,
  DBColumnNode,
  DBTableNode,
  EnvVarNode,
  EventNode,
  ExternalAPINode,
  FileNode,
  FunctionNode,
  GraphNode,
  MetricNode,
  ModuleNode,
  NodeType,
  ParameterInfo,
  ProjectNode,
  QueueJobNode,
  RouteNode,
  SecurityIssueNode,
  SpanNode,
  TopicNode,
  VariableNode,
} from "../src/Graph/Nodes.model.ts";

const decodeGraphNode = S.decodeUnknownSync(GraphNode);
const decodeNodeType = S.decodeUnknownSync(NodeType);
const decodeParameterInfo = S.decodeUnknownSync(ParameterInfo);

const nodeCases: ReadonlyArray<{
  readonly tag: NodeType;
  readonly input: Readonly<Record<string, unknown>>;
  readonly assert: (node: GraphNode) => void;
}> = [
  {
    tag: "file",
    input: {
      id: "file-1",
      type: "file",
      path: "src/index.ts",
      language: "typescript",
      hash: "abc123",
      size: 1024,
      lineCount: 45,
      lastParsed: "2026-03-06T10:00:00Z",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(FileNode);
      expect(GraphNode.guards.file(node)).toBe(true);
      if (node instanceof FileNode) {
        expect(node.path).toBe("src/index.ts");
        expect(node.lineCount).toBe(45);
      }
    },
  },
  {
    tag: "function",
    input: {
      id: "function-1",
      type: "function",
      name: "loadConfig",
      filePath: "src/config.ts",
      startLine: 10,
      endLine: 24,
      params: [
        {
          name: "root",
          optional: false,
        },
        {
          name: "mode",
          type: "string",
          optional: true,
          defaultValue: "dev",
        },
      ],
      isAsync: true,
      isExported: true,
      isGenerator: false,
      decorators: ["trace"],
      confidence: 0.99,
      bodyHash: "function-hash",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(FunctionNode);
      expect(GraphNode.guards.function(node)).toBe(true);
      if (node instanceof FunctionNode) {
        expect(node.params).toHaveLength(2);
        expect(node.params[0]).toBeInstanceOf(ParameterInfo);
        expect(node.params[1].defaultValue).toBe("dev");
        expect(node.bodyHash).toBe("function-hash");
        expect(node.returnType).toBeUndefined();
      }
    },
  },
  {
    tag: "class",
    input: {
      id: "class-1",
      type: "class",
      name: "UserService",
      filePath: "src/user.ts",
      startLine: 5,
      endLine: 80,
      isExported: true,
      isAbstract: false,
      superClass: "BaseService",
      interfaces: ["Disposable"],
      decorators: ["singleton"],
      methods: ["load", "save"],
      properties: ["client"],
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(ClassNode);
      expect(GraphNode.guards.class(node)).toBe(true);
      if (node instanceof ClassNode) {
        expect(node.superClass).toBe("BaseService");
        expect(node.methods).toEqual(["load", "save"]);
        expect(node.bodyHash).toBeUndefined();
      }
    },
  },
  {
    tag: "variable",
    input: {
      id: "variable-1",
      type: "variable",
      name: "DEFAULT_PORT",
      filePath: "src/constants.ts",
      line: 4,
      kind: "const",
      isExported: true,
      valueType: "number",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(VariableNode);
      expect(GraphNode.guards.variable(node)).toBe(true);
      if (node instanceof VariableNode) {
        expect(node.kind).toBe("const");
        expect(node.valueType).toBe("number");
      }
    },
  },
  {
    tag: "module",
    input: {
      id: "module-1",
      type: "module",
      name: "@beep/codegraph",
      path: "tooling/codegraph",
      moduleType: "package",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(ModuleNode);
      expect(GraphNode.guards.module(node)).toBe(true);
      if (node instanceof ModuleNode) {
        expect(node.moduleType).toBe("package");
      }
    },
  },
  {
    tag: "route",
    input: {
      id: "route-1",
      type: "route",
      method: "POST",
      path: "/users",
      handlerName: "createUser",
      filePath: "src/http/routes.ts",
      middleware: ["auth", "audit"],
      apiTags: ["Users"],
      apiSummary: "Create a user",
      apiDescription: "Creates a new user record.",
      apiResponseStatus: [201, 400],
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(RouteNode);
      expect(GraphNode.guards.route(node)).toBe(true);
      if (node instanceof RouteNode) {
        expect(node.middleware).toEqual(["auth", "audit"]);
        expect(node.apiResponseStatus).toEqual([201, 400]);
      }
    },
  },
  {
    tag: "db_table",
    input: {
      id: "db-table-1",
      type: "db_table",
      name: "users",
      schema: "public",
      operations: ["SELECT", "UPDATE"],
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(DBTableNode);
      expect(GraphNode.guards.db_table(node)).toBe(true);
      if (node instanceof DBTableNode) {
        expect(node.operations).toEqual(["SELECT", "UPDATE"]);
      }
    },
  },
  {
    tag: "db_column",
    input: {
      id: "db-column-1",
      type: "db_column",
      name: "email",
      tableName: "users",
      dataType: "varchar",
      nullable: false,
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(DBColumnNode);
      expect(GraphNode.guards.db_column(node)).toBe(true);
      if (node instanceof DBColumnNode) {
        expect(node.dataType).toBe("varchar");
        expect(node.nullable).toBe(false);
      }
    },
  },
  {
    tag: "external_api",
    input: {
      id: "external-api-1",
      type: "external_api",
      name: "Stripe",
      baseUrl: "https://api.stripe.com",
      methods: ["GET", "POST"],
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(ExternalAPINode);
      expect(GraphNode.guards.external_api(node)).toBe(true);
      if (node instanceof ExternalAPINode) {
        expect(node.methods).toEqual(["GET", "POST"]);
        expect(node.baseUrl).toBe("https://api.stripe.com");
      }
    },
  },
  {
    tag: "cron_job",
    input: {
      id: "cron-job-1",
      type: "cron_job",
      name: "nightly-sync",
      schedule: "0 2 * * *",
      handlerName: "runNightlySync",
      filePath: "src/jobs/nightly.ts",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(CronJobNode);
      expect(GraphNode.guards.cron_job(node)).toBe(true);
      if (node instanceof CronJobNode) {
        expect(node.schedule).toBe("0 2 * * *");
      }
    },
  },
  {
    tag: "event",
    input: {
      id: "event-1",
      type: "event",
      name: "order.created",
      eventKind: "emit",
      filePath: "src/events.ts",
      namespace: "orders",
      room: "backoffice",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(EventNode);
      expect(GraphNode.guards.event(node)).toBe(true);
      if (node instanceof EventNode) {
        expect(node.eventKind).toBe("emit");
        expect(node.namespace).toBe("orders");
        expect(node.room).toBe("backoffice");
      }
    },
  },
  {
    tag: "env_var",
    input: {
      id: "env-var-1",
      type: "env_var",
      name: "DATABASE_URL",
      required: true,
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(EnvVarNode);
      expect(GraphNode.guards.env_var(node)).toBe(true);
      if (node instanceof EnvVarNode) {
        expect(node.required).toBe(true);
        expect(node.defaultValue).toBeUndefined();
      }
    },
  },
  {
    tag: "queue_job",
    input: {
      id: "queue-job-1",
      type: "queue_job",
      name: "rebuild-search-index",
      queueName: "search",
      filePath: "src/queue.ts",
      jobKind: "consumer",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(QueueJobNode);
      expect(GraphNode.guards.queue_job(node)).toBe(true);
      if (node instanceof QueueJobNode) {
        expect(node.jobKind).toBe("consumer");
      }
    },
  },
  {
    tag: "metric",
    input: {
      id: "metric-1",
      type: "metric",
      name: "http_requests_total",
      metricType: "counter",
      help: "Total number of HTTP requests",
      filePath: "src/metrics.ts",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(MetricNode);
      expect(GraphNode.guards.metric(node)).toBe(true);
      if (node instanceof MetricNode) {
        expect(node.metricType).toBe("counter");
        expect(node.help).toBe("Total number of HTTP requests");
      }
    },
  },
  {
    tag: "span",
    input: {
      id: "span-1",
      type: "span",
      name: "http.request",
      spanKind: "server",
      attributes: ["http.method", "http.route"],
      filePath: "src/tracing.ts",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(SpanNode);
      expect(GraphNode.guards.span(node)).toBe(true);
      if (node instanceof SpanNode) {
        expect(node.spanKind).toBe("server");
        expect(node.attributes).toEqual(["http.method", "http.route"]);
      }
    },
  },
  {
    tag: "topic",
    input: {
      id: "topic-1",
      type: "topic",
      name: "orders.created",
      broker: "kafka",
      topicKind: "producer",
      filePath: "src/topics.ts",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(TopicNode);
      expect(GraphNode.guards.topic(node)).toBe(true);
      if (node instanceof TopicNode) {
        expect(node.broker).toBe("kafka");
        expect(node.topicKind).toBe("producer");
      }
    },
  },
  {
    tag: "security_issue",
    input: {
      id: "security-1",
      type: "security_issue",
      name: "Hardcoded API key",
      severity: "high",
      category: "hardcoded_secret",
      filePath: "src/secrets.ts",
      line: 12,
      description: "Credential appears inline in source.",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(SecurityIssueNode);
      expect(GraphNode.guards.security_issue(node)).toBe(true);
      if (node instanceof SecurityIssueNode) {
        expect(node.severity).toBe("high");
        expect(node.category).toBe("hardcoded_secret");
      }
    },
  },
  {
    tag: "project",
    input: {
      id: "project-1",
      type: "project",
      name: "@beep/codegraph",
      rootPath: "/repo/tooling/codegraph",
      createdAt: "2026-03-06T10:00:00Z",
    },
    assert: (node) => {
      expect(node).toBeInstanceOf(ProjectNode);
      expect(GraphNode.guards.project(node)).toBe(true);
      if (node instanceof ProjectNode) {
        expect(node.rootPath).toBe("/repo/tooling/codegraph");
        expect(node.lastScanAt).toBeUndefined();
      }
    },
  },
];

describe("Nodes.model", () => {
  it("decodes exported node literal domains", () => {
    expect(decodeNodeType("project")).toBe("project");
  });

  it("decodes ParameterInfo with optional fields omitted", () => {
    const parameter = decodeParameterInfo({
      name: "signal",
      optional: false,
    });

    expect(parameter).toBeInstanceOf(ParameterInfo);
    expect(parameter.type).toBeUndefined();
    expect(parameter.defaultValue).toBeUndefined();
    expect(parameter.optional).toBe(false);
  });

  for (const { tag, input, assert } of nodeCases) {
    it(`decodes ${tag} through GraphNode`, () => {
      const node = decodeGraphNode(input);

      expect(node.type).toBe(tag);
      assert(node);
    });
  }
});
