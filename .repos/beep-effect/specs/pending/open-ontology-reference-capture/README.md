# Open Ontology Reference Capture

> Systematically capture every page, component, and interaction state from the [Open Ontology](https://open-ontology.com) application into a structured Notion database, creating an exhaustive UI/feature reference for implementing similar capabilities in `apps/todox` and `packages/knowledge`.

---

## Purpose

Open Ontology is a production ontology management application with features directly relevant to TodoX's knowledge graph capabilities (schema management, entity browsing, SPARQL queries, graph visualization, AI chat). This spec defines a systematic workflow for another Claude Code instance to:

1. Navigate every page in the Open Ontology app using Claude in Chrome
2. Capture exhaustive screenshots of every page state, component state, and interaction
3. Create rich Notion database entries with structured metadata, feature mappings, and component inventories
4. Produce a reference library that accelerates TodoX implementation

## Success Criteria

- [ ] All 20 Open Ontology pages have entries in the Notion "Web References" database
- [ ] Each entry has a populated inline "Component Inventory" database
- [ ] Every component has exhaustive state screenshots (default, hover, open, loading, empty, error, etc.)
- [ ] Feature mapping tables link each Open Ontology feature to a TodoX package/slice
- [ ] GIFs captured for key interactive flows (drag-and-drop, dropdown interactions, graph navigation)

## Tools Required

- **Playwright MCP** (`mcp__playwright__*`) — primary browser automation, element-level screenshots via CSS selectors
- **Claude in Chrome** (`mcp__claude-in-chrome__*`) — GIF recording only (all screenshots use Playwright)
- **Notion Plugin** (`mcp__plugin_Notion_notion__*`) — database entries, page content, inline databases

## Notion Database Context

| Resource | ID |
|----------|------|
| Parent page | `2c569573-788d-8087-850d-c46260c2b647` |
| Database | `30069573-788d-804a-9cee-d1a6eeffa460` |
| Web References data source | `collection://30069573-788d-8001-bcea-000b74c4c50a` |
| Page States data source | `collection://bd3bf088-316a-49eb-8707-3849af87bff6` |

## Open Ontology Pages (20 total)

All pages are under: `https://open-ontology.com/databases/lively-birch-keeping-autumn`

| # | Page | Path Suffix | TodoX Relevance |
|---|------|-------------|-----------------|
| 1 | Stats | `/` (root) | Knowledge graph dashboard |
| 2 | Schema | `/schema` | Ontology management UI |
| 3 | Explorer | `/explorer` | Entity/relation browsing |
| 4 | Builder | `/ontology-builder` | Ontology class/property creation |
| 5 | Attributes | `/attributes` | Property management |
| 6 | Objects | `/objects` | Entity management |
| 7 | Links | `/links` | Relation management |
| 8 | Actions | `/actions` | Workflow triggers |
| 9 | Rules | `/rules` | SHACL validation rules |
| 10 | Violations | `/violations` | Rule violation tracking |
| 11 | Tasks | `/tasks` | Task management |
| 12 | Workflows | `/workflows` | Workflow definitions |
| 13 | Forms | `/forms` | Dynamic form builder |
| 14 | Views | `/views` | Custom view definitions |
| 15 | Files | `/files` | File/document management |
| 16 | Inbox | `/inbox` | Notification center |
| 17 | Queries | `/queries` | SPARQL query interface |
| 18 | Console | `/console` | Developer console |
| 19 | Chat | `/chat` | AI assistant with graph context |
| 20 | Settings | `/settings` | Database configuration |

## Phase Plan

| Phase | Scope | Pages | Est. Work Items | Est. Duration |
|-------|-------|-------|-----------------|---------------|
| **P1** | Pilot — validate workflow with Stats page | 1 | 5 | 1-2 hours |
| **P2** | Core Knowledge — Schema, Explorer, Builder, Attributes | 4 | 5 | 4-6 hours |
| **P3** | Data Management — Objects, Links, Rules, Violations | 4 | 5 | 4-6 hours |
| **P4** | Query & AI — Queries, Console, Chat, Views | 4 | 5 | 4-6 hours |
| **P5** | Workflow — Actions, Tasks, Workflows, Forms | 4 | 5 | 4-6 hours |
| **P6** | Admin — Files, Inbox, Settings + review pass | 3+review | 6 | 4-6 hours |

## Related Documents

| Document | Purpose |
|----------|---------|
| `QUICK_START.md` | Concise workflow for capturing a single page |
| `templates/page-content.template.md` | Notion page content template |
| `documentation/todox/PRD.md` | TodoX product requirements |
| `handoffs/HANDOFF_P1.md` | Phase 1 pilot capture context |
| `handoffs/P1_ORCHESTRATOR_PROMPT.md` | Copy-paste prompt to start Phase 1 |
| `MASTER_ORCHESTRATION.md` | Full workflow specification for all 6 phases |
| `AGENT_PROMPTS.md` | Index of 3 specialized sub-agent prompts |
