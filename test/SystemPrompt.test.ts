import { describe, expect, test } from "bun:test"
import {
  buildExtractSystemPrompt,
  buildOneShotJsonSystemPrompt,
  buildOneShotSystemPrompt,
  buildReplSystemPrompt,
  buildReplSystemPromptDynamic,
  buildReplSystemPromptStatic
} from "../src/SystemPrompt"

describe("SystemPrompt", () => {
  const baseOptions = {
    depth: 0,
    iteration: 1,
    maxIterations: 10,
    maxDepth: 1,
    budget: { iterationsRemaining: 9, llmCallsRemaining: 19 }
  }
  const makeTool = (name: string) => ({
    name,
    description: `${name} description`,
    parameterNames: ["arg"],
    parametersJsonSchema: { type: "object" },
    returnsJsonSchema: { type: "object" }
  })

  test("buildReplSystemPrompt equals static + dynamic", () => {
    const options = {
      ...baseOptions,
      tools: [makeTool("search")]
    }
    const { iteration, budget, ...staticOptions } = options

    const combined = buildReplSystemPrompt(options)
    const split = buildReplSystemPromptStatic(staticOptions) + "\n" + buildReplSystemPromptDynamic({
      iteration,
      budget,
      maxIterations: options.maxIterations
    })

    expect(combined).toBe(split)
  })

  test("REPL prompt does not contain FINAL(...) instructions", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).not.toContain("FINAL(")
  })

  test("REPL prompt contains SUBMIT instruction", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("SUBMIT")
  })

  test("REPL prompt includes SUBMIT invocation schema guidance", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("SUBMIT invocation schema for this run")
    expect(prompt).toContain("\"required\":[\"answer\"]")
    expect(prompt).toContain("\"required\":[\"variable\"]")
    expect(prompt).toContain("\"additionalProperties\":false")
  })

  test("REPL prompt documents SUBMIT variable finalization option", () => {
    const plainPrompt = buildReplSystemPrompt(baseOptions)
    expect(plainPrompt).toContain("SUBMIT({ variable: \"finalAnswer\" })")

    const structuredPrompt = buildReplSystemPrompt({
      ...baseOptions,
      outputJsonSchema: { type: "object", properties: { ok: { type: "boolean" } } }
    })
    expect(structuredPrompt).toContain("SUBMIT({ variable: \"finalValue\" })")
  })

  test("REPL prompt contains llm_query when depth < maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("llm_query")
  })

  test("REPL prompt contains llm_query_batched guidance when depth < maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("llm_query_batched")
    expect(prompt).toContain("Promise.all")
  })

  test("REPL prompt contains Strategy section", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("## Strategy")
    expect(prompt).toContain("On your FIRST iteration")
  })

  test("REPL prompt rewrites Rule 8 to MATCH TOOL TO TASK", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("MATCH TOOL TO TASK")
    expect(prompt).not.toContain("PREFER CODE OVER SUB-CALLS")
  })

  test("REPL prompt omits llm_query when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("llm_query")
  })

  test("REPL prompt includes recursive example when depth < maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("## Example: Large-Context Semantic Analysis")
    expect(prompt).toContain("### Anti-Patterns")
  })

  test("REPL prompt omits recursive example when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("## Example: Large-Context Semantic Analysis")
    expect(prompt).not.toContain("### Anti-Patterns")
  })

  test("REPL prompt includes sub-model context hint when provided", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      subModelContextChars: 12_345
    })
    expect(prompt).toContain("~12345 chars")
    expect(prompt).toContain("~24 short records")
    expect(prompt).toContain("Math.ceil(totalChars / 12345)")
    expect(prompt).toContain("llm_query_batched")
  })

  test("REPL prompt contains budget numbers", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("Iterations remaining: 9")
    expect(prompt).toContain("LLM calls remaining: 19")
  })

  test("REPL prompt Budget section header references budget() for live values", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("call `budget()` in code for live values")
  })

  test("REPL prompt documents all budget() return fields when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("b.iterationsRemaining")
    expect(prompt).toContain("b.llmCallsRemaining")
    expect(prompt).toContain("b.tokenBudgetRemaining")
    expect(prompt).toContain("b.totalTokensUsed")
    expect(prompt).toContain("b.elapsedMs")
    expect(prompt).toContain("b.maxTimeMs")
  })

  test("REPL prompt omits budget() API reference when cannot recurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("b.iterationsRemaining")
    expect(prompt).not.toContain("b.llmCallsRemaining")
  })

  test("REPL prompt instructs to access __vars.context, __vars.query, and __vars.contextMeta", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("__vars.context")
    expect(prompt).toContain("__vars.query")
    expect(prompt).toContain("__vars.contextMeta")
  })

  test("REPL prompt does NOT contain actual context content", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).not.toContain("some actual user context data")
  })

  test("one-shot prompt does NOT mention tool-call syntax or code blocks", () => {
    const prompt = buildOneShotSystemPrompt()
    expect(prompt).not.toContain("```")
    expect(prompt).toContain("Do not use code blocks")
    expect(prompt).toContain("SUBMIT()")
    expect(prompt).not.toContain("FINAL()")
  })

  test("REPL prompt includes tool documentation when tools provided", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [{
        name: "search",
        description: "Search the web",
        parameterNames: ["query", "maxResults"],
        parametersJsonSchema: { type: "object", properties: { query: { type: "string" }, maxResults: { type: "number" } } },
        returnsJsonSchema: { type: "array" }
      }]
    })
    expect(prompt).toContain("## Available Tools")
    expect(prompt).toContain("search(query, maxResults)")
    expect(prompt).toContain("Search the web")
  })

  test("REPL prompt includes workflow-oriented NLP guidance when NLP tools are available", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("DocumentStats"),
        makeTool("LearnCustomEntities"),
        makeTool("ExtractKeywords"),
        makeTool("TextSimilarity"),
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("### NLP Tools")
    expect(prompt).toContain("Core Text Processing")
    expect(prompt).toContain("DocumentStats")
    expect(prompt).toContain("Entity Extraction and Learning")
    expect(prompt).toContain("LearnCustomEntities")
    expect(prompt).toContain("Keyword and Feature Extraction")
    expect(prompt).toContain("ExtractKeywords")
    expect(prompt).toContain("Similarity, Ranking, and Fuzzy Matching")
    expect(prompt).toContain("TextSimilarity")
    expect(prompt).toContain("Corpus Retrieval (Stateful BM25)")
    expect(prompt).toContain("CreateCorpus")
    expect(prompt).toContain("LearnCorpus")
    expect(prompt).toContain("QueryCorpus")
    expect(prompt).toContain("DeleteCorpus")
    expect(prompt).toContain("init_corpus(documents, options?)")
    expect(prompt).toContain("init_corpus_from_context(options?)")
  })

  test("REPL prompt includes context-specific retrieval guidance for large structured context with corpus tools", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })

    expect(prompt).toContain("### Context-Specific Guidance")
    expect(prompt).toContain("about 180 records")
    expect(prompt).toContain("prefer a retrieval-first pattern")
    expect(prompt).toContain("init_corpus_from_context")
    expect(prompt).toContain("CreateCorpus")
    expect(prompt).toContain("QueryCorpus")
  })

  test("REPL prompt omits context-specific retrieval guidance when corpus workflow tools are missing", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("QueryCorpus")
      ]
    })

    expect(prompt).not.toContain("### Context-Specific Guidance")
  })

  test("REPL prompt omits tool section when no tools", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).not.toContain("## Available Tools")
  })

  test("REPL prompt includes output format when outputJsonSchema provided", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      outputJsonSchema: { type: "object", properties: { answer: { type: "number" } } }
    })
    expect(prompt).toContain("## Output Format")
    expect(prompt).toContain("valid JSON matching this schema")
    expect(prompt).toContain('"answer"')
  })

  test("REPL prompt omits output format when no outputJsonSchema", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).not.toContain("## Output Format")
  })

  test("strict mode suppresses llm_query even when depth < maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1, sandboxMode: "strict" })
    expect(prompt).not.toContain("llm_query")
    expect(prompt).not.toContain("## Recursive Sub-calls")
    expect(prompt).toContain("Strict mode: bridge calls are disabled")
  })

  test("REPL prompt includes File System & Shell section in permissive mode", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("## File System & Shell")
    expect(prompt).toContain("await readFile")
    expect(prompt).toContain("await writeFile")
    expect(prompt).toContain("await listDir")
    expect(prompt).toContain("await stat")
    expect(prompt).toContain("await mkdir")
    expect(prompt).toContain("await remove")
    expect(prompt).toContain("await exists")
    expect(prompt).toContain("await shell")
    expect(prompt).toContain("cwd()")
    expect(prompt).toContain("sh -c")
    expect(prompt).toContain("auto-cleaned")
  })

  test("strict mode suppresses File System & Shell section", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, sandboxMode: "strict" })
    expect(prompt).not.toContain("## File System & Shell")
    expect(prompt).not.toContain("await readFile")
    expect(prompt).not.toContain("await shell")
  })

  test("strict mode suppresses tools section", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      sandboxMode: "strict",
      tools: [{
        name: "search",
        description: "Search the web",
        parameterNames: ["query"],
        parametersJsonSchema: { type: "object" },
        returnsJsonSchema: { type: "array" }
      }]
    })
    expect(prompt).not.toContain("## Available Tools")
    expect(prompt).not.toContain("search")
  })

  test("REPL prompt contains EXPLORE FIRST rule", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("EXPLORE FIRST")
  })

  test("REPL prompt contains ITERATE rule", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("ITERATE")
  })

  test("REPL prompt contains VERIFY BEFORE SUBMITTING rule", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("VERIFY BEFORE SUBMITTING")
  })

  test("REPL prompt contains MINIMIZE RETYPING rule", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("MINIMIZE RETYPING")
  })

  test("REPL prompt contains scope semantics: local variables do NOT survive", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("local variables")
    expect(prompt).toContain("do NOT survive")
  })

  test("REPL prompt contains __vars.results example", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("__vars.results")
  })

  test("REPL prompt contains __vars.context.slice example", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("__vars.context.slice")
  })

  test("REPL prompt contains ALWAYS use print()", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("ALWAYS use `print()`")
  })

  test("REPL prompt contains SUBMIT safety guardrail", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("Do NOT call SUBMIT until you have seen execution output")
  })

  test("REPL prompt contains HANDLE ERRORS rule", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("HANDLE ERRORS")
  })

  test("REPL prompt contains do not paste context text", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("Do not paste context text")
  })

  test("REPL prompt contains [object Promise] warning when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("[object Promise]")
  })

  test("last iteration (iterationsRemaining: 0) contains LAST iteration warning", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      budget: { iterationsRemaining: 0, llmCallsRemaining: 19 }
    })
    expect(prompt).toContain("LAST iteration")
  })

  test("penultimate iteration (iterationsRemaining: 1) does NOT contain LAST iteration warning", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      budget: { iterationsRemaining: 1, llmCallsRemaining: 19 }
    })
    expect(prompt).not.toContain("LAST iteration")
  })

  test("REPL prompt warns about console.log", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("console.log")
    expect(prompt).toContain("stderr")
  })

  test("REPL prompt mentions await for llm_query", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("await llm_query")
  })

  test("tool usage includes await requirement", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [{
        name: "fetch",
        description: "Fetch a URL",
        parameterNames: ["url"],
        parametersJsonSchema: { type: "object" },
        returnsJsonSchema: { type: "string" }
      }]
    })
    expect(prompt).toContain("(requires await)")
  })

  test("canRecurse=false with tools includes tools but not llm_query", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 1,
      maxDepth: 1,
      tools: [makeTool("search")]
    })
    expect(prompt).toContain("## Available Tools")
    expect(prompt).toContain("search")
    expect(prompt).not.toContain("llm_query")
  })

  test("outputJsonSchema + corpus tools uses value-based SUBMIT in examples", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      outputJsonSchema: { type: "object", properties: { ok: { type: "boolean" } } },
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("### Context-Specific Guidance")
    expect(prompt).toContain("SUBMIT({ value:")
    expect(prompt).toContain("Do NOT use `SUBMIT({ answer:")
    // The retrieval-first example should use value-based SUBMIT, not answer-based
    expect(prompt).toContain("SUBMIT({ value: synthesis })")
  })

  test("hasLargeStructuredContext + canRecurse=false omits context-specific guidance", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 1,
      maxDepth: 1,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).not.toContain("### Context-Specific Guidance")
    expect(prompt).not.toContain("llm_query")
  })

  test("corpus guidance includes document shape, batch size, and BM25 scores when corpus tools present", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("Document shape")
    expect(prompt).toContain("500 documents per LearnCorpus")
    expect(prompt).toContain("BM25 relevance")
  })

  test("corpus guidance includes decision tree when RankByRelevance is present", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus"),
        makeTool("RankByRelevance")
      ]
    })
    expect(prompt).toContain("Decision tree")
    expect(prompt).toContain("RankByRelevance")
  })

  test("corpus guidance omits decision tree when RankByRelevance is absent", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).not.toContain("Decision tree")
  })

  test("corpus guidance omits decision tree when only TextSimilarity is present without RankByRelevance", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus"),
        makeTool("TextSimilarity")
      ]
    })
    expect(prompt).not.toContain("Decision tree")
  })

  test("sub-model capacity shows approx records per call", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      subModelContextChars: 50_000
    })
    expect(prompt).toContain("~50000 chars")
    expect(prompt).toContain("~100 short records")
    expect(prompt).toContain("Math.ceil(totalChars / 50000)")
  })

  test("error recovery patterns present when canRecurse", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1
    })
    expect(prompt).toContain("### Error recovery patterns")
    expect(prompt).toContain("try/catch")
    expect(prompt).toContain("Malformed NDJSON")
    expect(prompt).toContain("Truncated output")
  })

  test("error recovery patterns absent when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 1,
      maxDepth: 1
    })
    expect(prompt).not.toContain("### Error recovery patterns")
  })

  test("new worked examples present when canRecurse", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1
    })
    expect(prompt).toContain("## Example: Code-Filter Then Semantic Analysis")
    expect(prompt).toContain("## Example: Incremental Buffer Accumulation")
    expect(prompt).toContain("renewable energy")
    expect(prompt).toContain("__vars.buffer")
    expect(prompt).toContain("__vars.nextIndex")
  })

  test("new worked examples absent in strict mode", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      sandboxMode: "strict"
    })
    expect(prompt).not.toContain("## Example: Code-Filter Then Semantic Analysis")
    expect(prompt).not.toContain("## Example: Incremental Buffer Accumulation")
  })

  test("auto-detect note present when hasLargeStructuredContext", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("auto-detects format")
    expect(prompt).toContain("NDJSON, JSON array, CSV, TSV, and plain-text")
  })

  test("REPL prompt shows detected primaryTextField in context guidance", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180,
        primaryTextField: "body_markdown"
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("Detected primary text field: `body_markdown`")
    expect(prompt).toContain("init_corpus_from_context")
  })

  test("REPL prompt omits primaryTextField line when not detected", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      contextMetadata: {
        format: "ndjson",
        chars: 60_000,
        lines: 500,
        recordCount: 180
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).not.toContain("Detected primary text field")
  })

  test("REPL prompt contains cross-iteration variable scoping warning", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("Do NOT reference `const`/`let` variables from a previous iteration")
    expect(prompt).toContain("WRONG: Iter 1: `const results = ...`")
    expect(prompt).toContain("RIGHT: Iter 1: `__vars.results = ...`")
  })

  test("corpus guidance mentions textField override option", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("textField")
    expect(prompt).toContain("body_markdown")
  })

  test("non-structured contextMetadata format omits context-specific guidance", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      contextMetadata: {
        format: "plain-text",
        chars: 60_000,
        lines: 500
      },
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).not.toContain("### Context-Specific Guidance")
  })

  test("REPL prompt contains First Iteration Protocol with planning guidance", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("### First Iteration Protocol")
    expect(prompt).toContain("Classify the task")
    expect(prompt).toContain("// PLAN:")
    expect(prompt).toContain("Execute step 1 of your plan")
  })

  test("REPL prompt contains budget feasibility in planning when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("Compute budget feasibility")
    expect(prompt).toContain("await budget()")
    expect(prompt).toContain("maxProcessable")
  })

  test("REPL prompt omits budget feasibility in planning when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("Compute budget feasibility")
  })

  test("REPL prompt contains Record Selection hierarchy when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("## Record Selection for Structured Data")
    expect(prompt).toContain("FIELD MATCHING")
    expect(prompt).toContain("REGEX/KEYWORD")
    expect(prompt).toContain("LLM CLASSIFICATION")
    expect(prompt).toContain("NEVER spend multiple iterations retrying")
  })

  test("REPL prompt Record Selection includes BM25 when corpus workflow available", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      depth: 0,
      maxDepth: 1,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus")
      ]
    })
    expect(prompt).toContain("BM25 CORPUS")
    expect(prompt).toContain("scores approach zero")
    expect(prompt).toContain("top scores < 0.1")
  })

  test("REPL prompt Record Selection omits BM25 when no corpus workflow", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("## Record Selection for Structured Data")
    expect(prompt).not.toContain("BM25 CORPUS")
  })

  test("REPL prompt omits Record Selection when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("## Record Selection for Structured Data")
  })

  test("REPL prompt contains Recursive Decomposition strategy when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("### Recursive Decomposition for Large Datasets")
    expect(prompt).toContain("Explore → Filter → Decompose → Process → Aggregate")
    expect(prompt).toContain("Coverage Calculation")
    expect(prompt).toContain("Budget Allocation")
    expect(prompt).toContain("Sub-Call Behavior")
    expect(prompt).toContain("ONE-SHOT")
  })

  test("REPL prompt omits Recursive Decomposition when depth >= maxDepth", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 1, maxDepth: 1 })
    expect(prompt).not.toContain("### Recursive Decomposition for Large Datasets")
  })

  test("REPL prompt contains variable cleanup guidance", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("delete __vars.rawArticles")
    expect(prompt).toContain("waste context tokens")
  })

  test("REPL prompt contains Reassessment section", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("### Reassessment")
    expect(prompt).toContain("past iteration 3")
    expect(prompt).toContain("different strategy")
    expect(prompt).toContain("Do NOT keep retrying")
  })

  test("REPL prompt Reassessment includes budget check when canRecurse", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).toContain("Check remaining budget")
  })

  test("REPL prompt contains BM25 caveats in corpus section", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      tools: [
        makeTool("CreateCorpus"),
        makeTool("LearnCorpus"),
        makeTool("QueryCorpus"),
        makeTool("CorpusStats"),
        makeTool("DeleteCorpus")
      ]
    })
    expect(prompt).toContain("BM25 performance degrades significantly")
    expect(prompt).toContain("documents >2,000 words")
    expect(prompt).toContain("metadata fields")
    expect(prompt).toContain("code filtering FIRST")
    expect(prompt).toContain("top scores < 0.1")
  })

  test("REPL prompt contains phase indicator in budget section", () => {
    const earlyPrompt = buildReplSystemPrompt({
      ...baseOptions,
      iteration: 1,
      budget: { iterationsRemaining: 9, llmCallsRemaining: 19 }
    })
    expect(earlyPrompt).toContain("Phase: EXPLORE/PLAN")

    const midPrompt = buildReplSystemPrompt({
      ...baseOptions,
      iteration: 5,
      maxIterations: 10,
      budget: { iterationsRemaining: 5, llmCallsRemaining: 15 }
    })
    expect(midPrompt).toContain("Phase: EXECUTE")

    const latePrompt = buildReplSystemPrompt({
      ...baseOptions,
      iteration: 9,
      maxIterations: 10,
      budget: { iterationsRemaining: 1, llmCallsRemaining: 5 }
    })
    expect(latePrompt).toContain("Phase: SYNTHESIZE/SUBMIT")
  })

  test("REPL prompt no longer contains old 'Budget-aware chunking strategy' section", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 0, maxDepth: 1 })
    expect(prompt).not.toContain("### Budget-aware chunking strategy")
  })

  test("REPL prompt includes dynamic frame limit when maxFrameBytes provided", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      maxFrameBytes: 32 * 1024 * 1024
    })
    expect(prompt).toContain("~32MB")
    expect(prompt).toContain("split across multiple variables")
  })

  test("REPL prompt shows KB for sub-MB maxFrameBytes", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      maxFrameBytes: 512 * 1024
    })
    expect(prompt).toContain("~512KB")
    expect(prompt).not.toContain("~0MB")
  })

  test("REPL prompt clamps sub-KB maxFrameBytes to 1KB", () => {
    const prompt = buildReplSystemPrompt({
      ...baseOptions,
      maxFrameBytes: 128
    })
    expect(prompt).toContain("~1KB")
    expect(prompt).not.toContain("~0KB")
  })

  test("REPL prompt omits frame limit when maxFrameBytes not provided", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).not.toContain("cannot exceed")
  })

  test("REPL prompt includes size threshold guidance for variable-based SUBMIT", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("50KB")
    expect(prompt).toContain("500 lines")
    expect(prompt).toContain("prefer `SUBMIT({ variable:")
  })

  test("includes Input Files table when inputManifest is provided", () => {
    const prompt = buildReplSystemPromptStatic({
      ...baseOptions,
      inputManifest: [{
        name: "users",
        path: "users.ndjson",
        bytes: 15_728_640,
        format: "ndjson",
        lines: 15000,
        linesEstimated: true,
        recordCount: 15000,
        recordCountEstimated: true,
        fields: ["id", "name", "email"],
        sampleRecord: '{"id":1}'
      }]
    })

    expect(prompt).toContain("## Input Files")
    expect(prompt).toContain("users.ndjson")
    expect(prompt).toContain("ndjson")
    expect(prompt).toContain("15.0 MB")
    expect(prompt).toContain("~15,000")
    expect(prompt).toContain("id, name, email")
    expect(prompt).toContain("`__vars.inputs` contains the full manifest")
    expect(prompt).toContain("linesEstimated")
  })

  test("does not include Input Files section when no inputs", () => {
    const prompt = buildReplSystemPromptStatic(baseOptions)
    expect(prompt).not.toContain("## Input Files")
  })

  test("caps Input Files table at 20 entries", () => {
    const entries = Array.from({ length: 25 }, (_, i) => ({
      name: `file${i}`, path: `file${i}.csv`, bytes: 1000,
      format: "csv", lines: 10, linesEstimated: false,
      recordCount: 9, recordCountEstimated: false,
      fields: ["a", "b"], sampleRecord: "1,2"
    }))
    const prompt = buildReplSystemPromptStatic({ ...baseOptions, inputManifest: entries })
    expect(prompt).toContain("and 5 more files")
    expect(prompt).not.toContain("| file20.csv")
  })

  test("sanitizes pipe characters in input manifest fields", () => {
    const prompt = buildReplSystemPromptStatic({
      ...baseOptions,
      inputManifest: [{
        name: "test", path: "test.ndjson", bytes: 100,
        format: "ndjson", lines: 1, linesEstimated: false,
        recordCount: 1, recordCountEstimated: false,
        fields: ["field|with|pipes", "<script>alert(1)</script>"], sampleRecord: "x"
      }]
    })
    expect(prompt).not.toContain("field|with")
    expect(prompt).not.toContain("<script>")
  })
})

describe("buildExtractSystemPrompt", () => {
  test("returns SUBMIT-only extraction instruction", () => {
    const prompt = buildExtractSystemPrompt()
    expect(prompt).toContain("SUBMIT")
    expect(prompt).toContain("ran out of iterations")
    expect(prompt).toContain('SUBMIT({ answer: "your answer" })')
    expect(prompt).toContain('SUBMIT({ variable: "finalAnswer" })')
    expect(prompt).toContain("SUBMIT invocation schema for this run")
    expect(prompt).not.toContain('FINAL("your answer")')
  })

  test("includes JSON schema when provided", () => {
    const schema = { type: "object", properties: { result: { type: "number" } } }
    const prompt = buildExtractSystemPrompt(schema)
    expect(prompt).toContain("valid JSON matching this schema")
    expect(prompt).toContain('"result"')
    expect(prompt).toContain("SUBMIT({ value: ... })")
    expect(prompt).toContain('SUBMIT({ variable: "finalValue" })')
    expect(prompt).toContain("\"required\":[\"value\"]")
    expect(prompt).toContain("\"required\":[\"variable\"]")
    expect(prompt).not.toContain("Fallback only if tool calling is unavailable")
    expect(prompt).not.toContain("FINAL(`{...}`)")
  })

  test("omits schema section when not provided", () => {
    const prompt = buildExtractSystemPrompt()
    expect(prompt).not.toContain("valid JSON matching this schema")
  })

  test("extract prompt includes PREFER for variable refs", () => {
    const prompt = buildExtractSystemPrompt()
    expect(prompt).toContain("PREFER")
    expect(prompt).toContain("avoids generating a large answer inline")
  })

  test("extract prompt includes available variable names when provided", () => {
    const prompt = buildExtractSystemPrompt(undefined, ["results", "context", "summary"])
    expect(prompt).toContain("`results`")
    expect(prompt).toContain("`summary`")
    expect(prompt).not.toContain("`context`")
  })

  test("extract prompt sanitizes variable names with backticks and newlines", () => {
    const prompt = buildExtractSystemPrompt(undefined, ["good", "has`tick", "new\nline", "ok"])
    expect(prompt).toContain("`good`")
    expect(prompt).toContain("`ok`")
    expect(prompt).toContain("`hastick`")
    expect(prompt).toContain("`newline`")
    // No raw backticks or newlines from injected names
    expect(prompt).not.toContain("has`tick")
    expect(prompt).not.toContain("new\nline")
  })

  test("extract prompt drops empty or overly long variable names", () => {
    const longName = "a".repeat(200)
    const prompt = buildExtractSystemPrompt(undefined, ["valid", "", longName])
    expect(prompt).toContain("`valid`")
    expect(prompt).not.toContain(longName)
  })

  test("extract prompt caps variable list at 50 entries", () => {
    const names = Array.from({ length: 80 }, (_, i) => `var${i}`)
    const prompt = buildExtractSystemPrompt(undefined, names)
    expect(prompt).toContain("`var0`")
    expect(prompt).toContain("`var49`")
    expect(prompt).not.toContain("`var50`")
    expect(prompt).toContain("(and 30 more)")
  })

  test("extract prompt omits variable list when only system variables present", () => {
    const prompt = buildExtractSystemPrompt(undefined, ["context", "contextMeta", "query"])
    expect(prompt).not.toContain("Available variables")
  })
})

describe("buildOneShotJsonSystemPrompt", () => {
  test("includes JSON schema and strict JSON-only instructions", () => {
    const schema = {
      type: "object",
      properties: {
        actors: {
          type: "array",
          items: { type: "object", properties: { name: { type: "string" } } }
        }
      },
      required: ["actors"]
    }
    const prompt = buildOneShotJsonSystemPrompt(schema)
    expect(prompt).toContain("valid JSON")
    expect(prompt).toContain("Required JSON Schema")
    expect(prompt).toContain('"actors"')
    expect(prompt).toContain("Do not include any text before or after the JSON")
    expect(prompt).toContain("Do not use markdown code fences")
  })

  test("schema is serialized as pretty-printed JSON", () => {
    const schema = { type: "object", properties: { x: { type: "number" } } }
    const prompt = buildOneShotJsonSystemPrompt(schema)
    // Should be multi-line (pretty-printed), not single-line
    expect(prompt).toContain('"type": "object"')
  })
})

describe("SystemPrompt responseFormat and depth>1 guidance", () => {
  const baseOptions = {
    depth: 0,
    iteration: 1,
    maxIterations: 10,
    maxDepth: 2,
    budget: { iterationsRemaining: 9, llmCallsRemaining: 19 }
  }

  test("includes responseFormat documentation when canRecurse", () => {
    const prompt = buildReplSystemPrompt(baseOptions)
    expect(prompt).toContain("responseFormat")
    expect(prompt).toContain("Structured Output")
    expect(prompt).toContain("parsed object")
  })

  test("omits responseFormat documentation when depth >= maxDepth (cannot recurse)", () => {
    const prompt = buildReplSystemPrompt({ ...baseOptions, depth: 2, maxDepth: 2 })
    expect(prompt).not.toContain("Structured Output (responseFormat)")
  })

  test("includes recursive sub-call guidance when depth allows sub-sub-calls", () => {
    // depth=0, maxDepth=3 → sub-calls at depth 1 can still recurse (1 < 3-1=2)
    const prompt = buildReplSystemPrompt({ ...baseOptions, maxDepth: 3 })
    expect(prompt).toContain("Recursive Sub-Calls")
    expect(prompt).toContain("own REPL")
  })

  test("omits recursive sub-call guidance when sub-calls would be one-shot", () => {
    // depth=0, maxDepth=1 → sub-calls at depth 1 are one-shot (1 >= 1)
    const prompt = buildReplSystemPrompt({ ...baseOptions, maxDepth: 1 })
    expect(prompt).not.toContain("Recursive Sub-Calls (depth > 1)")
  })

  test("omits recursive sub-call guidance when maxDepth=2 (sub-calls at max depth)", () => {
    // depth=0, maxDepth=2 → sub-calls at depth 1, which is < maxDepth=2 but
    // sub-sub-calls would be at depth 2 >= maxDepth → sub-calls' children are one-shot
    // The condition is depth < maxDepth - 1 (0 < 2-1=1 → true), so guidance should appear
    const prompt = buildReplSystemPrompt({ ...baseOptions, maxDepth: 2 })
    expect(prompt).toContain("Recursive Sub-Calls")
  })
})
