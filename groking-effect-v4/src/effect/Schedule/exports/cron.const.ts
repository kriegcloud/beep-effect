/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Schedule
 * Export: cron
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Schedule.ts
 * Generated: 2026-02-19T04:14:17.050Z
 *
 * Overview:
 * Returns a new `Schedule` that recurs on the specified `Cron` schedule and outputs the duration between recurrences.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Schedule } from "effect"
 * 
 * // Run every minute
 * const everyMinute = Schedule.cron("* * * * *")
 * 
 * const minutelyProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log(`Minutely task at ${new Date().toISOString()}`)
 *       return "minute"
 *     }),
 *     everyMinute.pipe(
 *       Schedule.take(3), // Run only 3 times for demo
 *       Schedule.tapOutput((duration) =>
 *         Console.log(`Next execution in: ${duration}`)
 *       )
 *     )
 *   )
 * })
 * 
 * // Run every day at 2:30 AM
 * const dailyBackup = Schedule.cron("30 2 * * *")
 * 
 * const backupProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Running daily backup...")
 *       // Simulate backup process
 *       yield* Effect.sleep("2 seconds")
 *       yield* Console.log("Backup completed")
 *       return "backup-done"
 *     }),
 *     dailyBackup.pipe(
 *       Schedule.take(2) // Run 2 times for demo
 *     )
 *   )
 * })
 * 
 * // Run every Monday at 9:00 AM with timezone
 * const weeklyReport = Schedule.cron("0 9 * * 1", "America/New_York")
 * 
 * const reportProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Generating weekly report...")
 *       const report = {
 *         week: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),
 *         timestamp: new Date().toISOString()
 *       }
 *       yield* Console.log(`Report generated: ${JSON.stringify(report)}`)
 *       return report
 *     }),
 *     weeklyReport.pipe(Schedule.take(1))
 *   )
 * })
 * 
 * // Run every 15 minutes during business hours (9 AM - 5 PM)
 * const businessHoursCheck = Schedule.cron("0,15,30,45 9-17 * * 1-5")
 * 
 * const businessProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Business hours health check...")
 *       const status = Math.random() > 0.1 ? "healthy" : "degraded"
 *       yield* Console.log(`System status: ${status}`)
 *       return status
 *     }),
 *     businessHoursCheck.pipe(
 *       Schedule.take(4) // Demo with 4 checks
 *     )
 *   )
 * })
 * 
 * // Run on specific days of the month
 * const monthlyInvoice = Schedule.cron("0 10 1,15 * *") // 1st and 15th at 10 AM
 * 
 * const invoiceProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Processing monthly invoices...")
 *       const invoiceCount = Math.floor(Math.random() * 100) + 50
 *       yield* Console.log(`Processed ${invoiceCount} invoices`)
 *       return { count: invoiceCount, date: new Date().toISOString() }
 *     }),
 *     monthlyInvoice.pipe(Schedule.take(1))
 *   )
 * })
 * 
 * // Complex cron with error handling
 * const complexCron = Schedule.cron("0 2,4,6 * * *").pipe(
 *   Schedule.tapOutput((duration) =>
 *     Console.log(`Scheduled to run again in ${duration}`)
 *   )
 * )
 * 
 * const robustProgram = Effect.gen(function*() {
 *   yield* Effect.repeat(
 *     Effect.gen(function*() {
 *       yield* Console.log("Complex scheduled task...")
 *       // Simulate occasional failures
 *       if (Math.random() < 0.3) {
 *         yield* Effect.fail(new Error("Scheduled task failed"))
 *       }
 *       return "success"
 *     }),
 *     complexCron.pipe(Schedule.take(3))
 *   ).pipe(
 *     Effect.catch((error: unknown) =>
 *       Console.log(`Cron task error: ${String(error)}`)
 *     )
 *   )
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as ScheduleModule from "effect/Schedule";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "cron";
const exportKind = "const";
const moduleImportPath = "effect/Schedule";
const sourceSummary = "Returns a new `Schedule` that recurs on the specified `Cron` schedule and outputs the duration between recurrences.";
const sourceExample = "import { Console, Effect, Schedule } from \"effect\"\n\n// Run every minute\nconst everyMinute = Schedule.cron(\"* * * * *\")\n\nconst minutelyProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(`Minutely task at ${new Date().toISOString()}`)\n      return \"minute\"\n    }),\n    everyMinute.pipe(\n      Schedule.take(3), // Run only 3 times for demo\n      Schedule.tapOutput((duration) =>\n        Console.log(`Next execution in: ${duration}`)\n      )\n    )\n  )\n})\n\n// Run every day at 2:30 AM\nconst dailyBackup = Schedule.cron(\"30 2 * * *\")\n\nconst backupProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Running daily backup...\")\n      // Simulate backup process\n      yield* Effect.sleep(\"2 seconds\")\n      yield* Console.log(\"Backup completed\")\n      return \"backup-done\"\n    }),\n    dailyBackup.pipe(\n      Schedule.take(2) // Run 2 times for demo\n    )\n  )\n})\n\n// Run every Monday at 9:00 AM with timezone\nconst weeklyReport = Schedule.cron(\"0 9 * * 1\", \"America/New_York\")\n\nconst reportProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Generating weekly report...\")\n      const report = {\n        week: Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000)),\n        timestamp: new Date().toISOString()\n      }\n      yield* Console.log(`Report generated: ${JSON.stringify(report)}`)\n      return report\n    }),\n    weeklyReport.pipe(Schedule.take(1))\n  )\n})\n\n// Run every 15 minutes during business hours (9 AM - 5 PM)\nconst businessHoursCheck = Schedule.cron(\"0,15,30,45 9-17 * * 1-5\")\n\nconst businessProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Business hours health check...\")\n      const status = Math.random() > 0.1 ? \"healthy\" : \"degraded\"\n      yield* Console.log(`System status: ${status}`)\n      return status\n    }),\n    businessHoursCheck.pipe(\n      Schedule.take(4) // Demo with 4 checks\n    )\n  )\n})\n\n// Run on specific days of the month\nconst monthlyInvoice = Schedule.cron(\"0 10 1,15 * *\") // 1st and 15th at 10 AM\n\nconst invoiceProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Processing monthly invoices...\")\n      const invoiceCount = Math.floor(Math.random() * 100) + 50\n      yield* Console.log(`Processed ${invoiceCount} invoices`)\n      return { count: invoiceCount, date: new Date().toISOString() }\n    }),\n    monthlyInvoice.pipe(Schedule.take(1))\n  )\n})\n\n// Complex cron with error handling\nconst complexCron = Schedule.cron(\"0 2,4,6 * * *\").pipe(\n  Schedule.tapOutput((duration) =>\n    Console.log(`Scheduled to run again in ${duration}`)\n  )\n)\n\nconst robustProgram = Effect.gen(function*() {\n  yield* Effect.repeat(\n    Effect.gen(function*() {\n      yield* Console.log(\"Complex scheduled task...\")\n      // Simulate occasional failures\n      if (Math.random() < 0.3) {\n        yield* Effect.fail(new Error(\"Scheduled task failed\"))\n      }\n      return \"success\"\n    }),\n    complexCron.pipe(Schedule.take(3))\n  ).pipe(\n    Effect.catch((error: unknown) =>\n      Console.log(`Cron task error: ${String(error)}`)\n    )\n  )\n})";
const moduleRecord = ScheduleModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
