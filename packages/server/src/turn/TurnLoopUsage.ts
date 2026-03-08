import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Response from "effect/unstable/ai/Response"

export const zeroUsage = (): Response.Usage =>
  new Response.Usage({
    inputTokens: {
      uncached: 0,
      total: 0,
      cacheRead: 0,
      cacheWrite: 0
    },
    outputTokens: {
      total: 0,
      text: 0,
      reasoning: 0
    }
  })

export const addOptional = (a: number | undefined, b: number | undefined): number =>
  (a ?? 0) + (b ?? 0)

export const mergeUsage = (left: Response.Usage, right: Response.Usage): Response.Usage =>
  new Response.Usage({
    inputTokens: {
      uncached: addOptional(left.inputTokens.uncached, right.inputTokens.uncached),
      total: addOptional(left.inputTokens.total, right.inputTokens.total),
      cacheRead: addOptional(left.inputTokens.cacheRead, right.inputTokens.cacheRead),
      cacheWrite: addOptional(left.inputTokens.cacheWrite, right.inputTokens.cacheWrite)
    },
    outputTokens: {
      total: addOptional(left.outputTokens.total, right.outputTokens.total),
      text: addOptional(left.outputTokens.text, right.outputTokens.text),
      reasoning: addOptional(left.outputTokens.reasoning, right.outputTokens.reasoning)
    }
  })

export const makeLoopCapResponse = (
  maxIterations: number,
  usage: Response.Usage
): LanguageModel.GenerateTextResponse<any> =>
  new LanguageModel.GenerateTextResponse([
    Response.makePart("text", {
      text: `Stopped after reaching max tool iterations (${maxIterations}).`
    }),
    Response.makePart("finish", {
      reason: "other",
      usage,
      response: undefined
    })
  ])
