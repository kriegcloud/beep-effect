# Additional direct test projects

Production discovery adds four direct `test/tsconfig.json` projects beyond the
287 root check/test overlays measured in the spike: infra, repo-configs,
lint-rules and repo-cli. Full Check executes all 291.

The early CLI probe found three extra new-rule locations:

| File (original line) | Rule | Repair |
| --- | --- | --- |
| packages/tooling/tool/cli/test/claude-hook-root.test.ts:24 | preferEffectRecord | Object.values → R.values |
| packages/tooling/tool/cli/test/effect-vitest-contract.test.ts:634 | preferEffectArray | Array.join → A.join |
| packages/tooling/tool/cli/test/observability-catalog.test.ts:103 | preferEffectArray | Array.join → A.join |

It also reproduced the inherited AgentMessage.runtime.test.ts:322
strictEffectProvide error. A preserved 0.51.1 compiler already reports that
same location. The three extra new-rule sites are fixed; their focused tests
pass (49 tests across three files).

The final full lane checks 291 projects and 72,975 file visits. It reports
exactly one strictEffectProvide occurrence and zero new-rule findings. Coverage
checks reject missing plugins and incomplete responses, so every reported
project passed those completeness conditions.
