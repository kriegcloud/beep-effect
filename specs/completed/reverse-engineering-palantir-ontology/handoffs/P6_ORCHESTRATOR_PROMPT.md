# Phase 6 Orchestrator Prompt — Knowledge Graph Construction

Copy-paste this prompt to start Phase 6.

## Context

Phases 1-5 are complete. We have:
- `outputs/p1-schema-design/kg-schema-design.md` — approved KG schema
- `outputs/p2-web-research/master.json` — cumulative WebResearchLink data
- `outputs/p4b-repo-analysis/*.json` — per-repo RepoAnalysisResult data
- `outputs/p5-rag-enrichment/enriched-web.json` — RAG-extracted entities, relationships, and insights
- `outputs/manifest.json` — unified index of all outputs

Now we build the actual knowledge graph in Graphiti.

## Your Mission

Design and implement a script that ingests all extracted data into Graphiti, creating a rich, queryable knowledge graph of Palantir's Ontology system.

### Steps

1. **Review the KG schema** (`outputs/p1-schema-design/kg-schema-design.md`) — this defines entity types and relationship types

2. **Review Graphiti's API:**
   - Graphiti MCP is running at `http://localhost:8000/mcp`
   - Available MCP tools: `add_memory`, `search_nodes`, `search_memory_facts`, `get_episodes`, `get_entity_edge`, `delete_entity_edge`, `delete_episode`, `clear_graph`
   - Use `group_id: "palantir-ontology"` for ALL entries (separate from `beep-dev`)
   - Graphiti processes episodes and extracts entities + relationships automatically via LLM

3. **Design the ingestion strategy:**

   **Web Research Data (master.json + enriched-web.json):**
   - For each entry, create an episode via `add_memory`:
     - `name`: entry title
     - `episode_body`: Combine summary + key insights + technical details into a rich text narrative
     - `source`: "text"
     - `source_description`: category + content type + URL
     - `group_id`: "palantir-ontology"
   - If the entry has `extractedEntities` and `extractedRelationships` from P5, include them in the episode body so Graphiti can extract them

   **Repo Analysis Data (p4b-repo-analysis/*.json):**
   - For each repo, create an episode via `add_memory`:
     - `name`: "Repository Analysis: {repo-name}"
     - `episode_body`: Combine summary + ontology concepts + API surface + architecture patterns into structured text
     - `source`: "json"
     - `source_description`: "Palantir open-source repo analysis"
     - `group_id`: "palantir-ontology"

4. **Implement the ingestion script:**
   - Write a script (Python recommended — direct HTTP to MCP endpoint) that:
     - Reads all source JSONs
     - Iterates through entries, creating episodes
     - Handles rate limiting (Graphiti uses LLM for entity extraction — don't overwhelm it)
     - Logs success/failure for each entry
     - Implements retry logic for transient failures
   - Save script to `outputs/p6-graph-pipeline/construct-graph.{py|ts}`
   - Save logs to `outputs/p6-graph-pipeline/ingestion-log.json`

5. **Run the ingestion** in batches:
   - Batch 1: High-quality entries (quality >= 4) — verify graph looks good
   - Batch 2: Medium-quality entries (quality 2-3)
   - Batch 3: Repo analysis entries
   - After each batch, spot-check the graph via `search_nodes` and `search_memory_facts`

6. **Update manifest.json** with final counts

### Graphiti MCP Protocol

Graphiti uses HTTP-based MCP (JSON-RPC 2.0). To call tools:

```python
import requests
import json

def call_graphiti_tool(tool_name, arguments):
    # Step 1: Initialize session
    init_resp = requests.post("http://localhost:8000/mcp", json={
        "jsonrpc": "2.0", "method": "initialize", "id": 1,
        "params": {"protocolVersion": "2024-11-05", "capabilities": {},
                   "clientInfo": {"name": "graph-builder", "version": "1.0"}}
    })

    # Step 2: Call tool
    tool_resp = requests.post("http://localhost:8000/mcp", json={
        "jsonrpc": "2.0", "method": "tools/call", "id": 2,
        "params": {"name": tool_name, "arguments": arguments}
    })
    return tool_resp.json()
```

Or use the MCP tools directly if running within Claude Code.

## Critical Constraints

- Use `group_id: "palantir-ontology"` for ALL entries — do NOT pollute `beep-dev`
- Graphiti calls LLM for entity extraction — expect ~$0.05-0.50 per episode; budget accordingly
- Process episodes sequentially within each batch (Graphiti processes same group_id sequentially)
- Add delays between episodes (2-5 seconds) to avoid overwhelming the LLM
- No coding standards required — pragmatic implementation only
- If the graph already has data from a previous partial run, clear it first: `clear_graph(group_ids=["palantir-ontology"])`

## Success Criteria

- [ ] Ingestion script implemented and tested
- [ ] All web research entries ingested as episodes
- [ ] All repo analysis entries ingested as episodes
- [ ] Graph contains entities matching KG schema entity types
- [ ] Graph contains relationships between entities
- [ ] `search_nodes` returns results for all 9 core Palantir concepts
- [ ] Ingestion log saved with success/failure counts
- [ ] Manifest updated

### Handoff Document

Read full context in: `specs/pending/reverse-engineering-palantir-ontology/handoffs/HANDOFF_P6.md`
