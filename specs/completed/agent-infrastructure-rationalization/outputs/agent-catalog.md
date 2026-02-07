# Agent Catalog

> P0 Inventory - Complete agent registry with metadata
> Generated: 2026-02-03

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Agents Found | 31 |
| In Sync (Manifest + Files) | 18 |
| Orphaned (Files Only) | 11 |
| Missing (Manifest Only) | 2 |

---

## Tier Distribution

| Tier | Count | Role |
|------|-------|------|
| Tier 1 (Foundation) | 3 | Meta-learning, foundational patterns |
| Tier 2 (Research) | 6 | External/internal research, documentation lookup |
| Tier 3 (Quality) | 4 | Guidelines enforcement, architecture validation |
| Tier 4 (Writers) | 8 | Code/docs/tests generation, file modifications |
| Unmanifested | 11 | Domain experts, specialized knowledge agents |

---

## Capability Distribution

| Capability | Count | Description |
|------------|-------|-------------|
| read-only | 6 | Explore, analyze - no artifacts |
| write-reports | 5 | Produces markdown reports |
| write-files | 12 | Creates/modifies source files |
| unmanifested | 8 | No capability metadata |

---

## Complete Agent Table

### Tier 1: Foundation Agents

| Agent | Lines | Size | Capability | Tools | Triggers |
|-------|-------|------|------------|-------|----------|
| codebase-researcher | 210 | 5.4KB | read-only | Glob, Grep, Read | explore codebase, find files, map dependencies |
| reflector | 365 | 14.1KB | write-reports | Glob, Grep, Read | analyze reflection, extract patterns, meta-reflection |
| prompt-refiner | 406 | 12.3KB | write-files | Glob, Grep, Read, Write, Edit | refine prompt, improve agent |

### Tier 2: Research Agents

| Agent | Lines | Size | Capability | Tools | Triggers |
|-------|-------|------|------------|-------|----------|
| mcp-researcher | 392 | 10.9KB | read-only | MCP tools, Read, Glob, Grep | effect docs, effect api, effect pattern |
| web-researcher | 371 | 9.0KB | read-only | WebSearch, WebFetch | research online, best practices, prior art |
| effect-researcher | 408 | 12.5KB | read-only | Glob, Grep, Read, MCP tools | effect question, effect help |
| effect-predicate-master | 351 | 10.4KB | read-only | Glob, Grep, Read, MCP tools | predicate, type guard, refinement |
| ai-trends-researcher | 187 | 5.6KB | write-files | WebSearch, WebFetch, Read, Glob, Grep, Write, Edit | ai trends, emerging patterns |
| effect-schema-expert* | N/A | N/A | read-only | Glob, Grep, Read, MCP tools | schema design, schema validation |

*Missing implementation file

### Tier 3: Quality Agents

| Agent | Lines | Size | Capability | Tools | Triggers |
|-------|-------|------|------------|-------|----------|
| code-reviewer | 172 | 4.7KB | write-reports | Read, Grep, Glob | review code, check violations |
| architecture-pattern-enforcer | 273 | 7.4KB | write-reports | Glob, Grep, Read | architecture audit, layer violations |
| spec-reviewer | 281 | 9.8KB | write-reports | Glob, Grep, Read | review spec, spec quality |
| tsconfig-auditor | 306 | 11.7KB | write-reports | Glob, Grep, Read | tsconfig audit, typescript config |

### Tier 4: Writer Agents

| Agent | Lines | Size | Capability | Tools | Triggers |
|-------|-------|------|------------|-------|----------|
| doc-writer | 229 | 5.3KB | write-files | Glob, Grep, Read, Write, Edit | write documentation, create readme |
| test-writer | 411 | 11.9KB | write-files | Read, Write, Edit, Glob, Grep, MCP tools | write tests, add test coverage |
| jsdoc-fixer | 258 | 5.5KB | write-files | Glob, Grep, Read, Write, Edit | fix jsdoc, add jsdoc |
| package-error-fixer | 96 | 5.6KB | write-files | Glob, Grep, Read, Write, Edit, Bash | fix errors, fix types |
| agents-md-updater | 164 | 5.3KB | write-files | Glob, Grep, Read, Write, Edit | update agents.md |
| readme-updater | 219 | 6.0KB | write-files | Glob, Grep, Read, Write, Edit | update readme |
| code-observability-writer* | N/A | N/A | write-files | Read, Edit, Write, Grep, Glob, MCP tools | add logging, add tracing |

*Missing implementation file

---

## Orphaned Agents (Not in Manifest)

These agents exist on disk but lack manifest entries:

| Agent | Lines | Size | Probable Tier | Probable Capability |
|-------|-------|------|---------------|---------------------|
| codebase-explorer | 145 | 4.3KB | 1 | read-only |
| documentation-expert | 200 | 6.6KB | 4 | write-files |
| domain-modeler | 233 | 8.7KB | 2 | read-only |
| effect-expert | 343 | 10.4KB | 2 | read-only |
| effect-platform | 222 | 8.9KB | 2 | read-only |
| lawyer | 361 | 13.6KB | 3 | write-reports |
| mcp-enablement | 281 | 6.6KB | utility | N/A |
| observability-expert | 294 | 8.8KB | 4 | write-files |
| react-expert | 286 | 9.0KB | 2 | read-only |
| schema-expert | 311 | 8.7KB | 2 | read-only |
| wealth-management-domain-expert | 183 | 7.5KB | 2 | read-only |

---

## Issues Identified

### Critical

1. **Missing Files** (manifest entry but no file):
   - `code-observability-writer`
   - `effect-schema-expert`

2. **Orphaned Files** (file exists but no manifest entry):
   - 11 agents representing 35% of total

### Redundancy Candidates

| Current Agents | Potential Consolidation |
|----------------|------------------------|
| codebase-researcher + codebase-explorer | Single exploration agent |
| effect-researcher + effect-expert + effect-schema-expert + effect-predicate-master | Unified Effect expert |
| doc-writer + agents-md-updater + readme-updater | Single documentation agent |
| observability-expert + code-observability-writer | Single observability agent |
| schema-expert + effect-schema-expert | Single schema agent |

---

## Recommendations

1. **Audit orphaned agents**: Add to manifest or deprecate
2. **Restore missing files**: Create implementations for manifest-only entries
3. **Consolidate redundant agents**: Reduce from 31 to 15-18
4. **Establish naming conventions**: `{domain}-{capability}` pattern
5. **Add usage tracking**: Monitor which agents are actually invoked
