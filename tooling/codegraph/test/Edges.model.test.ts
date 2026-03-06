import {
  BaseEdge,
  CallResolution,
  CallsEdge,
  CallsExternalEdge,
  ConsumesJobEdge,
  ConsumesMessageEdge,
  ContainsEdge,
  DependsOnEdge,
  EdgeType,
  EmitsEdge,
  ExportsEdge,
  ExtendsEdge,
  GraphEdge,
  HandlesEdge,
  HasSecurityIssueEdge,
  ImplementsEdge,
  ImportsEdge,
  ListensToEdge,
  ProducesJobEdge,
  ProducesMessageEdge,
  ReadsFromEdge,
  SchedulesEdge,
  StartsSpanEdge,
  TriggersEdge,
  UsesEnvEdge,
  UsesMetricEdge,
  WritesToEdge,
} from "@beep/codegraph/Graph/Edges.model";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeBaseEdge = S.decodeUnknownSync(BaseEdge);
const decodeCallResolution = S.decodeUnknownSync(CallResolution);
const decodeEdgeType = S.decodeUnknownSync(EdgeType);
const decodeGraphEdge = S.decodeUnknownSync(GraphEdge);

const baseInput = {
  id: "edge-1",
  sourceId: "source-1",
  targetId: "target-1",
  confidence: 0.9,
};

const edgeCases: ReadonlyArray<{
  readonly tag: EdgeType;
  readonly input: Readonly<Record<string, unknown>>;
  readonly assert: (edge: GraphEdge) => void;
}> = [
  {
    tag: "CONTAINS",
    input: { ...baseInput, type: "CONTAINS" },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ContainsEdge);
      expect(GraphEdge.guards.CONTAINS(edge)).toBe(true);
    },
  },
  {
    tag: "IMPORTS",
    input: {
      ...baseInput,
      type: "IMPORTS",
      specifiers: ["default", "namedExport"],
      isDefault: true,
      isDynamic: false,
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ImportsEdge);
      expect(GraphEdge.guards.IMPORTS(edge)).toBe(true);
      if (edge instanceof ImportsEdge) {
        expect(edge.specifiers).toEqual(["default", "namedExport"]);
        expect(edge.isDefault).toBe(true);
        expect(edge.isDynamic).toBe(false);
      }
    },
  },
  {
    tag: "EXPORTS",
    input: {
      ...baseInput,
      type: "EXPORTS",
      isDefault: false,
      alias: "renamedExport",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ExportsEdge);
      expect(GraphEdge.guards.EXPORTS(edge)).toBe(true);
      if (edge instanceof ExportsEdge) {
        expect(edge.isDefault).toBe(false);
        expect(edge.alias).toBe("renamedExport");
      }
    },
  },
  {
    tag: "EXTENDS",
    input: { ...baseInput, type: "EXTENDS" },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ExtendsEdge);
      expect(GraphEdge.guards.EXTENDS(edge)).toBe(true);
    },
  },
  {
    tag: "IMPLEMENTS",
    input: { ...baseInput, type: "IMPLEMENTS" },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ImplementsEdge);
      expect(GraphEdge.guards.IMPLEMENTS(edge)).toBe(true);
    },
  },
  {
    tag: "CALLS",
    input: {
      ...baseInput,
      type: "CALLS",
      line: 42,
      column: 8,
      resolution: "import-resolved",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(CallsEdge);
      expect(GraphEdge.guards.CALLS(edge)).toBe(true);
      if (edge instanceof CallsEdge) {
        expect(edge.line).toBe(42);
        expect(edge.column).toBe(8);
        expect(edge.resolution).toBe("import-resolved");
      }
    },
  },
  {
    tag: "DEPENDS_ON",
    input: {
      ...baseInput,
      type: "DEPENDS_ON",
      kind: "http",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(DependsOnEdge);
      expect(GraphEdge.guards.DEPENDS_ON(edge)).toBe(true);
      if (edge instanceof DependsOnEdge) {
        expect(edge.kind).toBe("http");
      }
    },
  },
  {
    tag: "HANDLES",
    input: {
      ...baseInput,
      type: "HANDLES",
      middleware: ["auth", "metrics"],
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(HandlesEdge);
      expect(GraphEdge.guards.HANDLES(edge)).toBe(true);
      if (edge instanceof HandlesEdge) {
        expect(edge.middleware).toEqual(["auth", "metrics"]);
      }
    },
  },
  {
    tag: "READS_FROM",
    input: {
      ...baseInput,
      type: "READS_FROM",
      query: "SELECT * FROM users",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ReadsFromEdge);
      expect(GraphEdge.guards.READS_FROM(edge)).toBe(true);
      if (edge instanceof ReadsFromEdge) {
        expect(edge.query).toBe("SELECT * FROM users");
      }
    },
  },
  {
    tag: "WRITES_TO",
    input: {
      ...baseInput,
      type: "WRITES_TO",
      operation: "UPSERT",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(WritesToEdge);
      expect(GraphEdge.guards.WRITES_TO(edge)).toBe(true);
      if (edge instanceof WritesToEdge) {
        expect(edge.operation).toBe("UPSERT");
      }
    },
  },
  {
    tag: "CALLS_EXTERNAL",
    input: {
      ...baseInput,
      type: "CALLS_EXTERNAL",
      method: "POST",
      endpoint: "https://api.example.com/v1/jobs",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(CallsExternalEdge);
      expect(GraphEdge.guards.CALLS_EXTERNAL(edge)).toBe(true);
      if (edge instanceof CallsExternalEdge) {
        expect(edge.method).toBe("POST");
        expect(edge.endpoint).toBe("https://api.example.com/v1/jobs");
      }
    },
  },
  {
    tag: "TRIGGERS",
    input: {
      ...baseInput,
      type: "TRIGGERS",
      schedule: "0 * * * *",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(TriggersEdge);
      expect(GraphEdge.guards.TRIGGERS(edge)).toBe(true);
      if (edge instanceof TriggersEdge) {
        expect(edge.schedule).toBe("0 * * * *");
      }
    },
  },
  {
    tag: "EMITS",
    input: {
      ...baseInput,
      type: "EMITS",
      payload: "OrderCreated",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(EmitsEdge);
      expect(GraphEdge.guards.EMITS(edge)).toBe(true);
      if (edge instanceof EmitsEdge) {
        expect(edge.payload).toBe("OrderCreated");
      }
    },
  },
  {
    tag: "LISTENS_TO",
    input: {
      ...baseInput,
      type: "LISTENS_TO",
      handler: "onOrderCreated",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ListensToEdge);
      expect(GraphEdge.guards.LISTENS_TO(edge)).toBe(true);
      if (edge instanceof ListensToEdge) {
        expect(edge.handler).toBe("onOrderCreated");
      }
    },
  },
  {
    tag: "USES_ENV",
    input: { ...baseInput, type: "USES_ENV" },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(UsesEnvEdge);
      expect(GraphEdge.guards.USES_ENV(edge)).toBe(true);
    },
  },
  {
    tag: "PRODUCES_JOB",
    input: {
      ...baseInput,
      type: "PRODUCES_JOB",
      jobName: "sync-users",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ProducesJobEdge);
      expect(GraphEdge.guards.PRODUCES_JOB(edge)).toBe(true);
      if (edge instanceof ProducesJobEdge) {
        expect(edge.jobName).toBe("sync-users");
      }
    },
  },
  {
    tag: "CONSUMES_JOB",
    input: {
      ...baseInput,
      type: "CONSUMES_JOB",
      jobName: "index-repo",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ConsumesJobEdge);
      expect(GraphEdge.guards.CONSUMES_JOB(edge)).toBe(true);
      if (edge instanceof ConsumesJobEdge) {
        expect(edge.jobName).toBe("index-repo");
      }
    },
  },
  {
    tag: "USES_METRIC",
    input: {
      ...baseInput,
      type: "USES_METRIC",
      operation: "startTimer",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(UsesMetricEdge);
      expect(GraphEdge.guards.USES_METRIC(edge)).toBe(true);
      if (edge instanceof UsesMetricEdge) {
        expect(edge.operation).toBe("startTimer");
      }
    },
  },
  {
    tag: "STARTS_SPAN",
    input: {
      ...baseInput,
      type: "STARTS_SPAN",
      spanName: "http.request",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(StartsSpanEdge);
      expect(GraphEdge.guards.STARTS_SPAN(edge)).toBe(true);
      if (edge instanceof StartsSpanEdge) {
        expect(edge.spanName).toBe("http.request");
      }
    },
  },
  {
    tag: "PRODUCES_MESSAGE",
    input: {
      ...baseInput,
      type: "PRODUCES_MESSAGE",
      topicName: "orders.created",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ProducesMessageEdge);
      expect(GraphEdge.guards.PRODUCES_MESSAGE(edge)).toBe(true);
      if (edge instanceof ProducesMessageEdge) {
        expect(edge.topicName).toBe("orders.created");
      }
    },
  },
  {
    tag: "CONSUMES_MESSAGE",
    input: {
      ...baseInput,
      type: "CONSUMES_MESSAGE",
      topicName: "orders.created",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(ConsumesMessageEdge);
      expect(GraphEdge.guards.CONSUMES_MESSAGE(edge)).toBe(true);
      if (edge instanceof ConsumesMessageEdge) {
        expect(edge.topicName).toBe("orders.created");
      }
    },
  },
  {
    tag: "HAS_SECURITY_ISSUE",
    input: { ...baseInput, type: "HAS_SECURITY_ISSUE" },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(HasSecurityIssueEdge);
      expect(GraphEdge.guards.HAS_SECURITY_ISSUE(edge)).toBe(true);
    },
  },
  {
    tag: "SCHEDULES",
    input: {
      ...baseInput,
      type: "SCHEDULES",
      schedule: "*/5 * * * *",
    },
    assert: (edge) => {
      expect(edge).toBeInstanceOf(SchedulesEdge);
      expect(GraphEdge.guards.SCHEDULES(edge)).toBe(true);
      if (edge instanceof SchedulesEdge) {
        expect(edge.schedule).toBe("*/5 * * * *");
      }
    },
  },
];

describe("Edges.model", () => {
  it("decodes exported edge literal domains", () => {
    expect(decodeEdgeType("IMPORTS")).toBe("IMPORTS");
    expect(decodeCallResolution("same-file")).toBe("same-file");
  });

  it("decodes BaseEdge without variant-specific fields", () => {
    const edge = decodeBaseEdge({
      ...baseInput,
      type: "CALLS",
    });

    expect(edge).toBeInstanceOf(BaseEdge);
    expect(edge.type).toBe("CALLS");
    expect(edge.sourceId).toBe("source-1");
    expect(edge.targetId).toBe("target-1");
    expect(edge.confidence).toBe(0.9);
  });

  for (const { tag, input, assert } of edgeCases) {
    it(`decodes ${tag} through GraphEdge`, () => {
      const edge = decodeGraphEdge(input);

      expect(edge.type).toBe(tag);
      assert(edge);
    });
  }
});
