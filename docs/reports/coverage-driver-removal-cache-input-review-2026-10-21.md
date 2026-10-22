# Coverage cache-input reconciliation after main driver removal

Reviewed 2026-10-21 against merged checkout `95bddb041a` and the provisional exact-main baseline.

Main removed unused driver workspaces @beep/face-detection, @beep/firecrawl, @beep/venice-ai and @beep/xai, and added/promoted other workspaces. Its 2,347 executable task identities are retained exactly: this reconciliation adds or removes no task and preserves main's removed-workspace dependency cleanup. Global configuration, four-task scope, profile, epoch and qualification ledger are unchanged.

The merged source inherits the existing coverage branch input contract. Canonical audit identifies 182 blocking configuration drifts and 19 source-digest reviews, with 171 affected package/root subjects. Native canonical census confirms 198 effective node changes: 170 test environment lists add exactly BEEP_COVERAGE_INVOCATION_ID and BEEP_COVERAGE_RUNTIME_RECEIPT without removals; 28 root tasks add only the ignored nested-checkout exclusion !.claude/worktrees/**. Of the root input changes, 12 cached tasks block audit while 16 noncached task changes are recorded under the same root subject. No command, command digest, dependency edge, cache flag, outputs, pass-through environment or other configuration field changes.

The 19 Turbo source digests cover root and 18 child configurations. Each child file is byte-identical to main after reversing only its schema URL v2-11-10 to v2-11-9. Root additionally contains exactly the reviewed environment/input additions listed below. These source URL changes do not expand effective policy.

No qualification is granted. Producers still force fresh coverage execution and verify same-process runtime receipts. Existing reviewed proof bytes are preserved. This record composes main's driver-removal topology with prior coverage/tsgo and promoted-package input reviews, rather than reinstating removed drivers or replacing a main failure with weaker settings.

## Prior proof retained

- `docs/reports/driver-removal-cache-review-2026-10-21.md` SHA-256 `e2eb9a820af94ff67953ffe7a8359873406c9d91d1ef1e3e54ed58d43c43c2a4`.
- `docs/reports/coverage-and-tsgo-cache-input-review-2026-10-21.md` SHA-256 `22d1b009277ba07351a45e5e928374ab67fc024468f1b438371d9ecde9e08508`.
- `docs/reports/coverage-promoted-package-cache-input-review-2026-10-21.md` SHA-256 `e301e1de01ecbcc6e8733403f5f8c0a79d23d505c2547642b19adf92001d3f11`.

Qualification ledger `standards/cache-qualification.json` remains SHA-256 `13067bf343f413b4cc99b4cefca3ce7d094a1f09247a54ffc20114e766d4d2bb`.

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
| `@beep/acp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/agents-client#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/agents-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/agents-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/agents-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/agents-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ai-provider-cli#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ai-sync#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/anthropic#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/api-docs#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/api-transport#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-client#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-config#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-proof#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-ui#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/architecture-lab-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/box#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/box-provisioning#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/brand#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/chalk#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ciops#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/codegen-kit#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/colors#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/commands#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/cosmos#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/data#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/db-admin#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/discord#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/doc-text#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/dock#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/dock-react#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/docket-intake#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/documents-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/documents-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/documents-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/documents-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/drizzle#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/duckdb#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ecfr#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/editor#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/effect-drizzle#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-client#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-config#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-ui#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/epistemic-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/exiftool#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/fc-runs#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ffmpeg#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/file-processing#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/freshbooks#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/git#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/github-commands#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/github-references#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/glob#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/gov-legal-mcp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/govinfo#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/graph-3d#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/html#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/hubspot#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/identity#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/infra#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/jsonc#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/jsonl#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/langextract#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/law-practice-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/lejeune-bolt-workbench#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/lexical-schema#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/libpff#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/lint-rules#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/m365#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/m365-mcp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/managed-section#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/mcp-kit#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/mcpb-kit#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/md#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/memfs#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/n3#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/nlp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/nlp-mcp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/nlp-processing#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/obs#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/observability#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/occt#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/oip-web#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/onepassword-cli#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-client#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-config#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-ui#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ontology-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/openai#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/openai-compat#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/openclaw#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/oxigraph#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/pacer#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/palantiri#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/pandoc-ast#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/pdf-tools#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/pglite#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/phoenix#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/poppler#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/postgres#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-claude-mod#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-gateway#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-identify#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-kg-mcp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-m365-contacts#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-mail-tagging#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-review-hub#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/practice-setup#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/pretext#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/professional-desktop#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/provenance#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/public-site#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/qa-capture#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/rdf#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/rdf-canonize#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/repo-ai-metrics#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/repo-cli#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/repo-configs#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/repo-docgen#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/repo-utils#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/runpod#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/sanity#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/schema#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/schema-org#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/semantic-web#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/semantica#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/semver#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/shacl#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/shared-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/shared-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/shared-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/skill-contract#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/spdx#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/storybook#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/t3-code#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/tailscale#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/technical-drawing#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/tesseract#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/test-runner#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/test-utils#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/tika#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/todox#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/toml#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/trustgraph-workbench#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/types#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/ui#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/uspto#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/uspto-mcp#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/utils#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/windows-secrets#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/wink#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-domain#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-server#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-tables#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/workspace-use-cases#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/xstate#test` | Add two coverage runtime receipt keys to hashed env. |
| `@beep/yaml#test` | Add two coverage runtime receipt keys to hashed env. |

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
