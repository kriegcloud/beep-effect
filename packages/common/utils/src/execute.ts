// import {
//   accumulateEffectsAndReport,
//   makePrettyConsoleLoggerLayer,
//   withEnvLogging,
//   withPrettyLogging,
//   withSpanAndMetrics,
// } from "@beep/utils/errors";
// import * as Effect from "effect/Effect";
// import * as Logger from "effect/Logger";
// import * as LogLevel from "effect/LogLevel";
// import * as Metric from "effect/Metric";
// import * as MetricBoundaries from "effect/MetricBoundaries";
//
// /**
//  * Example 1: Basic pretty logging with minimum log level and a root span + annotations.
//  */
// export const demoBasicLogging = withPrettyLogging({ level: LogLevel.Debug })(
//   Effect.gen(function* () {
//     yield* Effect.log("demo started");
//     yield* Effect.logDebug("debug detail", { step: 1 });
//     yield* Effect.logInfo("informational message");
//     yield* Effect.logWarning("this is a warning");
//     yield* Effect.logError("this is an error-level log (not failing)");
//     return "done";
//   }).pipe(Effect.withLogSpan("demo.basic"), Effect.annotateLogs({ service: "utils-demo", feature: "basic" }))
// );
//
// /**
//  * Example 2: Nested spans and structured annotations across steps.
//  */
// export const demoNestedSpans = withPrettyLogging({ level: LogLevel.Info })(
//   Effect.gen(function* () {
//     yield* Effect.log("begin nested work");
//     const a = yield* Effect.gen(function* () {
//       yield* Effect.log("step A working...");
//       return 1;
//     }).pipe(Effect.withLogSpan("demo.nested.stepA"));
//
//     const b = yield* Effect.gen(function* () {
//       yield* Effect.log("step B working...");
//       return 2;
//     }).pipe(Effect.withLogSpan("demo.nested.stepB"));
//
//     yield* Effect.log("finished nested work", { sum: a + b });
//     return a + b;
//   }).pipe(Effect.withLogSpan("demo.nested.root"), Effect.annotateLogs({ service: "utils-demo", flow: "nested" }))
// );
//
// /**
//  * Example 3: Metrics instrumentation (success/error counters + latency histogram) with a span.
//  */
// const demoSuccessCounter = Metric.counter("demo_success_total", {
//   description: "Total successful demo operations",
//   incremental: true,
// });
// const demoErrorCounter = Metric.counter("demo_error_total", {
//   description: "Total failed demo operations",
//   incremental: true,
// });
// const demoLatencyHistogram = Metric.histogram(
//   "demo_latency_ms",
//   MetricBoundaries.linear({ start: 0, width: 10, count: 20 }),
//   "Latency of demo operation in milliseconds"
// );
//
// export const demoWithMetrics = Effect.gen(function* () {
//   yield* Effect.sleep("25 millis");
//   yield* Effect.log("work done inside metrics demo");
//   return "ok";
// }).pipe(
//   withSpanAndMetrics(
//     "demo.metrics",
//     {
//       successCounter: demoSuccessCounter,
//       errorCounter: demoErrorCounter,
//       durationHistogram: demoLatencyHistogram,
//       durationUnit: "millis",
//     },
//     { service: "utils-demo", op: "metrics" }
//   ),
//   withPrettyLogging({ level: LogLevel.Info })
// );
//
// /**
//  * Example 4: Failure handling to showcase pretty cause printing.
//  * This one fails with a typed error and lets the logger render the Cause.
//  */
// export const demoFailureCause = withPrettyLogging({ level: LogLevel.Debug })(
//   Effect.gen(function* () {
//     yield* Effect.log("About to raise a failure");
//     return yield* Effect.fail(new Error("Boom: something went wrong"));
//   }).pipe(Effect.withLogSpan("demo.failure"), Effect.annotateLogs({ service: "utils-demo", mode: "failure" }))
// );
//
// /**
//  * Example 5: Local minimum log level override for a specific section.
//  */
// export const demoLocalMinimumLevel = withPrettyLogging({ level: LogLevel.Info })(
//   Effect.gen(function* () {
//     yield* Effect.log("Visible at INFO (outer)");
//
//     // Temporarily enable DEBUG for inner section
//     yield* Effect.gen(function* () {
//       yield* Effect.logDebug("Visible because inner minimum is DEBUG");
//       yield* Effect.logInfo("Inner info still visible");
//     }).pipe(Logger.withMinimumLogLevel(LogLevel.Debug), Effect.withLogSpan("demo.local.debug-section"));
//
//     yield* Effect.logDebug("Not visible because outer minimum is INFO");
//   }).pipe(Effect.withLogSpan("demo.local"))
// );
//
// /**
//  * Example 6: Provide the pretty logger layer directly (without withPrettyLogging).
//  */
// export const demoProvideLoggerLayer = Effect.gen(function* () {
//   yield* Effect.logInfo("using provided pretty logger layer");
//   return "ok";
// }).pipe(
//   Logger.withMinimumLogLevel(LogLevel.Info),
//   Effect.annotateLogs({ service: "utils-demo", style: "layer" }),
//   Effect.provide(makePrettyConsoleLoggerLayer({ colors: true })),
//   Effect.withLogSpan("demo.provide.layer")
// );
//
// /**
//  * Example 7: Parallel tasks each with their own spans.
//  */
// export const demoParallelSpans = withPrettyLogging({ level: LogLevel.Debug })(
//   Effect.all([
//     Effect.gen(function* () {
//       yield* Effect.sleep("30 millis");
//       yield* Effect.log("task A complete");
//       return "A";
//     }).pipe(Effect.withLogSpan("demo.parallel.A")),
//     Effect.gen(function* () {
//       yield* Effect.sleep("50 millis");
//       yield* Effect.log("task B complete");
//       return "B";
//     }).pipe(Effect.withLogSpan("demo.parallel.B")),
//   ]).pipe(Effect.withLogSpan("demo.parallel.root"), Effect.annotateLogs({ service: "utils-demo", mode: "parallel" }))
// );
//
// /**
//  * Example 8: withEnvLogging wrapper selects logger + level from env.
//  */
// export const demoWithEnvLogging = withEnvLogging({ colors: true, includeCausePretty: true })(
//   Effect.gen(function* () {
//     yield* Effect.log("withEnvLogging: start");
//     yield* Effect.logDebug("withEnvLogging: debug detail (visible if level <= Debug)");
//     yield* Effect.logInfo("withEnvLogging: info message");
//     yield* Effect.logWarning("withEnvLogging: warning message");
//     yield* Effect.logError("withEnvLogging: error-level message (not failing)");
//     return "with-env-logging-done";
//   }).pipe(
//     Effect.withLogSpan("demo.withEnvLogging.root"),
//     Effect.annotateLogs({ service: "utils-demo", demo: "with-env-logging" })
//   )
// );
//
// /**
//  * Example 9: Accumulate errors from many effects without failing fast.
//  * We sandbox each effect to capture full Causes, then partition to gather
//  * all successes and all error Causes. We pretty-print every error cause.
//  */
// const demoAccumulateErrors = withEnvLogging({ colors: true, includeCausePretty: true })(
//   Effect.gen(function* () {
//     const effects = [demoFailureCause];
//
//     return yield* accumulateEffectsAndReport(effects, {
//       concurrency: "unbounded",
//       spanLabel: "demo.accumulate",
//       annotations: { service: "utils-demo", demo: "accumulate" },
//       colors: true,
//     });
//   })
// );
// // If you aren't using effect....
// // What the fuck are you doing with your life.
//
// Effect.runPromise(demoAccumulateErrors);
