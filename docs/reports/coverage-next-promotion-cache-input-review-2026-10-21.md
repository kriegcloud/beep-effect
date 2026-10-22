# Coverage cache-input reconciliation after the next main promotion

Reviewed 2026-10-21 against merged checkout `8acd556c48`, retaining main's 2,386 executable tasks and 175 review subjects, including new npm-spec, tsconfig and walker workspaces. No task identity, dependency edge, cache setting or qualification is added or removed.

Canonical audit identifies 185 blocking configuration drifts and 19 Turbo source-digest reviews. Canonical native census proves exactly 201 effective configuration changes: 173 test tasks add only BEEP_COVERAGE_INVOCATION_ID and BEEP_COVERAGE_RUNTIME_RECEIPT to hashed env; 28 root tasks add only ignored nested-worktree exclusion !.claude/worktrees/** to inputs (12 cached blockers and 16 noncached rows). Existing environment/input entries remain; commands/digests, dependencies, outputs, pass-through environment and all other fields remain exactmain.

The 19 sources are root plus 18 child Turbo configurations. Children differ from main only by schema URL v2-11-9 to v2-11-10. Reversing that URL and the listed environment/exclusion additions makes root configuration semantically exactmain. Main's four removed drivers stay removed; all promoted packages and new main task/dependency changes remain.

No cache reuse qualification is granted. Coverage producers still force fresh test execution and validate same-process runtime receipts. Scope, profile, epoch, global configuration and qualification ledger remain unchanged. This record extends the prior reviewed input contract to current main; old proof files remain byte-identical.

Prior complete coverage/driver-removal review: `docs/reports/coverage-driver-removal-cache-input-review-2026-10-21.md`, SHA-256 `2a1c61b29c8c3c42ea578f59235ad5dd0c6e38ed4f685d23257ff566b8a57bbb`. That retained document binds the earlier combined coverage/tsgo and promoted-package proofs as well as the main driver-removal basis.

Qualification ledger SHA-256 `13067bf343f413b4cc99b4cefca3ce7d094a1f09247a54ffc20114e766d4d2bb`.

## Exact changed task identities

| Task | Reviewed change |
| --- | --- |
| `//#changeset:status` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#config-sync:check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:audit:check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:boundaries:advisory` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:boundaries:config-check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:dead-code:check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:fix-preview:advisory` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:flags:advisory` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:health:advisory` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:health:check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#fallow:security:advisory` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#jsdoc:inventory:check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#knowledge:refs-check` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#knowledge:semantic-delta` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:identity-registry` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:jsdoc:root` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:opaque-roundtrips` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:oxlint` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:package-scripts` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:retired-effect-paths` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:schema-first` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:shadcn` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#lint:typos` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:changeset-graph` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:sherif` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:syncpack` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#repo-sanity:versions` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `//#topo-sort` | Add only ignored nested-worktree exclusion `!.claude/worktrees/**` to inputs. |
| `@beep/acp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/agents-client#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/agents-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/agents-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/agents-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/agents-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ai-provider-cli#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ai-sync#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/anthropic#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/api-docs#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/api-transport#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-client#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-config#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-proof#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-ui#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/box#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/box-provisioning#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/brand#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/chalk#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ciops#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/codegen-kit#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/colors#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/commands#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/cosmos#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/data#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/db-admin#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/discord#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/doc-text#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/dock#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/dock-react#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/docket-intake#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/documents-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/documents-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/documents-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/documents-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/drizzle#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/duckdb#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ecfr#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/editor#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/effect-drizzle#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-client#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-config#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-ui#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/exiftool#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/fc-runs#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ffmpeg#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/file-processing#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/freshbooks#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/git#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/github-commands#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/github-references#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/glob#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/gov-legal-mcp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/govinfo#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/graph-3d#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/html#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/hubspot#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/identity#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/infra#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/jsonc#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/jsonl#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/langextract#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/lejeune-bolt-workbench#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/lexical-schema#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/libpff#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/lint-rules#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/m365#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/m365-mcp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/managed-section#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/mcp-kit#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/mcpb-kit#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/md#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/memfs#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/n3#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/nlp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/nlp-mcp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/nlp-processing#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/npm-spec#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/obs#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/observability#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/occt#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/oip-web#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/onepassword-cli#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-client#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-config#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-ui#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/openai#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/openai-compat#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/openclaw#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/oxigraph#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/pacer#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/palantiri#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/pandoc-ast#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/pdf-tools#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/pglite#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/phoenix#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/poppler#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/postgres#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-claude-mod#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-gateway#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-identify#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-kg-mcp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-m365-contacts#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-mail-tagging#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-review-hub#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/practice-setup#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/pretext#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/professional-desktop#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/provenance#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/public-site#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/qa-capture#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/rdf#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/rdf-canonize#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/repo-ai-metrics#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/repo-cli#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/repo-configs#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/repo-docgen#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/repo-utils#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/runpod#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/sanity#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/schema#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/schema-org#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/semantic-web#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/semantica#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/semver#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/shacl#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/shared-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/shared-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/shared-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/skill-contract#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/spdx#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/storybook#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/t3-code#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/tailscale#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/technical-drawing#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/tesseract#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/test-runner#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/test-utils#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/tika#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/todox#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/toml#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/trustgraph-workbench#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/tsconfig#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/types#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/ui#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/uspto#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/uspto-mcp#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/utils#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/walker#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/windows-secrets#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/wink#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-domain#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-server#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-tables#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-use-cases#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/xstate#test` | Add only the two coverage runtime receipt keys to hashed env. |
| `@beep/yaml#test` | Add only the two coverage runtime receipt keys to hashed env. |

## Source digest identities

- `apps/docket-intake/turbo.json`.
- `apps/labs/api-docs/turbo.json`.
- `apps/labs/ciops/turbo.json`.
- `apps/oip-web/turbo.json`.
- `apps/practice-claude-mod/turbo.json`.
- `apps/practice-identify/turbo.json`.
- `apps/practice-m365-contacts/turbo.json`.
- `apps/practice-mail-tagging/turbo.json`.
- `apps/practice-review-hub/turbo.json`.
- `apps/practice-setup/turbo.json`.
- `apps/professional-desktop/turbo.json`.
- `apps/storybook/turbo.json`.
- `apps/todox/turbo.json`.
- `packages/foundation/modeling/identity/turbo.json`.
- `packages/foundation/primitive/types/turbo.json`.
- `packages/tooling/library/ai-sync/turbo.json`.
- `packages/tooling/policy-pack/repo-configs/turbo.json`.
- `packages/tooling/tool/cli/turbo.json`.
- `turbo.json`.
