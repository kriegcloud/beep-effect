import * as A from "effect/Array";
import type { LogsData } from "effect/observability/OtlpLogger";
import type { MetricsData } from "effect/observability/OtlpMetrics";
import type { TraceData } from "effect/observability/OtlpTracer";

/** A canary assembled at runtime so its literal never sits in source. */
export const batchCanary = (): string => A.join(["canary", "Strict", "Gate", "7351"], "");

const traceId = "0af7651916cd43dd8448eb211c80319c";
const toolSpanId = "b7ad6b7169203331";
const rootSpanId = "00f067aa0ba902b7";

type InputSpan = TraceData["resourceSpans"][number]["scopeSpans"][number]["spans"][number];

const span = (overrides: Partial<InputSpan> & Pick<InputSpan, "name" | "spanId">): InputSpan => ({
  traceId,
  parentSpanId: rootSpanId,
  kind: 1,
  startTimeUnixNano: "1700000123456789000",
  endTimeUnixNano: "1700000123499789000",
  attributes: [],
  droppedAttributesCount: 0,
  events: [],
  droppedEventsCount: 0,
  status: { code: 1 },
  links: [],
  droppedLinksCount: 0,
  ...overrides,
});

/**
 * One dispatch span, one handler span that failed, and one SQL span, each
 * carrying the kinds of data the gate must drop.
 */
export const representativeTraces = (): TraceData => ({
  resourceSpans: [
    {
      resource: {
        attributes: [
          { key: "service.name", value: { stringValue: "demo-mcp" } },
          { key: "host.name", value: { stringValue: batchCanary() } },
        ],
        droppedAttributesCount: 0,
      },
      scopeSpans: [
        {
          scope: { name: "effect" },
          spans: [
            span({
              name: "mcp.tool.call.lookup",
              spanId: toolSpanId,
              attributes: [
                { key: "beep.privacy_tier", value: { stringValue: "shape-only" } },
                { key: "parameters", value: { stringValue: batchCanary() } },
                { key: "beep.demo.bounded", value: { stringValue: batchCanary() } },
                { key: "beep.demo.tool", value: { stringValue: batchCanary() } },
              ],
              links: [
                {
                  traceId,
                  spanId: rootSpanId,
                  attributes: [{ key: "link.reason", value: { stringValue: batchCanary() } }],
                  droppedAttributesCount: 0,
                },
              ],
            }),
            span({
              name: "DemoTools.search",
              spanId: "c7ad6b7169203332",
              parentSpanId: toolSpanId,
              endTimeUnixNano: "1700000126456789000",
              status: { code: 2, message: batchCanary() },
              events: [
                {
                  name: "exception",
                  timeUnixNano: "1700000126456789000",
                  attributes: [{ key: "exception.message", value: { stringValue: batchCanary() } }],
                  droppedAttributesCount: 0,
                },
              ],
            }),
            span({
              name: "db.query",
              spanId: "d7ad6b7169203333",
              attributes: [{ key: "db.query.text", value: { stringValue: batchCanary() } }],
            }),
          ],
        },
      ],
    },
  ],
});

/** An allowlisted counter, the same counter with a refused label, and an interpolated metric name the catalog does not know. */
export const representativeMetrics = (): MetricsData => ({
  resourceMetrics: [
    {
      resource: {
        attributes: [{ key: "host.name", value: { stringValue: batchCanary() } }],
        droppedAttributesCount: 0,
      },
      scopeMetrics: [
        {
          scope: { name: "demo-mcp" },
          metrics: [
            {
              name: "beep.demo.calls",
              description: "Demo tool calls by tool.",
              unit: "{call}",
              sum: {
                aggregationTemporality: 2,
                isMonotonic: true,
                dataPoints: [
                  {
                    attributes: [{ key: "beep.demo.tool", value: { stringValue: "lookup" } }],
                    startTimeUnixNano: "1700000000000000000",
                    timeUnixNano: "1700000123456789000",
                    asInt: 3,
                  },
                  {
                    attributes: [{ key: "beep.demo.tool", value: { stringValue: batchCanary() } }],
                    startTimeUnixNano: "1700000000000000000",
                    timeUnixNano: "1700000123456789000",
                    asInt: 1,
                  },
                ],
              },
            },
            {
              name: `http.client.${batchCanary()}`,
              unit: "ms",
              gauge: {
                dataPoints: [
                  {
                    attributes: [],
                    timeUnixNano: "1700000123456789000",
                    asDouble: 12.5,
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
});

/** Two log records whose bodies and attributes carry the canary. */
export const representativeLogs = (): LogsData => ({
  resourceLogs: [
    {
      resource: { attributes: [], droppedAttributesCount: 0 },
      scopeLogs: [
        {
          scope: { name: "effect" },
          logRecords: [
            {
              timeUnixNano: "1700000123456789000",
              observedTimeUnixNano: "1700000123456789000",
              severityText: "Error",
              body: { stringValue: batchCanary() },
              attributes: [{ key: "exception.message", value: { stringValue: batchCanary() } }],
              droppedAttributesCount: 0,
            },
            {
              timeUnixNano: "1700000123456789000",
              observedTimeUnixNano: "1700000123456789000",
              body: { stringValue: "plain" },
              attributes: [],
              droppedAttributesCount: 0,
            },
          ],
        },
      ],
    },
  ],
});
