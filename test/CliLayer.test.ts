import { describe, expect, test } from "bun:test"
import { buildRlmModelLayer, makeCliConfig, makeCliTraceConfig, type CliArgs } from "../src/CliLayer"

const baseArgs: CliArgs = {
  query: "query",
  context: "context",
  provider: "anthropic",
  model: "model-a",
  quiet: false,
  noColor: false,
  nlpTools: false
}

describe("CliLayer config mapping", () => {
  test("maps provider and model into primary target", () => {
    const config = makeCliConfig({
      ...baseArgs,
      provider: "openai",
      model: "gpt-5"
    })

    expect(config.primaryTarget).toEqual({
      provider: "openai",
      model: "gpt-5"
    })
  })

  test("sets sub target when sub model is provided", () => {
    const config = makeCliConfig({
      ...baseArgs,
      provider: "google",
      model: "gemini-pro",
      subModel: "gemini-flash"
    })

    expect(config.subTarget).toEqual({
      provider: "google",
      model: "gemini-flash"
    })
  })

  test("omits sub target when sub model is not provided", () => {
    const config = makeCliConfig({
      ...baseArgs
    })

    expect(config.subTarget).toBeUndefined()
  })

  test("defaults delegation enabled when sub model is provided", () => {
    const config = makeCliConfig({
      ...baseArgs,
      subModel: "claude-haiku"
    })

    expect(config.subLlmDelegation.enabled).toBe(true)
    expect(config.subLlmDelegation.depthThreshold).toBe(1)
  })

  test("respects explicit delegation override and threshold", () => {
    const config = makeCliConfig({
      ...baseArgs,
      subModel: "claude-haiku",
      subDelegationEnabled: false,
      subDelegationDepthThreshold: 3
    })

    expect(config.subLlmDelegation.enabled).toBe(false)
    expect(config.subLlmDelegation.depthThreshold).toBe(3)
  })

  test("uses CLI defaults for max limits", () => {
    const config = makeCliConfig({
      ...baseArgs
    })

    expect(config.maxIterations).toBe(50)
    expect(config.maxDepth).toBe(1)
    expect(config.maxLlmCalls).toBe(200)
    expect(config.enablePromptCaching).toBe(true)
    expect(config.llmRetryCount).toBe(1)
    expect(config.llmRetryBaseDelayMs).toBe(100)
    expect(config.llmRetryJitter).toBe(true)
  })

  test("maps explicit prompt caching disable", () => {
    const config = makeCliConfig({
      ...baseArgs,
      enablePromptCaching: false
    })

    expect(config.enablePromptCaching).toBe(false)
  })

  test("maps noCache flag to cache.enabled=false", () => {
    const config = makeCliConfig({
      ...baseArgs,
      noCache: true
    })

    expect(config.cache?.enabled).toBe(false)
  })

  test("enables tracing by default with default base directory", () => {
    const traceConfig = makeCliTraceConfig({
      ...baseArgs
    })

    expect(traceConfig.enabled).toBe(true)
    expect(traceConfig.baseDir).toBe(".rlm/traces")
  })

  test("disables tracing with --no-trace and maps --trace-dir", () => {
    const traceConfig = makeCliTraceConfig({
      ...baseArgs,
      noTrace: true,
      traceDir: "/tmp/custom-traces"
    })

    expect(traceConfig.enabled).toBe(false)
    expect(traceConfig.baseDir).toBe("/tmp/custom-traces")
  })

  test("buildRlmModelLayer uses resolved credentials from CliArgs", () => {
    expect(() =>
      buildRlmModelLayer({
        ...baseArgs,
        provider: "openai",
        model: "gpt-test",
        openaiApiKey: "test-openai-key"
      })
    ).not.toThrow()
  })
})
