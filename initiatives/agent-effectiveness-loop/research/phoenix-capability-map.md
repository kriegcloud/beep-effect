# Phoenix Capability Map

## Scope

This artifact maps Phoenix capabilities from official Phoenix documentation to
coding-agent effectiveness opportunities for this repo. It is intentionally
public-doc sourced and sanitized: it does not include private trace payloads,
prompt text, response text, home paths, source paths, secrets, or private
Phoenix instance URLs.

Primary source index: <https://arize.com/docs/phoenix/llms.txt>

## Executive Read

Phoenix is an open-source AI observability and evaluation platform built on
OpenTelemetry and OpenInference. Its strongest fit for this initiative is not
"more dashboards"; it is a repeatable evidence loop for coding-agent behavior:
trace agent runs, organize them by project/session, label failure modes, turn
good and bad cases into datasets, run deterministic and LLM-as-judge evals, and
compare prompt/config/workflow changes before changing agent defaults.

For this repo, the highest-leverage Phoenix paths are:

- Use tracing, sessions, and annotations to explain where coding agents spend
  time, fail, loop, or recover.
- Use datasets, experiments, and server-side evaluators to turn recurring repo
  tasks into a regression harness.
- Use client-side TypeScript/Python evals for repo-specific checks that are too
  semantic for unit tests but too important for informal review.
- Use CLI/MCP/skills as operator and assistant access paths, while keeping
  mutation permissions constrained during research.
- Use production controls, retention, RBAC, secrets, and self-hosting posture to
  preserve the repo's privacy boundary.

## Capability Matrix

| Phoenix capability | Official source URLs | What Phoenix provides | Coding-agent improvement path for this repo | Adoption notes |
| --- | --- | --- | --- | --- |
| Tracing over OpenTelemetry and OpenInference | <https://arize.com/docs/phoenix>, <https://arize.com/docs/phoenix/tracing/llm-traces>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing> | Trace capture for model calls, retrieval, tool use, custom logic, latency, token usage, exceptions, prompts, tool schemas, and function calls. Phoenix accepts OTLP and supports Python, TypeScript, and Java instrumentation. | Make coding-agent runs inspectable as execution traces: root agent task, tool calls, shell commands, model calls, retries, subagent work, and error recovery. This can reveal which repo workflows confuse agents and where guidance or automation should change. | Treat Phoenix as the evidence surface, not the repo semantics owner. Use sanitized attributes and existing privacy rules before exporting spans. |
| Projects | <https://arize.com/docs/phoenix/tracing/llm-traces/projects>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing/setup-projects> | Projects separate traces by environment, application, initiative, experiment, or team and provide dedicated evaluation spaces. | Create separate project boundaries for agent research lanes, worker evals, prompt/config experiments, and production-like telemetry so unrelated traces do not pollute the same metrics. | Project naming should be stable and non-sensitive. Avoid raw task text in project names. |
| Sessions | <https://arize.com/docs/phoenix/tracing/llm-traces/sessions>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing/setup-sessions> | Sessions group related traces across multi-turn conversations, expose a chat-like view, and aggregate token usage and latency per conversation. | Model a coding-agent thread as a session so later review can inspect the full task arc: user request, investigation, edits, verification, interruptions, and final status. | Use hashed or generated session identifiers rather than private thread titles. |
| Metadata and span customization | <https://arize.com/docs/phoenix/tracing/how-to-tracing/add-metadata>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/add-metadata/customize-spans>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/advanced/modifying-spans>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/advanced/masking-span-attributes> | Custom attributes, tags, session IDs, user IDs, prompt template metadata, span processors, suppression, and masking controls. | Add sanitized repo-relevant dimensions such as task class, package family, verification command class, model/provider family, tool category, and outcome label. This enables queryable patterns without exposing raw code or prompts. | Define an allowlist before instrumentation. Prefer coarse labels over raw payload capture. |
| Annotations and feedback | <https://arize.com/docs/phoenix/tracing/llm-traces/how-to-annotate-traces>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/capture-feedback> | Human, end-user, LLM, and code annotations with labels, scores, explanations, metadata, and identifiers attached to spans. Annotations can be added from UI, client, or REST API. | Establish a controlled label set for coding-agent outcomes: completed, blocked, wrong-package, privacy-risk, verification-missing, compile-fail, review-fix, over-broad-edit, and similar failure modes. Attach labels to spans or sessions to build longitudinal evidence. | For Phase 0, read-only. Future write flows need explicit configs and privacy review. |
| Evals on traces | <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/evaluating-phoenix-traces>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/llm-evaluations>, <https://arize.com/docs/phoenix/evaluation/how-to-evals/using-evals-with-phoenix> | Export trace datasets from Phoenix, run code or LLM evals, and log results back as annotations. Eval results are treated as automated annotations. | Mine sanitized traces for agent failure modes, run repeatable evals against those traces, and log pass/fail or rubric scores back to Phoenix. This is the bridge from observability to a measurable agent-improvement loop. | Never evaluate raw private prompts externally. If using LLM judges, feed sanitized summaries or approved derived fields. |
| Client-side LLM evals | <https://arize.com/docs/phoenix/evaluation/llm-evals>, <https://arize.com/docs/phoenix/evaluation/how-to-evals>, <https://arize.com/docs/phoenix/evaluation/how-to-evals/custom-llm-evaluators>, <https://arize.com/docs/phoenix/evaluation/how-to-evals/configuring-the-llm> | Python and TypeScript eval SDKs, model adapters, LLM-as-judge evaluators, structured output via tool calling, built-in explanations, rate-limit handling, retries, batching, dynamic concurrency, and evaluator tracing. | Build rubrics for semantic behaviors that repo tests cannot catch: whether the agent followed architecture doctrine, stayed within scope, gave a truthful final status, preserved user changes, selected the right package owner, and named missing verification honestly. | Judge prompts are themselves code-like artifacts. Version and test them. Prefer small rubrics with auditable explanations. |
| Client-side code evals | <https://arize.com/docs/phoenix/evaluation/how-to-evals/code-evaluators>, <https://arize.com/docs/phoenix/evaluation/how-to-evals/batch-evaluations>, <https://arize.com/docs/phoenix/evaluation/pre-built-metrics> | Deterministic evaluators in Python or TypeScript using functions, score objects, exact match, regex, Levenshtein, JSON distance, precision/recall, and custom heuristics. Batch dataframe evaluation is available in Python. | Encode cheap, deterministic checks for agent artifacts: required sections present, no forbidden private patterns, exact command summaries included, diff only touches assigned files, source URLs present, or expected labels emitted. | Put deterministic checks before LLM judges. They are cheaper, faster, and easier to trust in CI-style loops. |
| Server-side evals | <https://arize.com/docs/phoenix/evaluation/server-evals/overview>, <https://arize.com/docs/phoenix/evaluation/server-evals/input-mapping>, <https://arize.com/docs/phoenix/evaluation/server-evals/pre-built-metrics>, <https://arize.com/docs/phoenix/evaluation/server-evals/llm-evaluators> | UI-configured dataset evaluators that run server-side on every Playground experiment. Supports built-in code evaluators and Phoenix-managed LLM evaluators with reusable input mapping. | Attach standard evals to repo-agent datasets so every prompt/model/workflow experiment gets the same scoring suite without each operator reconfiguring evals locally. | Current docs scope automatic server evals to Playground experiments on datasets; programmatic experiments should pass evaluators explicitly. |
| Datasets | <https://arize.com/docs/phoenix/datasets-and-experiments/overview-datasets>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/creating-datasets>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/updating-datasets>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/exporting-datasets> | Versioned collections of examples with inputs, optional references, metadata, CSV/Pandas/object upload, trace-to-dataset curation, stable IDs with diff updates, CSV export, fine-tuning JSONL, and OpenAI Evals JSONL export. | Curate golden datasets for recurring coding-agent tasks: docs-only research, package-local fixes, JSDoc compliance, review-thread resolution, schema modeling, and verification reporting. Use stable hashed IDs so datasets can update without losing experiment links. | Dataset examples must be sanitized and reviewed. Do not store raw private prompts, responses, paths, or source snippets unless explicitly allowed by the initiative privacy contract. |
| Experiments | <https://arize.com/docs/phoenix/datasets-and-experiments/overview-datasets>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/using-evaluators>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/repetitions>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/splits> | Run task functions against datasets, compare outputs and eval results, attach evaluators, run repetitions for probabilistic systems, and use splits for hard examples, train/validation/test, or focused evaluation. | Compare prompt/config/model changes against the same agent task set before changing repo guidance. Repetitions are especially useful for agentic variability; splits can isolate hard tasks like architecture-boundary decisions or review cleanup. | Use small, high-signal datasets first. Experiments should answer one decision at a time. |
| Background experiments | <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments-in-background> | Playground experiments can keep running after the browser is closed and survive server restarts. | Useful for longer repo-agent benchmarks that should not depend on an operator keeping a browser open. | Keep Phase 0 research read-only; use this later if an approved dataset/experiment workflow exists. |
| Prompt management | <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts>, <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompt-management>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/create-a-prompt>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/tag-a-prompt> | Prompt creation, storage, modification, version history, tags such as production/staging/development, and audit trail for prompt changes. | Treat repo-agent system prompts, evaluator rubrics, and operator prompts as versioned experimental artifacts. Tags can represent approved repo guidance versus candidate variants. | Phoenix docs warn that client libraries for prompts are early; do not make production agent behavior depend on remote prompt fetch without caching/fallback. |
| Prompt Playground | <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompt-playground>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/test-a-prompt>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/configure-ai-providers> | Interactive prompt IDE for prompt text, models, invocation parameters, tools, output formats, datasets, traces, and experiments. Playground runs are recorded as traces and experiments. | Let operators test candidate guidance and evaluator prompts against golden repo-agent examples before putting them into agent config or docs. | Playground is excellent for research and comparison; production repo guidance should still land in version-controlled artifacts. |
| Span replay | <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/span-replay> | Load stored LLM spans into Playground and replay them with changed prompt text, model parameters, or providers. | For a failed agent decision, replay only the relevant LLM step with a safer prompt or model to see whether the failure is prompt-sensitive, model-sensitive, or caused by missing repo context. | Replay requires care because span inputs may contain private data. Use sanitized or approved spans only. |
| Prompts in code and provider tools | <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompts-in-code>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/using-a-prompt>, <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/use-provider-tools> | Python and TypeScript clients can create/update prompts, pull by name/version/tag, format variables, and support tool calling, response formats, and provider-hosted tools. | Possible future path for repo-local tooling that fetches evaluator prompts or operator prompt templates while keeping tags aligned to approved versions. | For coding agents, remote prompt dependency is a reliability risk. Prefer local checked-in prompts unless Phoenix prompt management adds clear value. |
| Metrics dashboard | <https://arize.com/docs/phoenix/tracing/llm-traces/metrics> | Per-project metrics dashboard for trace latency/errors, latency quantiles, annotation score time series, cost over time, top models by cost/tokens, token usage, LLM invocations/errors, and tool calls/errors. | Track whether agent changes actually reduce latency, error rate, tool-call failures, and cost per successful task. Annotation score time series can show whether guidance changes improve outcomes over time. | Phoenix project metrics are good for operator review; custom repo scorecards may still belong in repo-owned analytics. |
| Cost tracking | <https://arize.com/docs/phoenix/tracing/how-to-tracing/cost-tracking> | Automatic token-based cost calculation from OpenInference token/model attributes, built-in model pricing, custom model pricing, and rollups at trace, span, session, experiment, and project levels. | Identify expensive failure patterns such as long loops, repeated failed tool calls, high-reasoning spans, or model choices that do not improve task success. Tie cost to outcome labels rather than optimizing cost alone. | Ensure instrumentation emits token counts and model/provider names. Configure custom prices for non-built-in or local model providers. |
| Export, query, and import trace data | <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/extract-data-from-spans>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/exporting-annotated-spans>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/importing-existing-traces> | Span dataframe export, query DSL, filtering by metadata and eval results, joining parent/child spans, annotated-span export, and loading saved OpenInference trace datasets. | Build sanitized offline reports and regression datasets from Phoenix without giving broad UI access. Query only needed fields and export derived metrics or approved annotations. | Export paths are powerful privacy choke points. Make the export schema explicit and reviewed. |
| ATIF agent trajectory import | <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/importing-atif-trajectories> | Upload ATIF-compatible agent trajectories from tools such as Harbor, Claude Code, OpenHands, and other frameworks. Converter builds AGENT/LLM/TOOL span hierarchies, supports subagent nesting, and merges continuations. | Import sanitized coding-agent trajectories from offline runs to visualize parent/subagent delegation and long-context continuations without requiring live instrumentation first. | Strong fit for read-only research if ATIF export can be sanitized before upload. |
| Phoenix CLI for coding assistants | <https://arize.com/docs/phoenix/integrations/developer-tools/coding-agents>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/retrieve-traces-via-cli> | `@arizeai/phoenix-cli` exposes `px` commands for projects, traces, sessions, formatting, annotations, recent-trace retrieval, and assistant-friendly output. | Give operators and agents a terminal-native, scriptable way to fetch recent traces, failed traces, sessions, and annotations for debugging and report generation. | Prefer read-only CLI usage initially. Store endpoint/project/API key in local env, never committed config. |
| Phoenix MCP servers | <https://arize.com/docs/phoenix/integrations/developer-tools/coding-agents>, <https://arize.com/docs/phoenix/integrations/phoenix-mcp-server> | Docs MCP searches Phoenix docs. Phoenix MCP connects assistants to projects, traces, spans, sessions, annotation configs, prompts, datasets, experiments, and annotations. | Docs MCP helps agents use Phoenix APIs correctly. Phoenix MCP can support operator workflows like trace triage, prompt lookup, and experiment review from inside coding assistants. | Direct Phoenix MCP can mutate prompts/datasets in some flows. Use read-only discipline or limited credentials until write workflows are approved. |
| Phoenix skills | <https://arize.com/docs/phoenix/integrations/developer-tools/coding-agents> | Installable skills via `npx skills add Arize-ai/phoenix`; advertised skills include `phoenix-cli`, `phoenix-evals`, and `phoenix-tracing`, with support for agents including Claude Code, Cursor, Windsurf, Codex, GitHub Copilot, Cline, OpenCode, and Gemini CLI. | Add reusable agent instructions for Phoenix CLI, evals, and tracing once this initiative chooses an approved workflow. This can reduce repeated setup mistakes across agents. | Do not install or alter agent config during Phase 0 unless explicitly requested. Capture candidate skill usage in a later implementation plan. |
| MCP tracing in Python and TypeScript | <https://arize.com/docs/phoenix/integrations/python/mcp-tracing>, <https://arize.com/docs/phoenix/integrations/typescript/mcp/mcp-tracing-typescript> | OpenInference instrumentation for MCP clients and servers, including client-to-server interactions under one trace hierarchy. | If repo tooling exposes MCP servers or coding agents consume MCP tools, trace MCP boundaries to see which tool calls drive success, retries, slowdowns, or errors. | Useful for future tool-level diagnostics. Keep payload masking strict. |
| TypeScript SDK availability | <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing>, <https://arize.com/docs/phoenix/evaluation/how-to-evals>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments>, <https://arize.com/docs/phoenix/integrations/developer-tools/coding-agents> | TypeScript packages include `@arizeai/phoenix-otel`, `@arizeai/phoenix-client`, `@arizeai/phoenix-evals`, `@arizeai/phoenix-cli`, and `@arizeai/phoenix-mcp`; docs state installed packages ship docs/source in `node_modules`. | This repo can keep most future automation in TypeScript/Bun/Node workflows where it already has repo tooling, using installed package docs as version-matched references. | Verify actual installed package APIs before implementation. Phoenix docs note some client prompt features are early. |
| Python SDK availability | <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing>, <https://arize.com/docs/phoenix/evaluation/how-to-evals>, <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/extract-data-from-spans>, <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/creating-datasets> | Python SDKs cover tracing setup through `phoenix.otel`, Phoenix client APIs, dataframe export/query workflows, dataset creation, evals, and batch dataframe evaluation. | Python is useful for analysis notebooks, dataframe-heavy export/review, and batch evaluation pipelines. TypeScript should still be preferred for repo-integrated CLI commands when parity exists. | If Python is used, keep generated reports sanitized and avoid notebook-only state as the sole evidence path. |
| Production and self-hosting | <https://arize.com/docs/phoenix/self-hosting>, <https://arize.com/docs/phoenix/production-guide>, <https://arize.com/docs/phoenix/self-hosting/configuration>, <https://arize.com/docs/phoenix/environments> | Phoenix can run in Cloud, container, notebook, terminal, Docker, Kubernetes, Helm, AWS, and Railway. Self-hosting is full-featured and keeps data in your infrastructure. Production guidance covers batch processing, gRPC transport, memory/disk scaling, PostgreSQL, and backups. | Keep sensitive agent telemetry inside the controlled Phoenix deployment. Use production guidance to keep ingestion reliable if agent traces become a routine repo operation. | Pin container versions in production, plan backups and restore drills, and prefer gRPC/batch processing for sustained ingest. |
| Security, auth, retention, and secrets | <https://arize.com/docs/phoenix/settings/access-control-rbac>, <https://arize.com/docs/phoenix/settings/api-keys>, <https://arize.com/docs/phoenix/settings/data-retention>, <https://arize.com/docs/phoenix/settings/secrets>, <https://arize.com/docs/phoenix/self-hosting> | RBAC roles include admin, member, and viewer; API keys include system keys, user keys, and admin secret; retention can purge traces by time or count; secrets store encrypted provider credentials when `PHOENIX_SECRET` is configured. | Use viewer/read-only access for research agents, system keys for approved automation, explicit retention for trace-heavy projects, and admin-managed secrets for Playground/eval provider credentials. | A viewer role is the safest default for audits. Production secrets need `PHOENIX_SECRET`; retention defaults should be reviewed before large-scale trace ingestion. |

## Repo-Specific Capability Clusters

### 1. Observe Coding-Agent Work

Phoenix tracing, projects, sessions, metrics, and cost tracking can make agent
work inspectable without relying on anecdotal final answers. The useful unit is
not just "model call"; it is the full coding loop: task intake, repo search,
tool selection, edits, tests, review handling, and final report.

Candidate repo benefits:

- identify slow or expensive task families;
- detect repeated failed tool-call patterns;
- compare model/provider choices by outcome and cost;
- distinguish repo-guidance failures from model/tool/runtime failures;
- review long-running agent sessions without reading raw transcripts.

### 2. Label and Score Outcomes

Annotations are the central bridge from raw observability to agent improvement.
Phoenix supports human, LLM, and code annotations with labels, scores, and
metadata. For this repo, the first useful annotation taxonomy should be small,
operational, and privacy-safe.

Candidate labels:

- `completed`
- `blocked`
- `verification-missing`
- `wrong-architecture-home`
- `over-broad-edit`
- `user-change-risk`
- `private-data-risk`
- `review-thread-incomplete`
- `test-failure-fixed`
- `test-failure-unresolved`

These labels can later become scorecard dimensions, dataset filters, and eval
targets.

### 3. Turn Repeated Work Into Datasets

Phoenix datasets and experiments are the strongest path from "interesting trace"
to "repeatable proof." The repo can curate sanitized examples for recurring
agent jobs and use experiments to compare candidate changes.

Good first datasets should be narrow:

- docs-only research artifact tasks;
- JSDoc/schema compliance review tasks;
- package-boundary classification tasks;
- review-feedback triage tasks;
- final-answer truthfulness and verification-reporting tasks.

Each example should include only sanitized input fields, expected behavior,
allowed source references, metadata labels, and an expected outcome rubric.

### 4. Evaluate Agent Changes Before Shipping Them

Client-side code evals should handle deterministic gates such as file-scope
limits, required citations, forbidden private patterns, required verification
fields, or exact JSON/report shape. LLM evals should handle semantic judgments
such as "did the agent respect architecture doctrine?" or "does the final answer
truthfully describe the verification state?"

Server-side dataset evaluators are attractive once Phoenix datasets exist
because they run automatically on Playground experiments. For programmatic repo
experiments, pass evaluators explicitly to the Phoenix client APIs.

### 5. Improve Operator Workflows

Phoenix CLI, Docs MCP, Phoenix MCP, and Phoenix skills give coding agents and
operators direct ways to fetch recent traces, inspect sessions, look up docs,
and review experiments. The safest order is:

1. CLI read-only retrieval for traces/sessions.
2. Docs MCP for version-independent documentation lookup.
3. Skills for consistent Phoenix operating instructions.
4. Direct Phoenix MCP only after credentials and mutation boundaries are clear.

### 6. Preserve Privacy and Reliability

Phoenix is compatible with this initiative only if it stays inside the privacy
contract. Self-hosting, RBAC, API keys, retention policies, secrets management,
span masking, and sanitized export schemas are not optional implementation
details; they are part of the capability map.

Required guardrails for future implementation:

- no raw prompt/response/transcript/tool payloads in research artifacts;
- no private local paths or private service URLs in reports;
- allowlisted span attributes only;
- read-only credentials for research agents;
- retention policies before large trace ingestion;
- tested backup/restore posture for any production dependency;
- local fallback/no-op behavior when Phoenix is unavailable.

## Recommended First Uses

1. Build a sanitized trace review report that uses Phoenix CLI/export data and
   repo-owned labels, without mutating Phoenix.
2. Define a tiny annotation taxonomy for coding-agent outcomes and map it to
   existing scorecard language.
3. Create one sanitized dataset for a recurring agent task class and pair it
   with deterministic code evals before adding LLM judges.
4. Use experiments to compare one prompt/config/workflow change against that
   dataset.
5. Consider Phoenix MCP and skills only after the read-only CLI workflow proves
   useful.

## Source URLs

- Phoenix documentation index: <https://arize.com/docs/phoenix/llms.txt>
- Phoenix overview: <https://arize.com/docs/phoenix>
- Tracing overview: <https://arize.com/docs/phoenix/tracing/llm-traces>
- Projects: <https://arize.com/docs/phoenix/tracing/llm-traces/projects>
- Sessions: <https://arize.com/docs/phoenix/tracing/llm-traces/sessions>
- Annotations: <https://arize.com/docs/phoenix/tracing/llm-traces/how-to-annotate-traces>
- Tracing setup: <https://arize.com/docs/phoenix/tracing/how-to-tracing/setup-tracing>
- Trace annotations and feedback: <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations>
- Evals on traces: <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/evaluating-phoenix-traces>
- Log evaluation results: <https://arize.com/docs/phoenix/tracing/how-to-tracing/feedback-and-annotations/llm-evaluations>
- Metrics dashboard: <https://arize.com/docs/phoenix/tracing/llm-traces/metrics>
- Cost tracking: <https://arize.com/docs/phoenix/tracing/how-to-tracing/cost-tracking>
- Importing and exporting traces: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces>
- Export data and query spans: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/extract-data-from-spans>
- Exporting annotated spans: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/exporting-annotated-spans>
- Import existing traces: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/importing-existing-traces>
- Import ATIF trajectories: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/importing-atif-trajectories>
- Retrieve traces via CLI: <https://arize.com/docs/phoenix/tracing/how-to-tracing/importing-and-exporting-traces/retrieve-traces-via-cli>
- Evaluation overview: <https://arize.com/docs/phoenix/evaluation/llm-evals>
- Client-side evals: <https://arize.com/docs/phoenix/evaluation/how-to-evals>
- Code evaluators: <https://arize.com/docs/phoenix/evaluation/how-to-evals/code-evaluators>
- Batch evaluations: <https://arize.com/docs/phoenix/evaluation/how-to-evals/batch-evaluations>
- Using evals with Phoenix: <https://arize.com/docs/phoenix/evaluation/how-to-evals/using-evals-with-phoenix>
- Server evals: <https://arize.com/docs/phoenix/evaluation/server-evals/overview>
- Server eval input mapping: <https://arize.com/docs/phoenix/evaluation/server-evals/input-mapping>
- Server eval pre-built metrics: <https://arize.com/docs/phoenix/evaluation/server-evals/pre-built-metrics>
- Datasets and experiments overview: <https://arize.com/docs/phoenix/datasets-and-experiments/overview-datasets>
- Creating datasets: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/creating-datasets>
- Updating datasets: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/updating-datasets>
- Exporting datasets: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-datasets/exporting-datasets>
- Run experiments: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments>
- Using evaluators in experiments: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/using-evaluators>
- Dataset evaluators: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/how-to-dataset-evaluators>
- Repetitions: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/repetitions>
- Splits: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/splits>
- Background experiments: <https://arize.com/docs/phoenix/datasets-and-experiments/how-to-experiments/run-experiments-in-background>
- Prompts overview: <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts>
- Prompt management: <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompt-management>
- Prompt playground: <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompt-playground>
- Span replay: <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/span-replay>
- Prompts in code: <https://arize.com/docs/phoenix/prompt-engineering/overview-prompts/prompts-in-code>
- Create a prompt: <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/create-a-prompt>
- Test a prompt: <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/test-a-prompt>
- Tag a prompt: <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/tag-a-prompt>
- Use a prompt: <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/using-a-prompt>
- Use provider tools: <https://arize.com/docs/phoenix/prompt-engineering/how-to-prompts/use-provider-tools>
- Coding agents: <https://arize.com/docs/phoenix/integrations/developer-tools/coding-agents>
- Phoenix MCP server: <https://arize.com/docs/phoenix/integrations/phoenix-mcp-server>
- TypeScript MCP tracing: <https://arize.com/docs/phoenix/integrations/typescript/mcp/mcp-tracing-typescript>
- Python MCP tracing: <https://arize.com/docs/phoenix/integrations/python/mcp-tracing>
- Self-hosting: <https://arize.com/docs/phoenix/self-hosting>
- Production guide: <https://arize.com/docs/phoenix/production-guide>
- Environments: <https://arize.com/docs/phoenix/environments>
- Self-hosting configuration: <https://arize.com/docs/phoenix/self-hosting/configuration>
- Access control: <https://arize.com/docs/phoenix/settings/access-control-rbac>
- API keys: <https://arize.com/docs/phoenix/settings/api-keys>
- Data retention: <https://arize.com/docs/phoenix/settings/data-retention>
- Secrets: <https://arize.com/docs/phoenix/settings/secrets>
