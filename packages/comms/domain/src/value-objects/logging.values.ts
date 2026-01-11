import { $CommsDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $CommsDomainId.create("value-objects/logging.values");

export class TraceSpanStatus extends BS.StringLiteralKit("started", "completed", "error").annotations(
  $I.annotations("TraceSpanStatus", {
    description: "The status of a trace span.",
  })
) {}

export declare namespace TraceSpanStatus {
  export type Type = typeof TraceSpanStatus.Type;
}

export const traceSpanBuilder = TraceSpanStatus.toTagged("status").composer({
  id: S.String,
  name: S.String,
  startTime: BS.DateTimeUtcFromAllAcceptable,
  endTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
  duration: S.optionalWith(S.DurationFromMillis, { as: "Option" }),
  metadata: S.optionalWith(S.Record({ key: S.String, value: S.Any }), { as: "Option" }),
  error: S.optionalWith(S.String, { as: "Option" }),
  tags: S.optionalWith(
    S.Record({
      key: S.String,
      value: S.String,
    }),
    { as: "Option" }
  ),
});

export class TraceSpanStarted extends S.Class<TraceSpanStarted>($I`TraceSpanStarted`)(
  traceSpanBuilder.started({}),
  $I.annotations("TraceSpanStarted", {
    description: "A trace span that has started.",
  })
) {}

export class TraceSpanCompleted extends S.Class<TraceSpanCompleted>($I`TraceSpanCompleted`)(
  traceSpanBuilder.completed({}),
  $I.annotations("TraceSpanCompleted", {
    description: "A trace span that has completed.",
  })
) {}

export class TraceSpanError extends S.Class<TraceSpanError>($I`TraceSpanError`)(
  traceSpanBuilder.error({}),
  $I.annotations("TraceSpanError", {
    description: "A trace span that has errored.",
  })
) {}

export class TraceSpan extends S.Union(TraceSpanStarted, TraceSpanCompleted, TraceSpanError).annotations(
  $I.annotations("TraceSpan", {
    description: "A trace span.",
  })
) {}

export declare namespace TraceSpan {
  export type Type = typeof TraceSpan.Type;
  export type Encoded = typeof TraceSpan.Encoded;
}

export class CallLogMetadata extends S.Class<CallLogMetadata>($I`CallLogMetadata`)(
  {
    userAgent: S.optionalWith(S.String, { as: "Option" }),
    ip: S.optionalWith(BS.IPv4, { as: "Option" }),
    referer: S.optionalWith(S.String, { as: "Option" }),
    origin: S.optionalWith(S.String, { as: "Option" }),
    acceptLanguage: S.optionalWith(S.String, { as: "Option" }),
    acceptEncoding: S.optionalWith(S.String, { as: "Option" }),
    requestId: S.optionalWith(S.String, { as: "Option" }),
    timestamp: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    startTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    endTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    traceId: S.optionalWith(S.String, { as: "Option" }),
    requestDuration: S.optionalWith(S.DurationFromMillis, { as: "Option" }),
  },
  $I.annotations("CallLogMetadata", {
    description: "Metadata for a call log.",
  })
) {}

export class CallLogTrace extends S.Class<CallLogTrace>($I`CallLogTrace`)(
  {
    traceId: S.String,
    requestStartTime: BS.DateTimeUtcFromAllAcceptable,
    requestEndTime: S.optionalWith(BS.DateTimeUtcFromAllAcceptable, { as: "Option" }),
    requestDuration: S.optionalWith(S.DurationFromMillis, { as: "Option" }),
    spans: S.Array(TraceSpan),
    totalSpans: S.NonNegativeInt,
    completedSpans: S.NonNegativeInt,
    errorSpans: S.NonNegativeInt,
  },
  $I.annotations("CallLogTrace", {
    description: "A trace for a call log.",
  })
) {}

export class CallLog extends S.Class<CallLog>($I`CallLog`)(
  {
    id: S.String,
    timestamp: BS.DateTimeUtcFromAllAcceptable,
    userId: S.String,
    sessionId: S.String,
    endpoint: S.String,
    input: S.Any,
    output: S.optionalWith(S.Any, { as: "Option" }),
    error: S.optionalWith(S.String, { as: "Option" }),
    duration: S.DurationFromMillis,
    metadata: CallLogMetadata,
    trace: S.optionalWith(CallLogTrace, { as: "Option" }),
  },
  $I.annotations("CallLog", {
    description: "A call log.",
  })
) {}

export class LoggingState extends S.Class<LoggingState>($I`LoggingState`)(
  {
    userId: S.String,
    sessionId: S.String,
    startedAt: BS.DateTimeUtcFromAllAcceptable,
    lastActivity: BS.DateTimeUtcFromAllAcceptable,
    totalCalls: S.NonNegativeInt,
    totalErrors: S.NonNegativeInt,
    totalDuration: S.DurationFromMillis,
  },
  $I.annotations("LoggingState", {
    description: "The logging state.",
  })
) {}
export class SessionStats extends S.Class<SessionStats>($I`SessionStats`)(
  {
    totalCalls: S.NonNegativeInt,
    totalErrors: S.NonNegativeInt,
    totalDuration: S.DurationFromMillis,
    averageDuration: S.DurationFromMillis,
    errorRate: S.Number,
    sessionDuration: S.DurationFromMillis,
  },
  $I.annotations("SessionStats", {
    description: "The session stats.",
  })
) {}
