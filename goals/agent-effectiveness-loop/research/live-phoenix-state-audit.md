# Live Phoenix State Audit

## Scope

Audit date: 2026-05-16.

Live target: `https://dankserver.tailc7c348.ts.net:8447`.

This audit used read-only HTTP header probes, GraphQL read queries, and GraphQL
schema introspection only. No Phoenix mutation operations were executed.

## Repo Contract

- The initiative README identifies Phoenix as the primary observability and
  evaluation surface for the agent-effectiveness loop, with the live tailnet UI
  at `/projects` and explicit read-only access for research
  (`goals/agent-effectiveness-loop/README.md:9-16`,
  `goals/agent-effectiveness-loop/README.md:29-32`).
- The specification allows only sanitized research evidence: project names,
  aggregate counts, feature availability, schema/attribute/command names, hashed
  identifiers already accepted by the AI metrics privacy contract, and links to
  repo/public docs. It forbids raw prompt, response, transcript, tool payload,
  private path, secret, raw span payload, and unreviewed exception text
  (`goals/agent-effectiveness-loop/SPEC.md:68-89`).
- The manifest declares read-only live Phoenix access, the projects URL, the
  GraphQL URL, and the sanitization boundary for this lane
  (`goals/agent-effectiveness-loop/ops/manifest.json:19-24`).
- Phase 0 explicitly requires research artifacts to cite sources, keep live
  Phoenix evidence sanitized/read-only, and avoid production, infra, timer,
  deployment, or agent-config changes
  (`goals/agent-effectiveness-loop/SPEC.md:106-117`).
- The deployed stack config pins Phoenix to `arizephoenix/phoenix:15.5.0` on
  tailnet HTTPS port `8447`, with the `dankserver.tailc7c348.ts.net` FQDN
  (`infra/Pulumi.beep-ai-metrics-dankserver.yaml:5-7`,
  `infra/Pulumi.beep-ai-metrics-dankserver.yaml:13`).

## Live Availability

| Probe | Sanitized result |
| --- | --- |
| `HEAD /` | HTTP 200 over HTTP/2; `x-phoenix-server-version: 15.5.0` |
| `HEAD /projects` | HTTP 200 over HTTP/2; `x-phoenix-server-version: 15.5.0` |
| GraphQL smoke query | `__typename` returned `Query` |
| GraphQL `serverStatus` | `insufficientStorage: false` |

The live version header matches the pinned stack image version.

## Aggregate State

GraphQL aggregate counts:

| Surface | Count |
| --- | ---: |
| Projects | 2 |
| Datasets | 0 |
| Prompts | 0 |
| Custom evaluators | 0 |

First-page read queries for datasets, prompts, evaluators, and annotation
configs returned empty edge lists.

## Projects

| Project | Has traces | Records | Traces | Annotation names |
| --- | --- | ---: | ---: | --- |
| `default` | yes | 10,305,782 | 343 | trace/span/session names empty |
| `beep-jsdoc-worker-eval` | yes | 118 | 4 | trace/span/session names empty |

The `beep-jsdoc-worker-eval` project is expected from the worker-eval packet:
that packet documents opt-in Phoenix export with the same tailnet base URL and
project name, and notes sanitized spans for that run
(`goals/jsdoc-worker-eval/README.md:37-46`,
`goals/jsdoc-worker-eval/README.md:88-89`).

## Feature Availability

Observed GraphQL query fields include:

- project inventory and lookup: `projects`, `projectCount`,
  `projectsLastUpdatedAt`, `getProjectByName`
- trace lookup: `getTraceByOtelId`, `getSpanByOtelId`,
  `getProjectSessionById`
- dataset inventory: `datasets`, `datasetCount`, `datasetLabels`,
  `datasetSplits`
- prompt inventory: `prompts`, `promptCount`, `promptLabels`
- evaluator inventory: `evaluators`, `evaluatorCount`, `builtInEvaluators`,
  `classificationEvaluatorConfigs`
- annotation config inventory: `annotationConfigs`
- trace retention and health: `defaultProjectTraceRetentionPolicy`,
  `projectTraceRetentionPolicies`, `serverStatus`
- model/provider surfaces: `modelProviders`, `generativeModels`,
  `playgroundModels`

Observed mutation schema names show Phoenix supports project, dataset, prompt,
evaluator, annotation, experiment, trace, API-key, and user administration
workflows. These schema names were observed by introspection only; none were
called.

Observed project attributes useful for sanitized future audits include:

- `name`, `hasTraces`, `recordCount`, `traceCount`
- `traceAnnotationsNames`, `spanAnnotationNames`,
  `sessionAnnotationNames`, `documentEvaluationNames`
- `spans`, `sessions`, `trace`
- `spanCountTimeSeries`, `traceCountTimeSeries`,
  `traceCountByStatusTimeSeries`
- `tokenCountTotal`, `tokenCountPrompt`, `tokenCountCompletion`
- `costSummary`, `latencyMsQuantile`, `spanLatencyMsQuantile`

Built-in evaluator names currently available through GraphQL:

- `contains`
- `exact_match`
- `regex`
- `levenshtein_distance`
- `json_distance`

## Audit Readout

Phoenix is live and queryable on the expected tailnet URL, reports version
`15.5.0`, and has two trace-bearing projects. The live state is trace-heavy but
not yet enriched with Phoenix-native datasets, prompts, custom evaluators, or
annotation configs.

For the agent-effectiveness loop, the immediate read-only opportunity is to use
existing project-level aggregate counts and annotation-name inventories as
health signals while keeping raw traces out of research artifacts. Any future
dataset, prompt, evaluator, annotation, or experiment work should be a separate
implementation phase because the current Phase 0 contract forbids mutating
Phoenix state.

## Sanitization Notes

Included evidence is limited to project names, aggregate counts, feature
availability, schema/attribute names, version headers, and repo-relative source
citations. This artifact intentionally excludes raw prompts, outputs,
transcript text, tool payloads, raw span payloads, private paths, secrets,
resolved credential references, trace IDs, span IDs, and exception text.
