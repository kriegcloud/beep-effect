# Codex Workflow Surfaces And Agentic Workers For JSDoc Quality Enforcement

## Question

Which current Codex workflow surfaces should this initiative use for JSDoc quality enforcement, and how far should the repo go toward multi-tier agent workers or local-model workers before committing to implementation?

Decision needed: choose a practical enforcement shape that improves useful JSDoc on exported symbols without turning model judgment into the source of truth.

## Scope

This report covers Codex CLI, Codex SDK, `codex exec`, `/review`, hooks, rules, `AGENTS.md`, skills, subagents, GitHub review/action surfaces, and local-model worker plausibility. It focuses on how those surfaces could support JSDoc documentation inventory, review, and remediation in `initiatives/jsdoc-quality-enforcement`.

This report is inspect-only. It does not run models, prototype local providers, smoke-test the Codex SDK, edit initiative `SPEC.md` or `PLAN.md`, update `ops/manifest.json`, or touch production code.

## Repo Evidence

- The initiative is explicitly research-first. [README.md](../README.md) says the packet exists to collect synthesized research before implementation and should not be treated as approval to build an agentic scoring or remediation pipeline.
- The report contract is fixed by [research/README.md](./README.md): reports belong in `research/` and should use `Question`, `Scope`, `Repo Evidence`, `External Evidence`, `Options`, `Tradeoffs And Risks`, `Recommendation`, and `Open Questions`.
- The root package already exposes deterministic documentation gates: `docgen`, `docgen:affected`, `docs:aggregate`, and `jsdoc:inventory` in [package.json](../../../package.json). That means agent workflows can consume repo facts instead of rediscovering policy from source text each run.
- The current inventory generator renders a compliance inventory over the current `bun run topo-sort` universe and checks gaps that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root custom tag registration, and schema annotation/type-alias gaps. Run it through `bun run jsdoc:inventory`, which delegates to `bun run beep quality jsdoc-inventory`.
- The JSDoc source of truth is [.patterns/jsdoc-documentation.md](../../../.patterns/jsdoc-documentation.md). It requires compilable examples through `bun run docgen`, required `@example`, `@category`, and `@since` tags, and conditional tags only when they add information beyond the TypeScript signature.
- The repo-local `jsdoc-annotation-specialist` skill already encodes this policy and adds schema annotation checks, including `$I.annote` / `$I.annoteSchema`, import alias rules, and TSDoc grammar checks. See [.claude/skills/jsdoc-annotation-specialist/SKILL.md](../../../.claude/skills/jsdoc-annotation-specialist/SKILL.md).
- The top-level [AGENTS.md](../../../AGENTS.md) already includes repo-wide agent rules: schema-first domain models, typed errors, Effect modules over native helpers, package-alias imports in tests, explicit service boundaries, green quality commands, and Graphiti as durable repo memory.
- Repo-local Codex config enables the relevant skills, including `jsdoc-annotation-specialist`, `mcp-graphiti-memory`, and `quality-review-fix-loop`. See [.codex/config.toml](../../../.codex/config.toml).
- `@beep/repo-cli` already depends on `@openai/codex-sdk` through the catalog in [packages/tooling/tool/cli/package.json](../../../packages/tooling/tool/cli/package.json), and the root catalog pins `@openai/codex-sdk` to `~0.130.0` in [package.json](../../../package.json).
- The repo already contains a bounded Codex SDK adapter smoke path under [packages/tooling/tool/cli/src/commands/Reuse/internal/CodexRunner.ts](../../../packages/tooling/tool/cli/src/commands/Reuse/internal/CodexRunner.ts). It imports `@openai/codex-sdk`, constructs `new Codex()`, starts a thread with `workingDirectory` and `skipGitRepoCheck`, and explicitly notes that it validates import/thread startup only and does not execute an agent loop.
- The installed local SDK package is `@openai/codex-sdk` version `0.130.0`. Its README says the TypeScript SDK wraps the `codex` CLI, spawns it, exchanges JSONL events over stdin/stdout, supports `run`, `runStreamed`, structured output schemas, resume, working directory controls, CLI environment control, and `--config` overrides. Its type declarations expose `ThreadOptions` for model, sandbox, working directory, reasoning effort, network access, web search, approval policy, and additional directories.
- The repo already has a local automation wrapper command, `bun run codex:quality-review-fix-loop`, which delegates to `bun run beep codex quality-review-fix-loop` and runs `codex exec --cd "$ROOT_DIR"` with the repo-local `quality-review-fix-loop` skill. The prompt explicitly avoids publishing or PR actions unless requested.

## External Evidence

- Codex CLI is a local terminal coding agent that can inspect repositories, edit files, and run commands in the selected directory. The CLI docs call out local code review, subagents, web search, cloud tasks, scripting with `exec`, MCP, and approval modes as first-class workflow surfaces. Source: [Codex CLI docs](https://developers.openai.com/codex/cli).
- `/review` is available as a CLI slash command for working-tree review. The docs say it summarizes behavior-change and missing-test issues and uses the current session model unless `review_model` is configured. Source: [Codex CLI slash commands](https://developers.openai.com/codex/cli/slash-commands).
- The Codex app review pane can display `/review` comments inline, supports line-specific feedback, and can help work through PR feedback when `gh` is installed and authenticated. Source: [Codex app review docs](https://developers.openai.com/codex/app/review).
- Codex GitHub code review can be requested with `@codex review`, can run automatically, follows repository guidance from `AGENTS.md`, and focuses GitHub review comments on P0/P1 issues by default. The docs also describe adding review guidelines to top-level `AGENTS.md` and deeper package-level `AGENTS.md` files. Source: [Codex GitHub integration docs](https://developers.openai.com/codex/integrations/github).
- `AGENTS.md` is a durable instruction surface. Codex builds an instruction chain at startup from global and project scopes, walks from project root to current working directory, includes at most one instruction file per directory, concatenates from root down, and lets closer files override earlier guidance. The default project-doc byte cap is 32 KiB. Source: [AGENTS.md docs](https://developers.openai.com/codex/guides/agents-md).
- Rules are command policy files loaded from active config layers. `prefix_rule` can `allow`, `prompt`, or `forbidden` matching command prefixes, with the most restrictive decision winning. Project-local rules only load when the project `.codex/` layer is trusted. Source: [Codex rules docs](https://developers.openai.com/codex/rules).
- Hooks are lifecycle commands that can add context or interrupt supported flows. `SessionStart` can add developer context, `UserPromptSubmit` can add context or block a prompt, `PreToolUse` can intercept Bash, `apply_patch`, and MCP tool calls, `PostToolUse` can add feedback after supported tool output, and `Stop` can continue a turn with a new prompt. Hooks are useful guardrails, but the docs warn that `PreToolUse` is not a complete enforcement boundary and does not intercept all shell, web, or non-MCP tool paths. Source: [Codex hooks docs](https://developers.openai.com/codex/hooks).
- Hooks are still marked experimental in advanced configuration. They must be enabled with `[features].codex_hooks = true`, can live in user or repo `.codex` config/hook files, and project-local hooks only load when the project layer is trusted. Source: [Codex advanced configuration](https://developers.openai.com/codex/config-advanced).
- Skills package reusable workflows as `SKILL.md` plus optional scripts, references, assets, and agent metadata. Codex can invoke them explicitly with `$skill-name` or implicitly from descriptions, and skills are available in CLI, IDE, and app. Source: [Codex skills docs](https://developers.openai.com/codex/skills).
- Subagents can run specialized agents in parallel, collect results into one response, and use custom model/config/instruction profiles. Codex only spawns them when explicitly asked, and each subagent does its own model and tool work. The docs include a PR-review example with read-only explorer/reviewer/docs-researcher agents and an experimental CSV batch fan-out mode for repeated audits. Source: [Codex subagents docs](https://developers.openai.com/codex/subagents).
- `codex exec` is the non-interactive automation surface for scripts and CI. It can run in pipelines, output JSONL event streams, consume piped stdin as context, and run with explicit sandbox/approval settings. Source: [Codex non-interactive mode docs](https://developers.openai.com/codex/noninteractive).
- The Codex SDK lets applications programmatically control local Codex agents, start and resume threads, and run multiple turns. OpenAI positions it as more flexible than non-interactive mode for internal tools and CI/CD workflows. Source: [Codex SDK docs](https://developers.openai.com/codex/sdk).
- The Codex GitHub Action runs `codex exec` in CI/CD, can apply patches or post reviews, and accepts inline prompts or committed prompt files. Source: [Codex GitHub Action docs](https://developers.openai.com/codex/github-action).
- Codex configuration supports custom model providers, built-in reserved provider IDs including `openai`, `ollama`, and `lmstudio`, and `oss_provider = "lmstudio" | "ollama"` for `--oss` sessions. Custom provider configuration uses base URLs, auth, headers, retries, stream timeouts, and `wire_api = "responses"` as the only supported custom-provider protocol. Sources: [Codex config reference](https://developers.openai.com/codex/config-reference) and [advanced configuration](https://developers.openai.com/codex/config-advanced).
- Qwen's official Qwen3-Coder announcement positions Qwen3-Coder as an agentic code model family, with the 480B-A35B variant supporting 256K native context and 1M with extrapolation, and Qwen Code adapted with custom prompts and function-calling protocols. Source: [Qwen3-Coder announcement](https://qwenlm.github.io/blog/qwen3-coder/).
- Qwen's Hugging Face model cards show smaller local-worker candidates: `Qwen3-Coder-30B-A3B-Instruct` has 30.5B total and 3.3B active parameters, native 262,144-token context, agentic coding/tool-call positioning, and quantization links for llama.cpp, Ollama, LM Studio, and compatible apps. `Qwen3-Coder-Next-Base` is an 80B total / 3B active open-weight base model designed for coding agents and local development, with tool calling, scaffold/template adaptation, and error detection/recovery claims. Sources: [Qwen3-Coder-30B-A3B-Instruct](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct) and [Qwen3-Coder-Next-Base](https://huggingface.co/Qwen/Qwen3-Coder-Next-Base).
- OpenAI's external-model eval docs are relevant for evaluation planning, not for Codex worker execution. They warn that calls to external models pass data to third parties with different terms and weaker safety guarantees, and note that tool calls are not currently supported in that eval path. Source: [Evaluate external models](https://developers.openai.com/api/docs/guides/external-models).

## Options

1. Keep Codex as advisory review only.

Use `AGENTS.md` review guidelines, the existing `jsdoc-annotation-specialist` skill, `/review`, and GitHub `@codex review` to catch documentation quality issues after humans or deterministic scripts produce a diff. This is low-risk and easy to adopt, but it does not create reliable enforcement.

2. Deterministic gates first, Codex as orchestrated fixer/reviewer.

Treat `bun run jsdoc:inventory`, `bun run docgen`, package `beep docgen analyze/check`, and category/schema policy as the source of truth. Use `codex exec --json` or `@openai/codex-sdk` to route compact inventory packets to Codex workers for evidence gathering, remediation proposals, and scoped fixes. This fits the repo's existing SDK dependency and avoids making model taste the compliance boundary.

3. Codex subagent fan-out for package-level audit and remediation.

Define read-only custom agents such as `jsdoc_evidence_scout`, `jsdoc_reviewer`, and `docs_api_verifier`, then use explicit subagent prompts or the experimental CSV batch flow for one package/file row per worker. This is attractive for large inventories, especially because JSDoc remediation naturally partitions by package and exported symbol.

4. Hook-assisted local enforcement.

Use `SessionStart` to inject the compact JSDoc policy and current initiative posture, `UserPromptSubmit` to reject broad or write-unsafe JSDoc prompts, `PreToolUse` or rules to block unsafe commands, `PostToolUse` to notice changed documentation files, and `Stop` to continue until inventory/docgen reruns are reported. Hooks can make Codex more disciplined, but they are guardrails, not a hard security or quality boundary.

5. Local model workers under a Codex orchestrator.

Use Codex as the trusted orchestrator and delegate cheap, read-only, low-risk tasks to local Qwen-family coding models through a supported local provider, likely Ollama or LM Studio, or through an OpenAI Responses-compatible proxy if one exists. Candidate tasks include triaging inventory rows, drafting candidate summaries, ranking packages by documentation risk, or producing first-pass examples for a Codex/OpenAI-model reviewer to verify. This is plausible but should remain experimental until proven against repo-specific evals.

6. GitHub Action as CI feedback.

Use `openai/codex-action@v1` or GitHub `@codex review` for PR-facing JSDoc feedback. This is useful for review visibility and automated reminders, but it should come after local deterministic checks and repo-native scripts are stable.

## Tradeoffs And Risks

- `/review` and GitHub Codex review are useful second opinions, not enforcement. They may miss repo-specific JSDoc semantics unless `AGENTS.md`, skills, and prompt files are kept narrow and current.
- Hooks can improve discipline but have incomplete coverage. Official docs explicitly warn that `PreToolUse` does not intercept all shell calls and does not intercept web search or every non-shell/non-MCP path. Several parsed fields fail open today.
- Project-local rules and hooks depend on project trust. If a developer's Codex session does not trust the repo layer, repo-local `.codex` policy may not load.
- `AGENTS.md` is strong but finite. The 32 KiB default project-doc cap means the repo should keep review guidance compact and link to patterns/skills instead of pasting the entire JSDoc standard into root instructions.
- Subagents increase token and runtime cost. Codex only spawns them explicitly, and each worker performs its own model/tool work. The CSV fan-out path is documented as experimental.
- The Codex SDK is already present, but it wraps the CLI and depends on CLI behavior. It is a good orchestration surface for internal tooling, but the report should not assume long-term API stability beyond the installed version and current docs.
- Local Qwen workers are plausible for read-only analysis, but tool-call compatibility is the hardest unknown. Qwen docs show OpenAI-compatible chat-completions examples and Qwen-specific function-calling protocols, while Codex custom model providers document `wire_api = "responses"` as the only supported custom-provider protocol. Built-in `ollama` and `lmstudio` reduce setup friction, but this report did not run or validate any model.
- Local model quality may be uneven on repo-specific Effect v4, schema annotation, and TSDoc grammar expectations. A model that can generate plausible code may still produce examples that fail `bun run docgen` or add noisy `@param` prose the repo forbids.
- Hardware and latency are material. Qwen3-Coder-30B-A3B and Next-Base are much more plausible than 480B-A35B for local work, but even the smaller candidates may need quantization, GPU memory, and provider-specific tuning.
- Data handling differs by provider. Truly local workers reduce third-party exposure, but hosted external models or remote proxies introduce separate terms, security posture, and audit requirements.
- Agent-generated JSDoc can create false confidence. The repo should require deterministic compilation and inventory checks after any generated documentation patch.

## Recommendation

Adopt a deterministic-first, Codex-assisted workflow.

The near-term enforcement core should be `jsdoc:inventory`, package docgen analysis/checks, `bun run docgen`, and the existing `.patterns/jsdoc-documentation.md` plus `jsdoc-annotation-specialist` skill. Codex should consume those facts and help remediate them, not decide whether the repo is compliant from scratch.

Recommended tiering:

1. Tier 0: deterministic scanners and gates.

Keep the inventory JSON/Markdown and docgen outputs as the authoritative queue. Normalize each finding into a compact work item with package, file, export, missing tags, grammar issues, schema annotation gaps, and relevant command to verify.

2. Tier 1: Codex/OpenAI worker for scoped remediation.

Use `codex exec --json` or `@openai/codex-sdk` from `@beep/repo-cli` to run one package or one bounded batch at a time. Require structured output for findings and patch summaries. Give workers the JSDoc skill, the relevant pattern excerpt, the exact inventory rows, and strict verification commands. Allow writes only in remediation mode, not discovery mode.

3. Tier 2: Codex subagents for parallel evidence and review.

Use read-only subagents to split inventory exploration, semantic review, and external API/doc verification. Keep `max_threads` low at first. Use the CSV fan-out idea only after the inventory work-item schema is stable, because that API is experimental.

4. Hooks and rules: support the workflow, do not define it.

Use hooks for session context, prompt-shape guardrails, post-edit reminders, and stop-time verification nudges. Use rules to prevent obviously unsafe commands. Do not rely on hooks as the only enforcement boundary.

5. `/review` and GitHub review: use as final advisory surfaces.

Add compact JSDoc review guidelines to `AGENTS.md` when the initiative is ready to promote doctrine. Then use `/review`, app review comments, or `@codex review` to catch high-signal issues after deterministic checks pass or when a PR needs a second reviewer.

6. Local models: research lane only for now.

Do not put Qwen/local workers in the required enforcement path yet. The only defensible first experiment is read-only triage against existing inventory rows, with no filesystem writes, no direct acceptance into CI, and a repo-specific eval comparing local-model findings against deterministic scanner output and human-reviewed Codex/OpenAI output. Promote local models only if they reliably preserve repo-specific rules: compilable examples, no noisy conditional tags, correct Effect imports, correct schema annotations, and no unsafe examples.

The best implementation posture is boring on purpose: deterministic policy discovers the problem, Codex orchestrates or repairs with narrow context, docgen proves the result, and local models remain optional accelerators until measured.

## Open Questions

- Should this initiative add a top-level `AGENTS.md` `## Review guidelines` section for JSDoc, or should JSDoc review guidance remain skill-only until enforcement stabilizes?
- What should be the canonical machine-readable work-item schema: current inventory JSON, `beep docgen analyze` output, a new normalized queue, or a combination?
- Should the first Codex automation use `codex exec --json` for simplicity or the TypeScript SDK inside `@beep/repo-cli` for stronger typed orchestration?
- What is the smallest safe write scope for a remediation worker: one export, one file, one package, or one package batch?
- Which verification command is required per tier: `bun run jsdoc:inventory`, package `docgen check`, `bun run docgen:affected`, full `bun run docgen`, or the broader repo quality gate?
- How should hook installation be handled when project-local hooks require trusted `.codex` config and explicit `codex_hooks` enablement?
- What eval set would be sufficient before a local Qwen worker can graduate from curiosity to optional triage helper?
- If local models are tested, should they run through built-in `ollama` / `lmstudio`, through a Responses-compatible proxy, or outside Codex as a separate summarizer whose output Codex reviews?
- How should the initiative prevent agent-generated JSDoc from optimizing for tag presence while degrading usefulness for humans and future agents?
