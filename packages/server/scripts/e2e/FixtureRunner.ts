import { Database } from "bun:sqlite"
import { Cause, Duration, Effect, Exit, Schema } from "effect"
import { existsSync } from "node:fs"
import { isDeepStrictEqual } from "node:util"
import {
  type FixtureFile,
  FixtureFileSchema,
  type FixtureRunOptions,
  type FixtureRunResult,
  type FixtureRunStepResult,
  type FixtureStep,
  type RequestStep,
  type RetryPolicy,
  type SqlStep
} from "./FixtureTypes.js"

const TEMPLATE_PATTERN = /{{\s*([a-zA-Z0-9_.-]+)\s*}}/g

class StepError extends Error {
  readonly stepName: string

  constructor(stepName: string, message: string) {
    super(`${stepName}: ${message}`)
    this.name = "StepError"
    this.stepName = stepName
  }
}

interface ParsedSseEvent {
  readonly event: string
  readonly id: string | null
  readonly data: string
}

interface MutableRunContext {
  readonly baseUrl: string
  readonly dbPath: string | null
  readonly vars: Record<string, unknown>
  readonly sqliteHandles: Map<string, Database>
}

const decodeFixture = Schema.decodeUnknownSync(FixtureFileSchema as any)

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const builtinVariable = (name: string): unknown => {
  switch (name) {
    case "uuid":
      return crypto.randomUUID()
    case "now_iso":
      return new Date().toISOString()
    case "now_unix_ms":
      return Date.now()
    case "cwd":
      return process.cwd()
    case "repo_root":
      return process.cwd()
    default:
      return undefined
  }
}

const getByPath = (value: unknown, rawPath: string): unknown => {
  const normalized = rawPath
    .trim()
    .replace(/^\$\.?/, "")
    .replace(/\[(\d+)\]/g, ".$1")

  if (normalized.length === 0) {
    return value
  }

  const segments = normalized.split(".").filter((segment) => segment.length > 0)
  let cursor: unknown = value

  for (const segment of segments) {
    if (Array.isArray(cursor)) {
      const index = Number(segment)
      if (!Number.isInteger(index) || index < 0 || index >= cursor.length) {
        return undefined
      }
      cursor = cursor[index]
      continue
    }

    if (!isObject(cursor)) {
      return undefined
    }

    cursor = cursor[segment]
  }

  return cursor
}

const resolveTemplateToken = (token: string, vars: Readonly<Record<string, unknown>>): unknown => {
  const exact = vars[token]
  if (exact !== undefined) {
    return exact
  }

  const nested = getByPath(vars, token)
  if (nested !== undefined) {
    return nested
  }

  return builtinVariable(token)
}

const renderTemplateString = (
  template: string,
  vars: Readonly<Record<string, unknown>>,
  stepName: string
): unknown => {
  const exact = template.match(/^{{\s*([a-zA-Z0-9_.-]+)\s*}}$/)
  if (exact) {
    const resolved = resolveTemplateToken(exact[1]!, vars)
    if (resolved === undefined) {
      throw new StepError(stepName, `unknown template variable '${exact[1]}'`)
    }
    return resolved
  }

  return template.replace(TEMPLATE_PATTERN, (_match, rawName: string) => {
    const resolved = resolveTemplateToken(rawName, vars)
    if (resolved === undefined) {
      throw new StepError(stepName, `unknown template variable '${rawName}'`)
    }
    if (typeof resolved === "string") {
      return resolved
    }
    return JSON.stringify(resolved)
  })
}

const renderTemplateValue = (
  value: unknown,
  vars: Readonly<Record<string, unknown>>,
  stepName: string
): unknown => {
  if (typeof value === "string") {
    return renderTemplateString(value, vars, stepName)
  }

  if (Array.isArray(value)) {
    return value.map((item) => renderTemplateValue(item, vars, stepName))
  }

  if (isObject(value)) {
    const renderedEntries = Object.entries(value).map(([key, item]) => [
      key,
      renderTemplateValue(item, vars, stepName)
    ])
    return Object.fromEntries(renderedEntries)
  }

  return value
}

const parseSseEvents = (bodyText: string): ReadonlyArray<ParsedSseEvent> => {
  const frames = bodyText
    .split(/\n\n+/)
    .map((frame) => frame.trim())
    .filter((frame) => frame.length > 0)

  const events: Array<ParsedSseEvent> = []

  for (const frame of frames) {
    const lines = frame.split("\n")
    let eventName = "message"
    let id: string | null = null
    const dataLines: Array<string> = []

    for (const line of lines) {
      if (line.startsWith(":")) {
        continue
      }
      if (line.startsWith("event:")) {
        eventName = line.slice("event:".length).trim()
        continue
      }
      if (line.startsWith("id:")) {
        id = line.slice("id:".length).trim()
        continue
      }
      if (line.startsWith("data:")) {
        dataLines.push(line.slice("data:".length).trimStart())
      }
    }

    events.push({
      event: eventName,
      id,
      data: dataLines.join("\n")
    })
  }

  return events
}

const parseJson = (text: string, stepName: string): unknown => {
  try {
    return JSON.parse(text)
  } catch {
    throw new StepError(stepName, "expected JSON response body")
  }
}

const assertRequestExpectations = (
  step: RequestStep,
  status: number,
  bodyText: string,
  vars: Readonly<Record<string, unknown>>,
  stepName: string
): { readonly jsonBody: unknown | null; readonly sseEvents: ReadonlyArray<ParsedSseEvent> | null } => {
  const expectSpec = step.expect
  const shouldParseJson = step.responseType === "json"
    || expectSpec?.jsonEquals !== undefined
    || expectSpec?.jsonExists !== undefined
    || expectSpec?.jsonLengthAtLeast !== undefined
    || step.capture !== undefined

  const jsonBody = shouldParseJson ? parseJson(bodyText, stepName) : null
  const sseEvents = step.responseType === "sse" || expectSpec?.sseEventTypesInclude !== undefined
    || expectSpec?.sseDataIncludes !== undefined
    ? parseSseEvents(bodyText)
    : null

  if (expectSpec?.status !== undefined && status !== expectSpec.status) {
    throw new StepError(stepName, `expected HTTP ${expectSpec.status}, got ${status}`)
  }

  for (const expectedText of expectSpec?.textIncludes ?? []) {
    const rendered = renderTemplateValue(expectedText, vars, stepName)
    if (typeof rendered !== "string") {
      throw new StepError(stepName, "textIncludes entries must render to strings")
    }
    if (!bodyText.includes(rendered)) {
      throw new StepError(stepName, `response body missing '${rendered}'`)
    }
  }

  for (const jsonPath of expectSpec?.jsonExists ?? []) {
    if (jsonBody === null) {
      throw new StepError(stepName, "jsonExists requires a JSON response")
    }
    const resolved = getByPath(jsonBody, jsonPath)
    if (resolved === undefined) {
      throw new StepError(stepName, `json path not found: ${jsonPath}`)
    }
  }

  for (const [jsonPath, expectedValue] of Object.entries(expectSpec?.jsonEquals ?? {})) {
    if (jsonBody === null) {
      throw new StepError(stepName, "jsonEquals requires a JSON response")
    }
    const actualValue = getByPath(jsonBody, jsonPath)
    const renderedExpected = renderTemplateValue(expectedValue, vars, stepName)
    if (!isDeepStrictEqual(actualValue, renderedExpected)) {
      throw new StepError(
        stepName,
        `json mismatch at '${jsonPath}', expected ${JSON.stringify(renderedExpected)}, got ${JSON.stringify(actualValue)}`
      )
    }
  }

  for (const [jsonPath, minLength] of Object.entries(expectSpec?.jsonLengthAtLeast ?? {})) {
    if (jsonBody === null) {
      throw new StepError(stepName, "jsonLengthAtLeast requires a JSON response")
    }

    const target = getByPath(jsonBody, jsonPath)
    const length = Array.isArray(target)
      ? target.length
      : typeof target === "string"
      ? target.length
      : isObject(target)
      ? Object.keys(target).length
      : -1

    if (length < minLength) {
      throw new StepError(
        stepName,
        `json length at '${jsonPath}' expected >= ${minLength}, got ${length}`
      )
    }
  }

  for (const eventType of expectSpec?.sseEventTypesInclude ?? []) {
    if (sseEvents === null) {
      throw new StepError(stepName, "sseEventTypesInclude requires responseType=sse")
    }
    if (!sseEvents.some((event) => event.event === eventType)) {
      throw new StepError(stepName, `missing SSE event '${eventType}'`)
    }
  }

  for (const snippet of expectSpec?.sseDataIncludes ?? []) {
    if (sseEvents === null) {
      throw new StepError(stepName, "sseDataIncludes requires responseType=sse")
    }
    if (!sseEvents.some((event) => event.data.includes(snippet))) {
      throw new StepError(stepName, `missing SSE data snippet '${snippet}'`)
    }
  }

  return {
    jsonBody,
    sseEvents
  }
}

const withRetry = <A>(
  label: string,
  retry: RetryPolicy | undefined,
  operation: () => Effect.Effect<A, unknown>
): Effect.Effect<A, unknown> => {
  if (!retry) {
    return operation()
  }

  return Effect.gen(function*() {
    const startedAt = Date.now()
    let attempt = 0
    let lastCause: Cause.Cause<unknown> | null = null

    while (Date.now() - startedAt <= retry.timeoutMs) {
      attempt += 1
      const exit = yield* Effect.exit(operation())
      if (Exit.isSuccess(exit)) {
        return exit.value
      }

      lastCause = exit.cause
      yield* Effect.sleep(Duration.millis(retry.intervalMs))
    }

    const reason = lastCause === null
      ? "unknown failure"
      : Cause.pretty(lastCause)

    return yield* Effect.fail(
      new StepError(
        label,
        `timed out after ${attempt} attempts (${retry.timeoutMs} ms). last error: ${reason}`
      )
    )
  })
}

const getSqliteHandle = (ctx: MutableRunContext): Effect.Effect<Database, unknown> => {
  const dbPath = ctx.dbPath
  if (dbPath === null) {
    return Effect.fail(new StepError("sql", "SQL step requires --db-path or managed server mode"))
  }

  const existing = ctx.sqliteHandles.get(dbPath)
  if (existing) {
    return Effect.succeed(existing)
  }

  return Effect.sync(() => {
    const db = new Database(dbPath)
    ctx.sqliteHandles.set(dbPath, db)
    return db
  })
}

const runRequestStepOnce = (
  step: RequestStep,
  ctx: MutableRunContext,
  stepName: string
): Effect.Effect<void, unknown> =>
  Effect.gen(function*() {
    const renderedPath = renderTemplateValue(step.path, ctx.vars, stepName)
    if (typeof renderedPath !== "string") {
      return yield* Effect.fail(new StepError(stepName, "path must render to string"))
    }

    const url = renderedPath.startsWith("http://") || renderedPath.startsWith("https://")
      ? renderedPath
      : `${ctx.baseUrl.replace(/\/$/, "")}/${renderedPath.replace(/^\//, "")}`

    const headers = new Headers()
    for (const [headerName, headerValue] of Object.entries(step.headers ?? {})) {
      const renderedHeaderValue = renderTemplateValue(headerValue, ctx.vars, stepName)
      headers.set(headerName, String(renderedHeaderValue))
    }

    const renderedBody = step.body === undefined
      ? undefined
      : renderTemplateValue(step.body, ctx.vars, stepName)

    let bodyText: string | undefined
    if (renderedBody !== undefined) {
      bodyText = JSON.stringify(renderedBody)
      if (!headers.has("content-type")) {
        headers.set("content-type", "application/json")
      }
    }

    const response = yield* Effect.tryPromise({
      try: () => fetch(url, {
        method: step.method,
        headers,
        body: bodyText ?? null
      }),
      catch: (error) => new StepError(stepName, `request failed: ${String(error)}`)
    })

    const text = yield* Effect.tryPromise({
      try: () => response.text(),
      catch: (error) => new StepError(stepName, `failed reading response body: ${String(error)}`)
    })

    const { jsonBody } = assertRequestExpectations(
      step,
      response.status,
      text,
      ctx.vars,
      stepName
    )

    for (const [varName, jsonPath] of Object.entries(step.capture ?? {})) {
      if (jsonBody === null) {
        return yield* Effect.fail(
          new StepError(stepName, `cannot capture '${varName}' without JSON response`)
        )
      }
      const captured = getByPath(jsonBody, jsonPath)
      if (captured === undefined) {
        return yield* Effect.fail(
          new StepError(stepName, `capture path '${jsonPath}' not found for variable '${varName}'`)
        )
      }
      ctx.vars[varName] = captured
    }
  })

const isReadSqlQuery = (query: string): boolean =>
  /^\s*(select|pragma|with)\b/i.test(query)

const runSqlStepOnce = (
  step: SqlStep,
  ctx: MutableRunContext,
  stepName: string
): Effect.Effect<void, unknown> =>
  Effect.gen(function*() {
    const renderedQuery = renderTemplateValue(step.query, ctx.vars, stepName)
    if (typeof renderedQuery !== "string") {
      return yield* Effect.fail(new StepError(stepName, "query must render to string"))
    }

    const db = yield* getSqliteHandle(ctx)

    const rows = yield* Effect.sync(() => {
      if (!isReadSqlQuery(renderedQuery)) {
        db.exec(renderedQuery)
        return [] as Array<Record<string, unknown>>
      }
      return db.query(renderedQuery).all() as Array<Record<string, unknown>>
    }).pipe(
      Effect.mapError((error) =>
        new StepError(stepName, `sql execution failed: ${String(error)}`)
      )
    )

    const expectSpec = step.expect
    if (expectSpec?.rowCount !== undefined && rows.length !== expectSpec.rowCount) {
      return yield* Effect.fail(
        new StepError(stepName, `expected rowCount=${expectSpec.rowCount}, got ${rows.length}`)
      )
    }

    if (expectSpec?.rowCountAtLeast !== undefined && rows.length < expectSpec.rowCountAtLeast) {
      return yield* Effect.fail(
        new StepError(stepName, `expected rowCount >= ${expectSpec.rowCountAtLeast}, got ${rows.length}`)
      )
    }

    if ((expectSpec?.firstRowEquals && rows.length === 0)
      || (expectSpec?.firstRowNumberAtLeast && rows.length === 0)
      || (step.capture && rows.length === 0)) {
      return yield* Effect.fail(
        new StepError(stepName, "expected at least one SQL row")
      )
    }

    const firstRow = rows[0] ?? null

    for (const [pathExpr, expected] of Object.entries(expectSpec?.firstRowEquals ?? {})) {
      if (firstRow === null) {
        return yield* Effect.fail(new StepError(stepName, "no first row available for firstRowEquals"))
      }
      const actual = getByPath(firstRow, pathExpr)
      const renderedExpected = renderTemplateValue(expected, ctx.vars, stepName)
      if (!isDeepStrictEqual(actual, renderedExpected)) {
        return yield* Effect.fail(
          new StepError(
            stepName,
            `SQL first row mismatch at '${pathExpr}': expected ${JSON.stringify(renderedExpected)}, got ${JSON.stringify(actual)}`
          )
        )
      }
    }

    for (const [pathExpr, minValue] of Object.entries(expectSpec?.firstRowNumberAtLeast ?? {})) {
      if (firstRow === null) {
        return yield* Effect.fail(new StepError(stepName, "no first row available for firstRowNumberAtLeast"))
      }
      const actual = getByPath(firstRow, pathExpr)
      if (typeof actual !== "number" || actual < minValue) {
        return yield* Effect.fail(
          new StepError(
            stepName,
            `SQL first row value at '${pathExpr}' expected >= ${minValue}, got ${JSON.stringify(actual)}`
          )
        )
      }
    }

    for (const [varName, rowPath] of Object.entries(step.capture ?? {})) {
      if (firstRow === null) {
        return yield* Effect.fail(new StepError(stepName, "no first row available for capture"))
      }
      const captured = getByPath(firstRow, rowPath)
      if (captured === undefined) {
        return yield* Effect.fail(
          new StepError(stepName, `capture path '${rowPath}' not found for variable '${varName}'`)
        )
      }
      ctx.vars[varName] = captured
    }
  })

const runStep = (
  step: FixtureStep,
  index: number,
  ctx: MutableRunContext
): Effect.Effect<ReadonlyArray<FixtureRunStepResult>, unknown> =>
  Effect.gen(function*() {
    const name = step.name ?? `${step.kind}#${index + 1}`

    const runOne = (): Effect.Effect<ReadonlyArray<FixtureRunStepResult>, unknown> => {
      const startedAt = Date.now()

      const done = (
        results: ReadonlyArray<FixtureRunStepResult>
      ): Effect.Effect<ReadonlyArray<FixtureRunStepResult>, unknown> =>
        Effect.succeed(results.map((result) => ({
          ...result,
          durationMs: Date.now() - startedAt
        })))

      switch (step.kind) {
        case "set":
          return Effect.sync(() => {
            const rendered = renderTemplateValue(step.values, ctx.vars, name)
            if (!isObject(rendered)) {
              throw new StepError(name, "set.values must render to an object")
            }
            Object.assign(ctx.vars, rendered)
            return [
              {
                index,
                name,
                kind: step.kind,
                durationMs: Date.now() - startedAt
              }
            ] as const
          })

        case "sleep":
          return Effect.sleep(Duration.millis(step.ms)).pipe(
            Effect.flatMap(() => done([
              {
                index,
                name,
                kind: step.kind,
                durationMs: 0
              }
            ]))
          )

        case "request":
          return withRetry(name, step.retry, () => runRequestStepOnce(step, ctx, name)).pipe(
            Effect.flatMap(() => done([
              {
                index,
                name,
                kind: step.kind,
                durationMs: 0
              }
            ]))
          )

        case "sql":
          return withRetry(name, step.retry, () => runSqlStepOnce(step, ctx, name)).pipe(
            Effect.flatMap(() => done([
              {
                index,
                name,
                kind: step.kind,
                durationMs: 0
              }
            ]))
          )

        case "file_exists":
          return withRetry(name, step.retry, () =>
            Effect.sync(() => {
              const renderedPath = renderTemplateValue(step.path, ctx.vars, name)
              if (typeof renderedPath !== "string") {
                throw new StepError(name, "file path must render to a string")
              }
              const expected = step.expectExists ?? true
              const exists = existsSync(renderedPath)
              if (exists !== expected) {
                throw new StepError(
                  name,
                  `file existence check failed: path=${renderedPath}, expected=${expected}, actual=${exists}`
                )
              }
            })
          ).pipe(
            Effect.flatMap(() => done([
              {
                index,
                name,
                kind: step.kind,
                durationMs: 0
              }
            ]))
          )

        case "repeat":
          return Effect.gen(function*() {
            const previousRepeatIndex = ctx.vars.repeat_index
            const previousRepeatIteration = ctx.vars.repeat_iteration
            const collected: Array<FixtureRunStepResult> = []

            for (let i = 0; i < step.times; i += 1) {
              ctx.vars.repeat_index = i
              ctx.vars.repeat_iteration = i + 1
              const nested = yield* runStep(step.step, index, ctx)
              collected.push(...nested.map((entry) => ({
                ...entry,
                name: `${name}[${i + 1}] -> ${entry.name}`
              })))
            }

            if (previousRepeatIndex === undefined) {
              delete ctx.vars.repeat_index
            } else {
              ctx.vars.repeat_index = previousRepeatIndex
            }

            if (previousRepeatIteration === undefined) {
              delete ctx.vars.repeat_iteration
            } else {
              ctx.vars.repeat_iteration = previousRepeatIteration
            }

            return yield* done(collected)
          })
      }
    }

    const stepResults = yield* runOne()
    return stepResults
  })

const closeSqliteHandles = (handles: Map<string, Database>) =>
  Effect.sync(() => {
    for (const db of handles.values()) {
      db.close()
    }
    handles.clear()
  })

export const loadFixture = (fixturePath: string): Effect.Effect<FixtureFile, unknown> =>
  Effect.tryPromise({
    try: () => Bun.file(fixturePath).text(),
    catch: (error) => new StepError("loadFixture", `failed reading '${fixturePath}': ${String(error)}`)
  }).pipe(
    Effect.map((yamlText) => Bun.YAML.parse(yamlText)),
    Effect.flatMap((raw) =>
      Effect.try({
        try: () => decodeFixture(raw) as FixtureFile,
        catch: (error) =>
          new StepError(
            "loadFixture",
            `invalid fixture '${fixturePath}': ${error instanceof Error ? error.message : String(error)}`
          )
      })
    )
  )

export const runFixture = (options: FixtureRunOptions): Effect.Effect<FixtureRunResult, unknown> =>
  Effect.gen(function*() {
    const fixture = yield* loadFixture(options.fixturePath)

    const vars: Record<string, unknown> = {
      base_url: options.baseUrl,
      db_path: options.dbPath,
      cwd: process.cwd(),
      repo_root: process.cwd(),
      ...fixture.initialVars,
      ...options.initialVars
    }

    const ctx: MutableRunContext = {
      baseUrl: options.baseUrl,
      dbPath: options.dbPath,
      vars,
      sqliteHandles: new Map<string, Database>()
    }

    const startedAt = Date.now()
    const stepResults: Array<FixtureRunStepResult> = []

    try {
      for (let i = 0; i < fixture.steps.length; i += 1) {
        const step = fixture.steps[i]!
        const results = yield* runStep(step, i, ctx)
        stepResults.push(...results)
      }
    } finally {
      yield* closeSqliteHandles(ctx.sqliteHandles)
    }

    return {
      fixturePath: options.fixturePath,
      fixtureName: fixture.name,
      steps: stepResults,
      durationMs: Date.now() - startedAt,
      finalVars: { ...ctx.vars }
    } satisfies FixtureRunResult
  })
